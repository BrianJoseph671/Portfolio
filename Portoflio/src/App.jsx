function App() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5]">
      {/* Section 1: Hero */}
      <section
        className="animate-section-fade pt-20 pb-16 px-6 sm:px-8 md:pt-28 md:pb-24"
        style={{ animationDelay: '0ms' }}
      >
        <div className="max-w-[720px] mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight mb-5">
            Brian Joseph
          </h1>
          <p className="text-lg sm:text-[19px] font-normal text-[#F5F5F5] leading-relaxed max-w-[560px]">
            First principles thinker who loves to build AI agents and workflow systems (esp for sales and GTM).
          </p>
          <p className="text-lg sm:text-[19px] font-normal text-[#F5F5F5] leading-relaxed mt-5 max-w-[560px]">
            Looking for an SDR role at a high-growth startup.
          </p>
        </div>
      </section>

      {/* Section 2: Projects */}
      <section
        className="animate-section-fade py-16 sm:py-20 px-6 sm:px-8"
        style={{ animationDelay: '120ms' }}
      >
        <div className="max-w-[720px] mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#F5F5F5] mb-10 sm:mb-12">
            What I built
          </h2>

          <div className="space-y-6 sm:space-y-8">
            {/* Card 1: Outbound OS */}
            <article className="rounded-xl border border-[#1E1E1E] bg-[#111111] p-6 sm:p-8 transition-all duration-200 hover:border-[#2a2a2a] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
              <h2 className="text-xl font-semibold text-[#F5F5F5] mb-2">
                Outbound OS
              </h2>
              <p className="text-[#999999] text-base leading-relaxed mb-5">
                AI-powered prospect research pipeline. Ingests a name and company, returns a full research brief with personalized outreach angles.
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-1 mb-5">
                <div>
                  <span className="text-[#3B82F6] font-semibold">20 min → 30 sec</span>
                  <span className="text-[#999999] text-sm ml-1">research time</span>
                </div>
                <div>
                  <span className="text-[#3B82F6] font-semibold">44.6% meeting rate</span>
                  <span className="text-[#999999] text-sm ml-1">across 83 prospects</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {['n8n', 'Claude API', 'Serper', 'Google Sheets'].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-md text-xs font-medium text-[#999999] bg-[#1A1A1A] border border-[#1E1E1E]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              {/* Optional: <a href="#" className="text-[#3B82F6] text-sm font-medium mt-4 inline-block hover:underline">View Demo →</a> */}
            </article>

            {/* Card 2: GTM Workflow Automations */}
            <article className="rounded-xl border border-[#1E1E1E] bg-[#111111] p-6 sm:p-8 transition-all duration-200 hover:border-[#2a2a2a] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
              <h2 className="text-xl font-semibold text-[#F5F5F5] mb-2">
                GTM Workflow Automations
              </h2>
              <p className="text-[#999999] text-base leading-relaxed mb-5">
                Suite of n8n workflows that automate lead enrichment, CRM updates, and follow-up sequencing.
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-1 mb-5">
                <div>
                  <span className="text-[#3B82F6] font-semibold">X hours saved per week</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {['n8n', 'OpenAI', 'PostgreSQL'].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-md text-xs font-medium text-[#999999] bg-[#1A1A1A] border border-[#1E1E1E]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>

            {/* Card 3: This Site */}
            <article className="rounded-xl border border-[#1E1E1E] bg-[#111111] p-6 sm:p-8 transition-all duration-200 hover:border-[#2a2a2a] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
              <h2 className="text-xl font-semibold text-[#F5F5F5] mb-2">
                This Site
              </h2>
              <p className="text-[#999999] text-base leading-relaxed mb-5">
                Built with React + Tailwind. Designed to be scanned in 15 seconds.
              </p>
              <div className="flex flex-wrap gap-2">
                {['React', 'Tailwind CSS', 'Vite', 'Vercel'].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-md text-xs font-medium text-[#999999] bg-[#1A1A1A] border border-[#1E1E1E]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Section 3: Background */}
      <section
        className="animate-section-fade py-16 sm:py-20 px-6 sm:px-8"
        style={{ animationDelay: '240ms' }}
      >
        <div className="max-w-[640px] mx-auto">
          <p className="text-[#999999] text-base sm:text-lg leading-relaxed text-left">
            Taught myself <span className="text-[#F5F5F5] font-medium">n8n, Claude Code, Cursor, Clay, Replit</span>, and workflow automation to build systems focused on outcomes rather than output.
          </p>
          <p className="text-[#999999] text-base sm:text-lg leading-relaxed text-left">
            Excited to join a team building world class GTM systems. Ready to learn and iterate fast.
          </p>
        </div>
      </section>

      {/* Section 4: Footer — icon links only */}
      <footer
        className="animate-section-fade py-12 sm:py-16 px-6 sm:px-8 border-t border-[#1E1E1E]"
        style={{ animationDelay: '360ms' }}
      >
        <div className="max-w-[720px] mx-auto text-center">
          <div className="flex justify-center items-center gap-8 mb-6">
            <a
              href="https://github.com/BrianJoseph671"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#999999] hover:text-[#3B82F6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0A0A0A] rounded-full p-1"
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
              className="text-[#999999] hover:text-[#3B82F6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0A0A0A] rounded-full p-1"
              aria-label="LinkedIn"
            >
              <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a
              href="mailto:josephbrian671@gmail.com"
              className="text-[#999999] hover:text-[#3B82F6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0A0A0A] rounded-full p-1"
              aria-label="Email"
            >
              <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
          </div>
          <p className="text-sm text-[#999999]">
            Guam since birth, Notre Dame through luck, SF by choice
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
