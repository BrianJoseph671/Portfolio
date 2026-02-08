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
          <p className="text-lg sm:text-[19px] font-medium text-[#F5F5F5] leading-relaxed mb-8 max-w-[560px]">
            Building AI-powered sales tools. Looking for an SDR role at a high-growth startup in SF.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="mailto:brian@example.com"
              className="inline-flex items-center px-4 py-2 rounded-full border border-[#1E1E1E] bg-[#111111] text-[#F5F5F5] text-sm font-medium hover:border-[#3B82F6] hover:text-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0A0A0A] transition-colors"
            >
              Email: brian@example.com
            </a>
            <a
              href="https://linkedin.com/in/brianjoseph"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 rounded-full border border-[#1E1E1E] bg-[#111111] text-[#F5F5F5] text-sm font-medium hover:border-[#3B82F6] hover:text-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0A0A0A] transition-colors"
            >
              LinkedIn: linkedin.com/in/brianjoseph
            </a>
          </div>
        </div>
      </section>

      {/* Section 2: Projects */}
      <section
        className="animate-section-fade py-16 sm:py-20 px-6 sm:px-8"
        style={{ animationDelay: '120ms' }}
      >
        <div className="max-w-[720px] mx-auto">
          <p className="text-xs font-medium uppercase tracking-widest text-[#999999] mb-10">
            What I've Built
          </p>

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
                Built with React + Tailwind. Designed to be scanned in 15 seconds by a busy hiring manager.
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
            <span className="text-[#F5F5F5] font-medium">Notre Dame ESTEEM MBA</span>. Taught myself{' '}
            <span className="text-[#F5F5F5] font-medium">n8n, Claude API, and workflow automation</span>{' '}
            to build sales tools that actually work. Not chasing titles — looking for a team where I can learn GTM execution and earn my way up.
          </p>
        </div>
      </section>

      {/* Section 4: Footer / Contact repeat */}
      <footer
        className="animate-section-fade py-12 sm:py-16 px-6 sm:px-8 border-t border-[#1E1E1E]"
        style={{ animationDelay: '360ms' }}
      >
        <div className="max-w-[720px] mx-auto text-center">
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 text-sm text-[#999999] mb-4">
            <a
              href="mailto:brian@example.com"
              className="text-[#3B82F6] hover:underline focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0A0A0A] rounded"
            >
              brian@example.com
            </a>
            <a
              href="https://linkedin.com/in/brianjoseph"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#3B82F6] hover:underline focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0A0A0A] rounded"
            >
              LinkedIn
            </a>
          </div>
          <p className="text-sm text-[#999999]">
            Based in Chicago. Relocating to San Francisco.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
