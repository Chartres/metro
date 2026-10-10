import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { restShim } from './analytics'

describe('restShim (the dep-free supabase stand-in)', () => {
  it('POSTs the row to /rest/v1/<table> with the publishable key', async () => {
    const doFetch = vi.fn().mockResolvedValue({ ok: true })
    restShim('https://x.supabase.co', 'pk_test', doFetch as unknown as typeof fetch)
      .from('events')
      .insert({ app: 'metro', event: 'page_view' })
    expect(doFetch).toHaveBeenCalledOnce()
    const [reqUrl, init] = doFetch.mock.calls[0] as [string, RequestInit]
    expect(reqUrl).toBe('https://x.supabase.co/rest/v1/events')
    expect(init.method).toBe('POST')
    expect((init.headers as Record<string, string>).apikey).toBe('pk_test')
    expect(JSON.parse(init.body as string).event).toBe('page_view')
  })

  it('swallows network failure — analytics never breaks the app', async () => {
    const doFetch = vi.fn().mockRejectedValue(new Error('offline'))
    const result = restShim('https://x.supabase.co', 'pk', doFetch as unknown as typeof fetch)
      .from('events')
      .insert({})
    await expect(result).resolves.toBeUndefined()
  })
})

describe('analytics init (DOM side-effects)', () => {
  beforeEach(() => { vi.resetModules() })
  afterEach(() => { vi.unstubAllGlobals() })

  it('fires page_view on module load when document is present', async () => {
    const tracked: string[] = []
    vi.doMock('./platform/flywheel-client', () => ({
      createFlywheelClient: () => ({ track: (e: string) => tracked.push(e), conversion: () => {} }),
    }))
    vi.stubGlobal('document', { getElementById: () => null })
    await import('./analytics')
    expect(tracked).toContain('page_view')
  })

  it('conversion fires only once even when playBtn is clicked twice', async () => {
    const conversions: number[] = []
    vi.doMock('./platform/flywheel-client', () => ({
      createFlywheelClient: () => ({ track: () => {}, conversion: () => conversions.push(1) }),
    }))
    const ss: Record<string, string> = {}
    vi.stubGlobal('sessionStorage', {
      getItem: (k: string) => ss[k] ?? null,
      setItem: (k: string, v: string) => { ss[k] = v },
    })
    const handlers: Array<() => void> = []
    vi.stubGlobal('document', {
      getElementById: () => ({ addEventListener: (_: string, fn: () => void) => handlers.push(fn) }),
    })
    await import('./analytics')
    handlers[0]?.()
    handlers[0]?.()
    expect(conversions).toHaveLength(1)
  })
})
