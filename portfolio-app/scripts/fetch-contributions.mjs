/**
 * Fetches the authenticated user's contribution calendar from GitHub GraphQL
 * and writes public/contributions.json.
 *
 * Env: GITHUB_TOKEN (PAT with read access to your user / profile).
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'public')
const OUT_FILE = join(OUT_DIR, 'contributions.json')

const QUERY = `
  query {
    viewer {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`

const token = process.env.GITHUB_TOKEN
if (!token) {
  console.error('Missing GITHUB_TOKEN in environment.')
  process.exit(1)
}

const res = await fetch('https://api.github.com/graphql', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: QUERY }),
})

const body = await res.json()
if (!res.ok) {
  console.error('GraphQL HTTP error:', res.status, body)
  process.exit(1)
}
if (body.errors?.length) {
  console.error('GraphQL errors:', JSON.stringify(body.errors, null, 2))
  process.exit(1)
}

const cal = body.data?.viewer?.contributionsCollection?.contributionCalendar
if (!cal) {
  console.error('Unexpected response shape:', JSON.stringify(body, null, 2))
  process.exit(1)
}

const payload = {
  fetchedAt: new Date().toISOString(),
  totalContributions: cal.totalContributions ?? 0,
  weeks: (cal.weeks ?? []).map((w) => ({
    days: (w.contributionDays ?? []).map((d) => ({
      date: d.date,
      count: d.contributionCount,
      level: d.contributionLevel,
    })),
  })),
}

mkdirSync(OUT_DIR, { recursive: true })
writeFileSync(OUT_FILE, JSON.stringify(payload, null, 2) + '\n', 'utf8')
console.log('Wrote', OUT_FILE, `(${payload.weeks.length} weeks, ${payload.totalContributions} contributions)`)
