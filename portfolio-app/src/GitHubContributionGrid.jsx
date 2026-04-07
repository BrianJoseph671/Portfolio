import { useState, useEffect, useMemo } from 'react'

const LEVEL_CLASS = {
  NONE: 'gh-contrib-l0',
  FIRST_QUARTILE: 'gh-contrib-l1',
  SECOND_QUARTILE: 'gh-contrib-l2',
  THIRD_QUARTILE: 'gh-contrib-l3',
  FOURTH_QUARTILE: 'gh-contrib-l4',
}

const SOLID_MS = 2200
const SWEEP_MS = 3600
const BLAST_ANIM_MS = 520
const HOLD_MS = 1800
const PAUSE_MS = 650

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

function staggerForIndex(i) {
  return ((i * 7919) % 1000) / 1000
}

function RocketIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M28 8c6 2 10 8 10 15v4l-4 6h-6l-2-8-2 8h-6l-4-6v-4c0-7 4-13 10-15l2 6 2-6Z"
        fill="var(--accent)"
        opacity="0.95"
      />
      <path d="M22 26h4v10h-4z" fill="var(--text-muted)" opacity="0.85" />
      <path
        d="M16 36c2-4 4-6 8-6s6 2 8 6"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M8 28c3-1 6 0 8 2-2 3-5 5-9 5 0-2 1-5 1-7Z"
        fill="var(--accent)"
        opacity="0.55"
      />
    </svg>
  )
}

export function GitHubContributionGrid() {
  const [data, setData] = useState(null)
  const [loadError, setLoadError] = useState(false)
  const [sweeping, setSweeping] = useState(false)
  const [sweepProgress, setSweepProgress] = useState(0)
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
    fetch('/contributions.json')
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status))
        return r.json()
      })
      .then((json) => {
        if (!cancelled) setData(json)
      })
      .catch(() => {
        if (!cancelled) setLoadError(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const numWeeks = data?.weeks?.length ?? 0
  const nameMask = useMemo(() => makeBrianMask(numWeeks), [numWeeks])

  const totalLabel = useMemo(() => {
    if (!data?.weeks?.length) return null
    const total = data.totalContributions
    if (typeof total !== 'number') return null
    return `${total.toLocaleString()} contributions in the last year`
  }, [data])

  const isReducedMotion = prefersReducedMotion

  useEffect(() => {
    if (!data?.weeks?.length || isReducedMotion) return

    let cancelled = false
    let rafId = 0
    let solidTimer = 0
    let holdTimer = 0
    let pauseTimer = 0
    let sweepStartTs = 0

    const runSweep = () => {
      if (cancelled) return
      setSweeping(true)
      setSweepProgress(0)
      sweepStartTs = performance.now()

      const tick = (ts) => {
        if (cancelled) return
        const elapsed = ts - sweepStartTs
        const progress = Math.min(1, elapsed / SWEEP_MS)
        setSweepProgress(progress)

        if (progress < 1) {
          rafId = window.requestAnimationFrame(tick)
          return
        }

        holdTimer = window.setTimeout(() => {
          if (cancelled) return
          setSweeping(false)
          setSweepProgress(0)
          pauseTimer = window.setTimeout(startCycle, PAUSE_MS)
        }, Math.max(0, HOLD_MS - BLAST_ANIM_MS))
      }

      rafId = window.requestAnimationFrame(tick)
    }

    const startCycle = () => {
      if (cancelled) return
      setSweeping(false)
      setSweepProgress(0)
      solidTimer = window.setTimeout(runSweep, SOLID_MS)
    }

    startCycle()

    return () => {
      cancelled = true
      window.cancelAnimationFrame(rafId)
      window.clearTimeout(solidTimer)
      window.clearTimeout(holdTimer)
      window.clearTimeout(pauseTimer)
    }
  }, [data, isReducedMotion])

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

  const maxWeekIndex = Math.max(numWeeks - 1, 1)
  const norm = (wi) => wi / maxWeekIndex

  let cellIndex = 0

  const gridShellClass = [
    'gh-contrib-grid-shell',
    isReducedMotion ? 'gh-contrib-reduced-static' : '',
    sweeping ? 'gh-contrib-rocket-sweeping' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const ariaLabel = isReducedMotion
    ? totalLabel
      ? `Decorative contribution squares forming the name Brian. Based on ${totalLabel}.`
      : 'Decorative contribution squares forming the name Brian.'
    : totalLabel
      ? `Animated GitHub contribution calendar: a rocket clears squares to reveal the name Brian. ${totalLabel}.`
      : 'Animated GitHub contribution calendar: a rocket clears squares to reveal the name Brian.'

  return (
    <div className="mb-8 w-full flex flex-col items-center gap-2">
      <div className="w-full pb-1" role="img" aria-label={ariaLabel}>
        <div className={gridShellClass}>
          {!isReducedMotion ? (
            <div className="gh-contrib-rocket" aria-hidden>
              <RocketIcon className="gh-contrib-rocket-svg" />
            </div>
          ) : null}
          <div
            className={`gh-contrib-grid gh-contrib-grid-fluid flex w-full gap-[3px] ${sweeping && !isReducedMotion ? 'gh-contrib-grid-sweeping' : ''}`}
            style={{
              '--contrib-cols': String(numWeeks),
              '--sweep-ms': `${SWEEP_MS}ms`,
              '--sweep-progress': String(sweepProgress),
            }}
          >
            {data.weeks.map((week, wi) => (
              <div key={wi} className="flex min-w-0 flex-1 flex-col gap-[3px]">
                {(week.days || []).map((day, di) => {
                  const level = day.level || 'NONE'
                  const cls = LEVEL_CLASS[level] || LEVEL_CLASS.NONE
                  const stagger = staggerForIndex(cellIndex++)
                  const inName = nameMask.has(`${wi},${di}`)
                  const hasPassedCell = sweepProgress >= norm(wi)
                  const carvedAway = sweeping && !isReducedMotion && !inName && hasPassedCell
                  const blast = sweeping && !isReducedMotion && !inName
                  const blastDelayMs = norm(wi) * SWEEP_MS * 0.92
                  const blastY = stagger * 14 - 7
                  return (
                    <span
                      key={day.date}
                      className={[
                        'gh-contrib-cell rounded-[2px]',
                        cls,
                        inName ? 'gh-contrib-name-keep' : '',
                        carvedAway ? 'gh-contrib-cell-cleared' : '',
                        blast ? 'gh-contrib-blast' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      style={{
                        '--stagger': String(stagger),
                        '--col': String(wi),
                        '--blast-delay-ms': `${blastDelayMs}ms`,
                        '--blast-y': `${blastY}px`,
                      }}
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
        <p className="text-[11px] theme-text-muted text-center">{totalLabel}</p>
      ) : null}
    </div>
  )
}
