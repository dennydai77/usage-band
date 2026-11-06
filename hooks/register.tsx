import { atom, read, update } from 'claude-code'
import type { Register, SessionUsage } from 'claude-code'

import type { Usage } from '../types'

const usage = atom({ plugin: 'usage-band', key: 'usage' } as const, null)

const LABELS: Record<string, string> = {
  five_hour: '5h',
  seven_day: '7d',
  spend_limit: 'spend',
}

function toUsage(u: Pick<SessionUsage, 'context' | 'rateLimits' | 'cost'>): Usage {
  return {
    limits: u.rateLimits.map(r => ({ kind: r.kind, percentUsed: r.percentUsed, resetsAt: r.resetsAt })),
    contextPercent: u.context.percent,
    usd: u.cost?.usd,
  }
}

function resetIn(iso: string | undefined, now: number): string {
  if (!iso) return ''
  const ms = Date.parse(iso) - now
  if (!(ms > 0)) return ''
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  if (h >= 24) return ` (${Math.floor(h / 24)}d${h % 24}h)`
  return h > 0 ? ` (${h}h${m}m)` : ` (${m}m)`
}

const WIDTH = 10

function color(p: number): string {
  if (p >= 90) return 'red'
  if (p >= 70) return 'yellow'
  return 'green'
}

function bar(p: number): { full: string; empty: string } {
  const n = Math.max(0, Math.min(WIDTH, Math.round((p / 100) * WIDTH)))
  return { full: '█'.repeat(n), empty: '░'.repeat(WIDTH - n) }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const r = await next(e)
    const u = await $.session.usage()
    await update($, usage, () => toUsage(u))
    return r
  })

  on('session.measure', async ($, e, next) => {
    await update($, usage, () => toUsage(e))
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const u = await read($, usage)
    if (e.props.hasSurvey || u === null || u.limits.length === 0) return next(e)

    const { Box, Text } = $.ui.resolve(e)
    const now = await $.clock.now()

    const meter = (key: string, label: string, p: number, suffix = '') => {
      const b = bar(p)
      const c = color(p)
      return (
        <Box key={key}>
          <Text dimColor>{label} </Text>
          <Text color={c}>{b.full}</Text>
          <Text color={c} dimColor>{b.empty}</Text>
          <Text color={c === 'green' ? undefined : c}> {p}%</Text>
          <Text dimColor>{suffix}  </Text>
        </Box>
      )
    }

    return (
      <Box>
        {u.limits.map(l => meter(l.kind, LABELS[l.kind] ?? l.kind, l.percentUsed, resetIn(l.resetsAt, now)))}
      </Box>
    )
  })
}
