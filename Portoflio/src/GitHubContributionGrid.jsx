import { useState, useEffect, useMemo, useRef } from 'react'

const LEVEL_CLASS = {
  NONE: 'gh-contrib-l0',
  FIRST_QUARTILE: 'gh-contrib-l1',
  SECOND_QUARTILE: 'gh-contrib-l2',
  THIRD_QUARTILE: 'gh-contrib-l3',
  FOURTH_QUARTILE: 'gh-contrib-l4',
}

const SOLID_MS = 7000
const DISINTEGRATE_MS = 5200
const PAUSE_MS = 800

function staggerForIndex(i) {
  return ((i * 7919) % 1000) / 1000
}

export function GitHubContributionGrid() {
  const [data, setData] = useState(null)
  const [loadError, setLoadError] = useState(false)
  const [disintegrating, setDisintegrating] = useState(false)
  const reducedMotion = useRef(false)

  useEffect(() => {
    reducedMotion.current =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
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

  const totalLabel = useMemo(() => {
    if (!data?.weeks?.length) return null
    const total = data.totalContributions
    if (typeof total !== 'number') return null
    return `${total.toLocaleString()} contributions in the last year`
  }, [data])

  useEffect(() => {
    if (!data?.weeks?.length || reducedMotion.current) return

    const timers = []
    let cancelled = false

    const after = (ms, fn) => {
      const id = window.setTimeout(() => {
        if (!cancelled) fn()
      }, ms)
      timers.push(id)
    }

    const loop = () => {
      if (cancelled) return
      setDisintegrating(false)
      after(SOLID_MS, () => setDisintegrating(true))
      after(SOLID_MS + DISINTEGRATE_MS, () => setDisintegrating(false))
      after(SOLID_MS + DISINTEGRATE_MS + PAUSE_MS, loop)
    }

    loop()

    return () => {
      cancelled = true
      timers.forEach((id) => clearTimeout(id))
    }
  }, [data])

  if (loadError) {
    return null
  }

  if (!data) {
    return (
      <div className="mb-8 flex justify-center" aria-hidden>
        <div className="h-[84px] w-full max-w-[min(100%,520px)] rounded-md gh-contrib-skeleton" />
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

  const disintegrateClass =
    disintegrating && !reducedMotion.current ? 'gh-contrib-grid-disintegrating' : ''

  let cellIndex = 0

  return (
    <div className="mb-8 w-full flex flex-col items-center gap-2">
      <div
        className="w-full max-w-[min(100%,520px)] overflow-x-auto pb-1"
        role="img"
        aria-label={
          totalLabel
            ? `GitHub contribution calendar. ${totalLabel}.`
            : 'GitHub contribution calendar for the last year.'
        }
      >
        <div className={`gh-contrib-grid flex gap-[3px] min-w-min mx-auto ${disintegrateClass}`}>
          {data.weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {(week.days || []).map((day) => {
                const level = day.level || 'NONE'
                const cls = LEVEL_CLASS[level] || LEVEL_CLASS.NONE
                const stagger = staggerForIndex(cellIndex++)
                return (
                  <span
                    key={day.date}
                    className={`gh-contrib-cell rounded-[2px] ${cls}`}
                    style={{ '--stagger': String(stagger) }}
                    title={`${day.date}: ${day.count ?? 0} contribution${(day.count ?? 0) === 1 ? '' : 's'}`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
      {totalLabel ? (
        <p className="text-[11px] theme-text-muted text-center">{totalLabel}</p>
      ) : null}
    </div>
  )
}
