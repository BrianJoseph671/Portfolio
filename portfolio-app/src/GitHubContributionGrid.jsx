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
    if (runState !== 'running') return
  }, [data, isReducedMotion, runState])

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
          <div
            className="gh-contrib-grid gh-contrib-grid-fluid flex w-full gap-[3px]"
            style={{
              '--contrib-cols': String(numWeeks),
            }}
          >
            {data.weeks.map((week, wi) => (
              <div key={wi} className="flex min-w-0 flex-1 flex-col gap-[3px]">
                {(week.days || []).map((day, di) => {
                  const level = day.level || 'NONE'
                  const cls = LEVEL_CLASS[level] || LEVEL_CLASS.NONE
                  const inName = nameMask.has(`${wi},${di}`)
                  return (
                    <span
                      key={day.date}
                      className={[
                        'gh-contrib-cell rounded-[2px]',
                        cls,
                        inName ? 'gh-contrib-name-keep' : '',
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
        <p className="text-[11px] theme-text-muted text-center">{totalLabel}</p>
      ) : null}
    </div>
  )
}
