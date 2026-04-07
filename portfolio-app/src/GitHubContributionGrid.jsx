import { useState, useEffect, useMemo, useRef } from 'react'

const LEVEL_CLASS = {
  NONE: 'gh-contrib-l0',
  FIRST_QUARTILE: 'gh-contrib-l1',
  SECOND_QUARTILE: 'gh-contrib-l2',
  THIRD_QUARTILE: 'gh-contrib-l3',
  FOURTH_QUARTILE: 'gh-contrib-l4',
}

const BALL_STEP_MS = 16
const BALL_SPEED_MIN = 0.075
const BALL_SPEED_MAX = 0.112
const RUN_TIMEOUT_MS = 60_000
const REFRESH_MS = 5 * 60 * 1000

/** Minimal 5×7 glyphs; I is 3 cols. Rows top → bottom = day index 0 → 6 in each week column. */
const GLYPH_B = ['11110', '10001', '10001', '11110', '10001', '10001', '11110']
const GLYPH_R = ['11110', '10001', '10001', '11110', '10100', '10010', '10001']
const GLYPH_I = ['111', '010', '010', '010', '010', '010', '111']
const GLYPH_A = ['01110', '10001', '10001', '11111', '10001', '10001', '10001']
const GLYPH_N = ['10001', '11001', '10101', '10101', '10011', '10001', '10001']

function buildBrianPatternRows() {
  const glyphs = [GLYPH_B, GLYPH_R, GLYPH_I, GLYPH_A, GLYPH_N]
  const rows = []
  for (let i = 0; i < 7; i++) {
    rows.push(glyphs.map((g) => g[i]).join('0'))
  }
  return rows
}

const BRIAN_PATTERN_ROWS = buildBrianPatternRows()
const PATTERN_WIDTH = BRIAN_PATTERN_ROWS[0]?.length ?? 0

/**
 * @param {number} numWeeks
 * @returns {Set<string>} keys "weekIndex,dayIndex"
 */
function makeBrianMask(numWeeks) {
  const mask = new Set()
  if (!PATTERN_WIDTH || numWeeks < 1) return mask
  const offsetX = Math.max(0, Math.floor((numWeeks - PATTERN_WIDTH) / 2))
  for (let di = 0; di < 7; di++) {
    const row = BRIAN_PATTERN_ROWS[di] || ''
    for (let ci = 0; ci < row.length; ci++) {
      if (row[ci] !== '1') continue
      const wi = offsetX + ci
      if (wi >= 0 && wi < numWeeks) mask.add(`${wi},${di}`)
    }
  }
  return mask
}

function clampSpeed(vx, vy) {
  const mag = Math.hypot(vx, vy) || 1
  if (mag < BALL_SPEED_MIN) {
    const f = BALL_SPEED_MIN / mag
    return { x: vx * f, y: vy * f }
  }
  if (mag > BALL_SPEED_MAX) {
    const f = BALL_SPEED_MAX / mag
    return { x: vx * f, y: vy * f }
  }
  return { x: vx, y: vy }
}

function rotate(vx, vy, radians) {
  const c = Math.cos(radians)
  const s = Math.sin(radians)
  return { x: vx * c - vy * s, y: vx * s + vy * c }
}

export function GitHubContributionGrid() {
  const [data, setData] = useState(null)
  const [loadError, setLoadError] = useState(false)
  const [runState, setRunState] = useState('idle')
  const [clearedCells, setClearedCells] = useState(() => new Set())
  const [ball, setBall] = useState(null)
  const [velocity, setVelocity] = useState(null)
  const [activeHit, setActiveHit] = useState('')
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setPrefersReducedMotion(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadContributions = () => {
      const minuteBucket = Math.floor(Date.now() / REFRESH_MS)
      fetch(`/contributions.json?v=${minuteBucket}`, { cache: 'no-store' })
        .then((r) => {
          if (!r.ok) throw new Error(String(r.status))
          return r.json()
        })
        .then((json) => {
          if (!cancelled) {
            setData(json)
            setLoadError(false)
          }
        })
        .catch(() => {
          if (!cancelled) setLoadError(true)
        })
    }

    loadContributions()
    const poll = window.setInterval(loadContributions, REFRESH_MS)

    return () => {
      cancelled = true
      window.clearInterval(poll)
    }
  }, [])

  const numWeeks = data?.weeks?.length ?? 0
  const numRows = 7
  const runStartedAtRef = useRef(0)
  const recentCellsRef = useRef([])
  const nameMask = useMemo(() => makeBrianMask(numWeeks), [numWeeks])
  const clearTargets = useMemo(() => {
    if (!data?.weeks?.length) return []
    const targets = []
    data.weeks.forEach((week, wi) => {
      ;(week.days || []).forEach((_, di) => {
        const key = `${wi},${di}`
        if (!nameMask.has(key)) targets.push(key)
      })
    })
    return targets
  }, [data, nameMask])
  const totalLabel = useMemo(() => {
    if (!data?.weeks?.length) return null
    const total = data.totalContributions
    if (typeof total !== 'number') return null
    return `${total.toLocaleString()} contributions in the last year`
  }, [data])
  const fetchedAtLabel = useMemo(() => {
    if (!data?.fetchedAt) return null
    const stamp = new Date(data.fetchedAt)
    if (Number.isNaN(stamp.getTime())) return null
    return `Updated ${stamp.toLocaleString()}`
  }, [data])

  const isReducedMotion = prefersReducedMotion

  useEffect(() => {
    if (!data?.weeks?.length || isReducedMotion) return
    if (runState !== 'running') return

    const timer = window.setInterval(() => {
      setBall((currentBall) => {
        if (!currentBall || !velocity) return currentBall
        let nextX = currentBall.x + velocity.x
        let nextY = currentBall.y + velocity.y
        let nextVx = velocity.x
        let nextVy = velocity.y

        let bounced = false
        if (nextX <= 0 || nextX >= numWeeks - 1) {
          nextVx = -nextVx
          nextX = Math.max(0, Math.min(numWeeks - 1, nextX))
          bounced = true
        }
        if (nextY <= 0 || nextY >= numRows - 1) {
          nextVy = -nextVy
          nextY = Math.max(0, Math.min(numRows - 1, nextY))
          bounced = true
        }

        const hitWi = Math.round(nextX)
        const hitDi = Math.round(nextY)
        const hitKey = `${hitWi},${hitDi}`
        recentCellsRef.current.push(hitKey)
        if (recentCellsRef.current.length > 28) recentCellsRef.current.shift()
        if (!nameMask.has(hitKey)) {
          setActiveHit(hitKey)
          setClearedCells((current) => {
            if (current.has(hitKey)) return current
            const next = new Set(current)
            next.add(hitKey)
            return next
          })
        }

        if (bounced) {
          const jitter = (Math.random() * 0.34) - 0.17
          const rotated = rotate(nextVx, nextVy, jitter)
          nextVx = rotated.x
          nextVy = rotated.y
        }

        const repeatedCount = recentCellsRef.current.filter((k) => k === hitKey).length
        if (repeatedCount >= 4) {
          const rotated = rotate(nextVx, nextVy, 0.45 * (Math.random() > 0.5 ? 1 : -1))
          nextVx = rotated.x
          nextVy = rotated.y
        }

        const normalized = clampSpeed(nextVx, nextVy)
        setVelocity(normalized)
        return { x: nextX, y: nextY }
      })
    }, BALL_STEP_MS)

    return () => window.clearInterval(timer)
  }, [data, isReducedMotion, numRows, numWeeks, runState, velocity])

  useEffect(() => {
    if (!activeHit) return
    const id = window.setTimeout(() => setActiveHit(''), 120)
    return () => window.clearTimeout(id)
  }, [activeHit])

  useEffect(() => {
    if (runState !== 'running') return
    if (clearedCells.size < clearTargets.length) return
    setRunState('done')
    setBall(null)
    setVelocity(null)
  }, [clearTargets.length, clearedCells, runState])

  useEffect(() => {
    if (runState !== 'running') return
    if (!runStartedAtRef.current) return
    const elapsed = performance.now() - runStartedAtRef.current
    if (elapsed < RUN_TIMEOUT_MS) return
    setRunState('done')
    setBall(null)
    setVelocity(null)
  }, [runState, ball])

  const handleRelease = () => {
    if (runState !== 'idle' || !data?.weeks?.length) return
    if (isReducedMotion) {
      setClearedCells(new Set(clearTargets))
      setRunState('done')
      return
    }
    setClearedCells(new Set())
    runStartedAtRef.current = performance.now()
    recentCellsRef.current = []
    setBall({ x: Math.max(1, numWeeks * 0.2), y: Math.max(1, numRows * 0.35) })
    setVelocity({ x: 0.11, y: 0.08 })
    setRunState('running')
  }

  const handleReset = () => {
    setRunState('idle')
    setBall(null)
    setVelocity(null)
    setActiveHit('')
    setClearedCells(new Set())
  }

  if (loadError) {
    return null
  }

  if (!data) {
    return (
      <div className="mb-8 w-full" aria-hidden>
        <div className="h-[88px] w-full rounded-md gh-contrib-skeleton" />
      </div>
    )
  }

  if (!data.weeks?.length) {
    return (
      <p className="mb-8 text-xs theme-text-muted text-center">
        Contribution chart will appear after the GitHub Action runs and updates{' '}
        <code className="text-[0.7rem] opacity-80">contributions.json</code>.
      </p>
    )
  }

  const gridShellClass = [
    'gh-contrib-grid-shell',
    runState === 'running' ? 'gh-contrib-pinball-running' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const ariaLabel = isReducedMotion
    ? totalLabel
      ? `Decorative contribution squares forming the name Brian. Based on ${totalLabel}.`
      : 'Decorative contribution squares forming the name Brian.'
    : totalLabel
      ? `Animated GitHub contribution calendar: release a pinball to clear squares and reveal the name Brian. ${totalLabel}.`
      : 'Animated GitHub contribution calendar: release a pinball to clear squares and reveal the name Brian.'

  return (
    <div className="mb-8 w-full flex flex-col items-center gap-2">
      <div className="w-full pb-1" role="img" aria-label={ariaLabel}>
        <div className={gridShellClass}>
          {runState === 'running' && ball ? (
            <span
              className="gh-contrib-ball"
              aria-hidden
              style={{
                left: `${(ball.x / Math.max(numWeeks - 1, 1)) * 100}%`,
                top: `${(ball.y / Math.max(numRows - 1, 1)) * 100}%`,
                '--trail-x': `${Math.max(0, -velocity?.x || 0) * 18}px`,
                '--trail-y': `${(-velocity?.y || 0) * 10}px`,
              }}
            />
          ) : null}
          <div
            className="gh-contrib-grid gh-contrib-grid-fluid flex w-full gap-[3px]"
            style={{
              '--contrib-cols': String(numWeeks),
              '--contrib-rows': String(numRows),
            }}
          >
            {data.weeks.map((week, wi) => (
              <div key={wi} className="flex min-w-0 flex-1 flex-col gap-[3px]">
                {(week.days || []).map((day, di) => {
                  const level = day.level || 'NONE'
                  const cls = LEVEL_CLASS[level] || LEVEL_CLASS.NONE
                  const inName = nameMask.has(`${wi},${di}`)
                  const isCleared = clearedCells.has(`${wi},${di}`)
                  return (
                    <span
                      key={day.date}
                      className={[
                        'gh-contrib-cell rounded-[2px]',
                        cls,
                        activeHit === `${wi},${di}` ? 'gh-contrib-cell-hit' : '',
                        !inName && isCleared ? 'gh-contrib-cell-cleared' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      title={`${day.date}: ${day.count ?? 0} contribution${(day.count ?? 0) === 1 ? '' : 's'}`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      {totalLabel ? (
        <div className="flex items-center justify-center gap-2 text-[11px] theme-text-muted text-center flex-wrap">
          <span>{totalLabel}</span>
          {fetchedAtLabel ? <span className="opacity-80">{fetchedAtLabel}</span> : null}
          <button
            type="button"
            onClick={handleRelease}
            disabled={runState !== 'idle'}
            className="gh-contrib-control"
          >
            Release
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={runState === 'idle'}
            className="gh-contrib-control"
          >
            Reset
          </button>
        </div>
      ) : null}
    </div>
  )
}
