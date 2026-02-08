import { useState, useEffect } from 'react'

const THEME_KEY = 'portfolio-theme'

function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem(THEME_KEY) || 'light'
    }
    return 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'light') {
      root.classList.add('light')
    } else {
      root.classList.remove('light')
    }
    window.localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return (
    <div className="min-h-screen theme-bg theme-text">
      {/* Theme toggle — top right */}
      <button
        type="button"
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-10 p-2 rounded-full theme-icon transition-colors theme-toggle-ring"
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? (
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      {/* Section 1: Hero */}
      <section
        className="animate-section-fade pt-20 pb-0 px-6 sm:px-8 md:pt-28"
        style={{ animationDelay: '0ms' }}
      >
        <div className="max-w-[720px] mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight mb-8">
            Brian Joseph
          </h1>
          <p className="text-lg sm:text-[19px] font-normal theme-text leading-relaxed max-w-[560px]">
            I build AI agents and workflow automations for sales and GTM.
          </p>
          <p className="text-lg sm:text-[19px] font-normal theme-text leading-relaxed mt-7 max-w-[560px]">
            Looking for an SDR/GTM role at a high-growth startup in SF.
          </p>
        </div>
      </section>

      {/* Section 2: Projects */}
      <section
        className="animate-section-fade pt-16 pb-8 px-6 sm:px-8"
        style={{ animationDelay: '120ms' }}
      >
        <div className="max-w-[720px] mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold theme-text mb-10 sm:mb-12">
            What I built
          </h2>

          <div className="space-y-6 sm:space-y-8">
            {/* Card 1: Outbound OS */}
            <article className="rounded-xl border theme-card p-6 sm:p-8 transition-all duration-200 theme-card-hover">
              <h2 className="text-xl font-semibold theme-text mb-2">
                Outbound OS
              </h2>
              <p className="theme-text-muted text-base leading-relaxed mb-5">
                AI-powered prospect research pipeline. Ingests a name and company, returns a full research brief with personalized outreach angles.
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-1 mb-5">
                <div>
                  <span className="theme-accent font-semibold">20 min → 30 sec</span>
                  <span className="theme-text-muted text-sm ml-1">research time</span>
                </div>
                <div>
                  <span className="theme-accent font-semibold">44.6% meeting rate</span>
                  <span className="theme-text-muted text-sm ml-1">across 83 prospects</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {['n8n', 'Claude API', 'Serper', 'Google Sheets'].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-md text-xs font-medium theme-tag border"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              {/* Optional: <a href="#" className="text-[#3B82F6] text-sm font-medium mt-4 inline-block hover:underline">View Demo →</a> */}
            </article>

            {/* Card 2: Smart Flow */}
            <article className="rounded-xl border theme-card p-6 sm:p-8 transition-all duration-200 theme-card-hover">
              <div className="flex flex-wrap items-baseline gap-2 mb-2">
                <h2 className="text-xl font-semibold theme-text">
                  Smart Flow
                </h2>
                <a
                  href="https://github.com/BrianJoseph671/SmartFlow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm theme-accent hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--focus-offset)] rounded"
                >
                  github.com/BrianJoseph671/SmartFlow
                </a>
              </div>
              <p className="theme-text-muted text-base leading-relaxed mb-5">
                AI agent that automates inbound lead qualification, scheduling, and data syncing for HVAC service firms.
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-1 mb-5">
                <div>
                  <span className="theme-accent font-semibold">25% reduction</span>
                  <span className="theme-text-muted text-sm ml-1">in scheduling and outreach workload</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {['TypeScript', 'React', 'n8n', 'Cursor'].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-md text-xs font-medium theme-tag border"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>

            {/* Card 3: LinkedIn Poster */}
            <article className="rounded-xl border theme-card p-6 sm:p-8 transition-all duration-200 theme-card-hover">
              <h2 className="text-xl font-semibold theme-text mb-2">
                LinkedIn Poster
              </h2>
              <p className="theme-text-muted text-base leading-relaxed mb-5">
                AI content agent that generates personalized LinkedIn posts from research inputs and topic briefs.
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-1 mb-5">
                <div>
                  <span className="theme-accent font-semibold">70% faster</span>
                  <span className="theme-text-muted text-sm ml-1">drafting time (40 min → 12 min)</span>
                </div>
                <div>
                  <span className="theme-accent font-semibold">2x post output</span>
                  <span className="theme-text-muted text-sm ml-1">with 11% engagement increase</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {['n8n', 'Airtable', 'Claude Code'].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-md text-xs font-medium theme-tag border"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>

            {/* Card 4: SpikeSense */}
            <article className="rounded-xl border theme-card p-6 sm:p-8 transition-all duration-200 theme-card-hover">
              <div className="flex flex-wrap items-baseline gap-2 mb-2">
                <h2 className="text-xl font-semibold theme-text">
                  SpikeSense
                </h2>
                </div>
              <p className="theme-text-muted text-base leading-relaxed mb-5">
                Forecasts overdose spike risk and automates targeted public-health resource deployment across county-level data.
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-1 mb-5">
                <div>
                  <span className="theme-accent font-semibold">3 data pipelines</span>
                  <span className="theme-text-muted text-sm ml-1">integrated for real-time risk scoring</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {['TypeScript', 'React', 'Python', 'Replit'].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-md text-xs font-medium theme-tag border"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Footer — icon links + tagline */}
      <footer
        className="animate-section-fade pt-12 pb-12 sm:pb-16 px-6 sm:px-8 border-t theme-footer-border"
        style={{ animationDelay: '360ms' }}
      >
        <div className="max-w-[720px] mx-auto text-center">
          <div className="flex justify-center items-center gap-8 mb-6">
            <a
              href="https://github.com/BrianJoseph671"
              target="_blank"
              rel="noopener noreferrer"
              className="theme-icon transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--focus-offset)] rounded-full p-1"
              aria-label="GitHub"
            >
              <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/in/brianmathewjoseph/"
              target="_blank"
              rel="noopener noreferrer"
              className="theme-icon transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--focus-offset)] rounded-full p-1"
              aria-label="LinkedIn"
            >
              <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a
              href="mailto:josephbrian671@gmail.com"
              className="theme-icon transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--focus-offset)] rounded-full p-1"
              aria-label="Email"
            >
              <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
          </div>
          <p className="text-sm theme-text-muted">
            Guam since birth, Notre Dame through luck, SF by choice
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
