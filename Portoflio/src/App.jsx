function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Section 1: Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 sm:px-8 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold max-w-4xl leading-tight mb-6">
          AI-native SDR building automation tools for modern GTM teams
        </h1>
        <p className="text-lg sm:text-xl text-white/90 max-w-2xl mb-10">
          Looking for an SDR role at a Series B/C AI startup in San Francisco
        </p>
        <a
          href="#projects"
          className="inline-block bg-white text-black font-medium rounded-lg px-6 py-3 hover:bg-white/95 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black transition-colors"
        >
          View Projects
        </a>
      </section>

      {/* Section 2: About */}
      <section className="py-20 sm:py-24 px-6 sm:px-8">
        <div className="max-w-[700px] mx-auto">
          <p className="text-lg text-white leading-relaxed mb-8">
            I'm an ESTEEM MBA graduate who taught myself n8n, Claude, and workflow automation to solve real GTM problems.
          </p>
          <p className="text-lg text-white leading-relaxed mb-8">
            I've built tools that reduce prospect research time from 20 minutes to 30 seconds and booked meetings at a 44.6% rate.
          </p>
          <p className="text-lg text-white leading-relaxed">
            I'm not interested in prestige titles—I want to learn GTM execution at a high-velocity startup and earn leverage through execution.
          </p>
        </div>
      </section>

      {/* Section 3: Projects */}
      <section id="projects" className="py-20 sm:py-24 px-6 sm:px-8">
        <div className="max-w-[1000px] mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-12 sm:mb-16">
            What I've Built
          </h2>

          <div className="space-y-16 sm:space-y-20">
            {/* Outbound OS */}
            <article>
              <h3 className="text-xl font-bold mb-3">Outbound OS</h3>
              <p className="text-[#a3a3a3] text-lg mb-6 max-w-2xl">
                AI-powered prospect research tool. Reduced research time from 20+ min to 30 sec. 44.6% meeting booking rate across 83 prospects.
              </p>
              <div
                className="w-full aspect-video rounded-lg bg-[#a3a3a3]/30 shadow-lg"
                aria-hidden
              />
            </article>

            {/* n8n GTM Workflows */}
            <article>
              <h3 className="text-xl font-bold mb-3">n8n GTM Workflows</h3>
              <p className="text-[#a3a3a3] text-lg mb-6 max-w-2xl">
                Built automated calendar scheduling, batch prospect enrichment, and AI message generation pipelines.
              </p>
              <div
                className="w-full aspect-video rounded-lg bg-[#a3a3a3]/30 shadow-lg"
                aria-hidden
              />
            </article>

            {/* Placeholder project */}
            <article>
              <h3 className="text-xl font-bold mb-3">Project Title Placeholder</h3>
              <p className="text-[#a3a3a3] text-lg mb-6 max-w-2xl">
                Project description placeholder. Add your third project details here.
              </p>
              <div
                className="w-full aspect-video rounded-lg bg-[#a3a3a3]/30 shadow-lg"
                aria-hidden
              />
            </article>
          </div>
        </div>
      </section>

      {/* Section 4: Contact */}
      <section className="py-20 sm:py-24 px-6 sm:px-8">
        <div className="max-w-[700px] mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-10">
            Get in Touch
          </h2>
          <div className="flex flex-col items-center gap-6">
            <a
              href="mailto:your@email.com"
              className="text-white hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black rounded transition-opacity"
            >
              Email: your@email.com
            </a>
            <a
              href="https://linkedin.com/in/yourprofile"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black rounded transition-opacity"
            >
              LinkedIn: linkedin.com/in/yourprofile
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default App
