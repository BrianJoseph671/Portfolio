import { useState, useEffect, useMemo } from 'react'

const LEVEL_CLASS = {
  NONE: 'gh-contrib-l0',
  FIRST_QUARTILE: 'gh-contrib-l1',
  SECOND_QUARTILE: 'gh-contrib-l2',
  THIRD_QUARTILE: 'gh-contrib-l3',
  FOURTH_QUARTILE: 'gh-contrib-l4',
}

const BALL_STEP_MS = 18
const BALL_SPEED_X = 1
const BALL_SPEED_Y = 1
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

export function GitHubContributionGrid() {
  const [data, setData] = useState(null)
  const [loadError, setLoadError] = useState(false)
  const [runState, setRunState] = useState('idle')
  const [clearedCells, setClearedCells] = useState(() => new Set())
  const [ball, setBall] = useState(null)
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
      setBall((prev) => {
        if (!prev) return prev

        let nextX = prev.x + prev.vx
        let nextY = prev.y + prev.vy
        let nextVx = prev.vx
        let nextVy = prev.vy

        if (nextX <= 0 || nextX >= numWeeks - 1) {
          nextVx = -nextVx
          nextX = Math.max(0, Math.min(numWeeks - 1, nextX))
        }
        if (nextY <= 0 || nextY >= numRows - 1) {
          nextVy = -nextVy
          nextY = Math.max(0, Math.min(numRows - 1, nextY))
        }

        const hitWi = Math.round(nextX)
        const hitDi = Math.round(nextY)
        const hitKey = `${hitWi},${hitDi}`
        if (!nameMask.has(hitKey)) {
          setClearedCells((current) => {
            if (current.has(hitKey)) return current
            const next = new Set(current)
            next.add(hitKey)
            return next
          })
        }

        return { x: nextX, y: nextY, vx: nextVx, vy: nextVy }
      })
    }, BALL_STEP_MS)

    return () => window.clearInterval(timer)
  }, [data, isReducedMotion, nameMask, numRows, numWeeks, runState])

  useEffect(() => {
    if (runState !== 'running') return
    if (clearedCells.size < clearTargets.length) return
    setRunState('done')
    setBall(null)
  }, [clearTargets.length, clearedCells, runState])

  const handleRelease = () => {
    if (runState !== 'idle' || !data?.weeks?.length) return
    setClearedCells(new Set())
    setBall({ x: 0, y: 0, vx: BALL_SPEED_X, vy: BALL_SPEED_Y })
    setRunState('running')
  }

  const handleReset = () => {
    setRunState('idle')
    setBall(null)
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
    isReducedMotion ? 'gh-contrib-reduced-static' : '',
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
                '--ball-x': String(ball.x),
                '--ball-y': String(ball.y),
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
