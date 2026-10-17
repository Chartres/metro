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

// Boot side-effects (page_view on load, conversion on first Play), from sweep #5;
// the reload case is the bug the sessionStorage gate fixes (a per-load flag re-fired).
describe('analytics init (DOM side-effects)', () => {
  beforeEach(() => { vi.resetModules() })
  afterEach(() => { vi.unstubAllGlobals() })

  function mockClient(track: (e: string) => void, conversion: () => void): void {
    vi.doMock('./platform/flywheel-client', () => ({
      createFlywheelClient: () => ({ track, conversion }),
    }))
  }

  // Loads analytics.ts against a fake playBtn; returns its click handlers.
  async function boot(): Promise<Array<() => void>> {
    const handlers: Array<() => void> = []
    vi.stubGlobal('document', {
      getElementById: () => ({ addEventListener: (_: string, fn: () => void) => handlers.push(fn) }),
    })
    vi.resetModules()
    await import('./analytics')
    return handlers
  }

  function stubSessionStorage(): void {
    const ss: Record<string, string> = {}
    vi.stubGlobal('sessionStorage', {
      getItem: (k: string) => ss[k] ?? null,
      setItem: (k: string, v: string) => { ss[k] = v },
    })
  }

  it('fires page_view on module load when document is present', async () => {
    const tracked: string[] = []
    mockClient((e) => tracked.push(e), () => {})
    vi.stubGlobal('document', { getElementById: () => null })
    await import('./analytics')
    expect(tracked).toContain('page_view')
  })

  it('conversion fires only once even when playBtn is clicked twice', async () => {
    const conversions: number[] = []
    mockClient(() => {}, () => conversions.push(1))
    stubSessionStorage()
    const [click] = await boot()
    click?.()
    click?.()
    expect(conversions).toHaveLength(1)
  })

  it('conversion does not re-fire after a reload in the same session', async () => {
    const conversions: number[] = []
    mockClient(() => {}, () => conversions.push(1))
    stubSessionStorage()
    ;(await boot())[0]?.()
    ;(await boot())[0]?.() // fresh module = page reload; sessionStorage survives
    expect(conversions).toHaveLength(1)
  })

  it('conversion still fires once per load when site storage is blocked', async () => {
    const conversions: number[] = []
    mockClient(() => {}, () => conversions.push(1))
    const denied = () => { throw new DOMException('The operation is insecure.', 'SecurityError') }
    vi.stubGlobal('sessionStorage', { getItem: denied, setItem: denied })
    const [click] = await boot()
    expect(() => { click?.(); click?.() }).not.toThrow()
    expect(conversions).toHaveLength(1)
  })
})
