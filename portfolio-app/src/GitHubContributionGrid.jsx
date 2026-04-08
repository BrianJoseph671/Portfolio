import { useState, useEffect, useMemo, useRef } from 'react'

const LEVEL_CLASS = {
  NONE: 'gh-contrib-l0',
  FIRST_QUARTILE: 'gh-contrib-l1',
  SECOND_QUARTILE: 'gh-contrib-l2',
  THIRD_QUARTILE: 'gh-contrib-l3',
  FOURTH_QUARTILE: 'gh-contrib-l4',
}

const SNAKE_STEP_MS = 160
const INITIAL_SNAKE_LENGTH = 1
const REFRESH_MS = 5 * 60 * 1000
const DIRECTIONS = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
]
const KEY_TO_DIRECTION = {
  ArrowRight: { x: 1, y: 0 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowDown: { x: 0, y: 1 },
  ArrowUp: { x: 0, y: -1 },
  KeyD: { x: 1, y: 0 },
  KeyA: { x: -1, y: 0 },
  KeyS: { x: 0, y: 1 },
  KeyW: { x: 0, y: -1 },
}
function findSnakeStart(numWeeks, numRows, length) {
  const startY = Math.max(1, Math.floor(numRows * 0.4))
  const rowOrder = [startY, startY - 1, startY + 1, 1, 2, 3, 4, 5]
    .filter((y, idx, arr) => y >= 0 && y < numRows && arr.indexOf(y) === idx)

  for (const y of rowOrder) {
    for (let x = Math.max(length - 1, 1); x < numWeeks - 1; x++) {
      return Array.from({ length }, (_, i) => ({ x: x - i, y }))
    }
  }

  return Array.from({ length }, (_, i) => ({ x: Math.max(length - 1, 1) - i, y: startY }))
}

export function GitHubContributionGrid() {
  const [data, setData] = useState(null)
  const [loadError, setLoadError] = useState(false)
  const [runState, setRunState] = useState('idle')
  const [clearedCells, setClearedCells] = useState(() => new Set())
  const [snake, setSnake] = useState([])
  const [direction, setDirection] = useState({ x: 1, y: 0 })
  const [growthLeft, setGrowthLeft] = useState(0)
  const [grayEatenCount, setGrayEatenCount] = useState(0)
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
  const pendingDirectionRef = useRef(null)
  const directionRef = useRef({ x: 1, y: 0 })
  const clearTargets = useMemo(() => {
    if (!data?.weeks?.length) return []
    const targets = []
    data.weeks.forEach((week, wi) => {
      ;(week.days || []).forEach((_, di) => {
        targets.push(`${wi},${di}`)
      })
    })
    return targets
  }, [data])
  const totalLabel = useMemo(() => {
    if (!data?.weeks?.length) return null
    const total = data.totalContributions
    if (typeof total !== 'number') return null
    return `${total.toLocaleString()} contributions in the last year`
  }, [data])
  const isReducedMotion = prefersReducedMotion

  useEffect(() => {
    directionRef.current = direction
  }, [direction])

  useEffect(() => {
    if (!data?.weeks?.length || isReducedMotion) return
    if (runState !== 'running') return

    const timer = window.setInterval(() => {
      setSnake((currentSnake) => {
        if (!currentSnake.length) return currentSnake
        const head = currentSnake[0]
        const requested = pendingDirectionRef.current
        const currentDirection = directionRef.current
        const canTurn =
          requested &&
          !(requested.x === -currentDirection.x && requested.y === -currentDirection.y)
        const nextDirection = canTurn ? requested : currentDirection
        pendingDirectionRef.current = null
        directionRef.current = nextDirection
        setDirection(nextDirection)

        const nextHead = { x: head.x + nextDirection.x, y: head.y + nextDirection.y }
        const nextHeadKey = `${nextHead.x},${nextHead.y}`
        const hitsWall = !(nextHead.x >= 0 && nextHead.x < numWeeks && nextHead.y >= 0 && nextHead.y < numRows)
        const hitsBody = currentSnake.some((s) => s.x === nextHead.x && s.y === nextHead.y)
        if (hitsWall || hitsBody) {
          setRunState('done')
          pendingDirectionRef.current = null
          return currentSnake
        }

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
  }, [data, growthLeft, isReducedMotion, numRows, numWeeks, runState])

  useEffect(() => {
    if (runState !== 'running' || isReducedMotion) return
    const onKeyDown = (event) => {
      const mapped = KEY_TO_DIRECTION[event.code] || KEY_TO_DIRECTION[event.key]
      if (!mapped) return
      event.preventDefault()
      const baseDirection = pendingDirectionRef.current ?? directionRef.current
      const reversing = mapped.x === -baseDirection.x && mapped.y === -baseDirection.y
      if (reversing) return
      pendingDirectionRef.current = mapped
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isReducedMotion, runState])

  useEffect(() => {
    if (!activeHit) return
    const id = window.setTimeout(() => setActiveHit(''), 120)
    return () => window.clearTimeout(id)
  }, [activeHit])

  // Authoritative eat behavior: whenever the snake head enters a new cell,
  // mark it cleared and grow by +1 every 10 gray (NONE) cells eaten.
  useEffect(() => {
    if (runState !== 'running') return
    if (!snake.length) return
    const head = snake[0]
    const headKey = `${head.x},${head.y}`
    setClearedCells((current) => {
      if (current.has(headKey)) return current
      const next = new Set(current)
      next.add(headKey)
      const level = data?.weeks?.[head.x]?.days?.[head.y]?.level
      if (level === 'NONE') {
        setGrayEatenCount((count) => {
          const updated = count + 1
          if (updated % 10 === 0) {
            setGrowthLeft((g) => g + 1)
          }
          return updated
        })
      }
      setActiveHit(headKey)
      return next
    })
  }, [data, runState, snake])

  useEffect(() => {
    if (runState !== 'running') return
    if (clearedCells.size < clearTargets.length) return
    setRunState('done')
    pendingDirectionRef.current = null
  }, [clearTargets.length, clearedCells, runState])

  const handleRelease = () => {
    if (runState !== 'idle' || !data?.weeks?.length) return
    if (isReducedMotion) {
      setClearedCells(new Set(clearTargets))
      setRunState('done')
      return
    }
    setClearedCells(new Set())
    const body = findSnakeStart(numWeeks, numRows, INITIAL_SNAKE_LENGTH)
    pendingDirectionRef.current = null
    directionRef.current = { x: 1, y: 0 }
    setSnake(body)
    setDirection({ x: 1, y: 0 })
    setGrowthLeft(0)
    setGrayEatenCount(0)
    setRunState('running')
  }

  const handleReset = () => {
    setRunState('idle')
    setSnake([])
    directionRef.current = { x: 1, y: 0 }
    setDirection({ x: 1, y: 0 })
    setGrowthLeft(0)
    setGrayEatenCount(0)
    setActiveHit('')
    setClearedCells(new Set())
    pendingDirectionRef.current = null
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
      ? `Decorative contribution squares with a snake game overlay. Based on ${totalLabel}.`
      : 'Decorative contribution squares with a snake game overlay.'
    : totalLabel
      ? `Animated GitHub contribution calendar: control the snake with arrows or WASD to clear squares. ${totalLabel}.`
      : 'Animated GitHub contribution calendar: control the snake with arrows or WASD to clear squares.'

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
                  const isCleared = clearedCells.has(`${wi},${di}`)
                  return (
                    <span
                      key={day.date}
                      className={[
                        'gh-contrib-cell rounded-[2px]',
                        cls,
                        activeHit === `${wi},${di}` ? 'gh-contrib-cell-hit' : '',
                        isCleared ? 'gh-contrib-cell-cleared' : '',
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
            Release Agent Snake
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
