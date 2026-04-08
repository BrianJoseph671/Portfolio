import { useState, useEffect, useMemo, useRef } from 'react'

const LEVEL_CLASS = {
  NONE: 'gh-contrib-l0',
  FIRST_QUARTILE: 'gh-contrib-l1',
  SECOND_QUARTILE: 'gh-contrib-l2',
  THIRD_QUARTILE: 'gh-contrib-l3',
  FOURTH_QUARTILE: 'gh-contrib-l4',
}

const SNAKE_STEP_MS = 95
const INITIAL_SNAKE_LENGTH = 4
const REFRESH_MS = 5 * 60 * 1000
const RECENT_HEAD_WINDOW = 24
const DIRECTIONS = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
]

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
  const [snake, setSnake] = useState([])
  const [direction, setDirection] = useState({ x: 1, y: 0 })
  const [growthLeft, setGrowthLeft] = useState(0)
  const [eatenCount, setEatenCount] = useState(0)
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
  const randRef = useRef(Math.random())
  const recentHeadKeysRef = useRef([])
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
  const isReducedMotion = prefersReducedMotion

  useEffect(() => {
    if (!data?.weeks?.length || isReducedMotion) return
    if (runState !== 'running') return

    const timer = window.setInterval(() => {
      setSnake((currentSnake) => {
        if (!currentSnake.length) return currentSnake
        const head = currentSnake[0]
        const validDirs = DIRECTIONS.filter((d) => {
          const nx = head.x + d.x
          const ny = head.y + d.y
          if (!(nx >= 0 && nx < numWeeks && ny >= 0 && ny < numRows)) return false
          const nextKey = `${nx},${ny}`
          if (nameMask.has(nextKey)) return false
          const hitsBody = currentSnake.some((s) => s.x === nx && s.y === ny)
          if (hitsBody) return false
          return true
        })
        if (!validDirs.length) return currentSnake

        const recentHeadKeys = recentHeadKeysRef.current
        const scored = validDirs.map((d) => {
          const nx = head.x + d.x
          const ny = head.y + d.y
          const k = `${nx},${ny}`
          const mobility = DIRECTIONS.reduce((count, md) => {
            const fx = nx + md.x
            const fy = ny + md.y
            if (!(fx >= 0 && fx < numWeeks && fy >= 0 && fy < numRows)) return count
            const futureKey = `${fx},${fy}`
            if (nameMask.has(futureKey)) return count
            if (currentSnake.some((s) => s.x === fx && s.y === fy)) return count
            return count + 1
          }, 0)
          let score = d.x === direction.x && d.y === direction.y ? 2 : 0
          if (!clearedCells.has(k)) score += 3
          if (d.x === -direction.x && d.y === -direction.y) score -= 4
          const revisitIndex = recentHeadKeys.lastIndexOf(k)
          if (revisitIndex !== -1) {
            const age = recentHeadKeys.length - 1 - revisitIndex
            score -= Math.max(1, 4 - Math.min(age, 3))
          }
          score += mobility
          return { d, score, mobility }
        })
        scored.sort((a, b) => b.score - a.score || b.mobility - a.mobility)
        const topScore = scored[0].score
        const scoreTied = scored.filter((s) => s.score === topScore)
        const bestMobility = Math.max(...scoreTied.map((s) => s.mobility))
        const top = scoreTied.filter((s) => s.mobility === bestMobility)
        const pick = top[Math.floor((Math.random() + randRef.current) * 1000) % top.length].d
        setDirection(pick)

        const nextHead = { x: head.x + pick.x, y: head.y + pick.y }
        const nextHeadKey = `${nextHead.x},${nextHead.y}`
        const nextRecent = [...recentHeadKeysRef.current, nextHeadKey]
        recentHeadKeysRef.current = nextRecent.slice(-RECENT_HEAD_WINDOW)

        const grownSnake = [nextHead, ...currentSnake]
        if (growthLeft > 0) {
          setGrowthLeft((g) => Math.max(0, g - 1))
          return grownSnake
        }
        grownSnake.pop()
        return grownSnake
      })
    }, SNAKE_STEP_MS)

    return () => window.clearInterval(timer)
  }, [clearedCells, data, direction, growthLeft, isReducedMotion, nameMask, numRows, numWeeks, runState])

  useEffect(() => {
    if (!activeHit) return
    const id = window.setTimeout(() => setActiveHit(''), 120)
    return () => window.clearTimeout(id)
  }, [activeHit])

  // Authoritative "eat" behavior: whenever the snake head overlaps a non-Brian
  // cell, mark it cleared and grow once.
  useEffect(() => {
    if (runState !== 'running') return
    if (!snake.length) return
    const head = snake[0]
    const headKey = `${head.x},${head.y}`
    if (nameMask.has(headKey)) return
    setClearedCells((current) => {
      if (current.has(headKey)) return current
      const next = new Set(current)
      next.add(headKey)
      setEatenCount((count) => {
        const updated = count + 1
        if (updated % 5 === 0) setGrowthLeft((g) => g + 1)
        return updated
      })
      setActiveHit(headKey)
      return next
    })
  }, [nameMask, runState, snake])

  useEffect(() => {
    if (runState !== 'running') return
    if (clearedCells.size < clearTargets.length) return
    setRunState('done')
    setDirection({ x: 1, y: 0 })
  }, [clearTargets.length, clearedCells, runState])

  const handleRelease = () => {
    if (runState !== 'idle' || !data?.weeks?.length) return
    if (isReducedMotion) {
      setClearedCells(new Set(clearTargets))
      setRunState('done')
      return
    }
    setClearedCells(new Set())
    const startX = Math.max(INITIAL_SNAKE_LENGTH - 1, Math.floor(numWeeks * 0.2))
    const startY = Math.max(1, Math.floor(numRows * 0.4))
    const body = Array.from({ length: INITIAL_SNAKE_LENGTH }, (_, i) => ({ x: startX - i, y: startY }))
    recentHeadKeysRef.current = body.map((seg) => `${seg.x},${seg.y}`)
    setSnake(body)
    setDirection({ x: 1, y: 0 })
    setGrowthLeft(0)
    setEatenCount(0)
    setRunState('running')
  }

  const handleReset = () => {
    setRunState('idle')
    setSnake([])
    setDirection({ x: 1, y: 0 })
    setGrowthLeft(0)
    setEatenCount(0)
    setActiveHit('')
    setClearedCells(new Set())
    recentHeadKeysRef.current = []
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
      ? `Animated GitHub contribution calendar: release a snake to eat non-Brian squares and reveal the name Brian. ${totalLabel}.`
      : 'Animated GitHub contribution calendar: release a snake to eat non-Brian squares and reveal the name Brian.'

  return (
    <div className="mb-8 w-full flex flex-col items-center gap-2">
      <div className="w-full pb-1" role="img" aria-label={ariaLabel}>
        <div className={gridShellClass}>
          {snake.length ? (
            <div className="gh-contrib-snake-layer" aria-hidden>
              {snake.map((seg, idx) => (
                <span
                  key={`${seg.x},${seg.y},${idx}`}
                  className={idx === 0 ? 'gh-contrib-snake-head' : 'gh-contrib-snake-body'}
                  style={{
                    left: `${((seg.x + 0.5) / Math.max(numWeeks, 1)) * 100}%`,
                    top: `${((seg.y + 0.5) / Math.max(numRows, 1)) * 100}%`,
                  }}
                />
              ))}
            </div>
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
          <button
            type="button"
            onClick={handleRelease}
            disabled={runState !== 'idle'}
            className="gh-contrib-control"
          >
            release agent snake
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
