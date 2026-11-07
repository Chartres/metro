import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildEventRow, createFlywheelClient, isAutomatedBrowser, resolveIds } from './flywheel-client'

describe('buildEventRow', () => {
  it('returns the expected shape with all fields', () => {
    const row = buildEventRow(
      'metro',
      'page_view',
      { ref: 'home' },
      { visitor_id: 'v1', session_id: 's1' },
      null,
      '2026-01-01T00:00:00.000Z',
    )
    expect(row).toEqual({
      app: 'metro',
      event: 'page_view',
      props: { ref: 'home' },
      visitor_id: 'v1',
      session_id: 's1',
      flywheel_uid: null,
      created_at: '2026-01-01T00:00:00.000Z',
    })
  })
})

describe('resolveIds', () => {
  it('returns stable ids from provided storage across two calls', () => {
    const store: Record<string, string> = {}
    const storage = {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => { store[k] = v },
    } as Storage
    const a = resolveIds(storage)
    const b = resolveIds(storage)
    expect(a.visitor_id).toBe(b.visitor_id)
    expect(a.session_id).toBe(b.session_id)
    expect(a.visitor_id).not.toBe('anon')
  })
})

// Blocked site data (private mode, a strict browser setting): reading window.localStorage or
// sessionStorage throws a SecurityError. The client must not throw, and must not fold every such
// visitor into one 'anon' id: it keeps a random id in memory for the page's lifetime (hub #159).
describe('resolveIds with blocked storage', () => {
  const blocked = () => {
    throw new DOMException('The operation is insecure.', 'SecurityError')
  }
  // put back whatever was there (Node 25+ and jsdom have real storage globals), not just delete
  const saved = (['localStorage', 'sessionStorage'] as const).map(
    (k) => [k, Object.getOwnPropertyDescriptor(globalThis, k)] as const,
  )
  afterEach(() => {
    for (const [k, d] of saved) {
      if (d) Object.defineProperty(globalThis, k, d)
      else delete (globalThis as Record<string, unknown>)[k]
    }
  })

  it('reading the storage globals throws: ids still resolve, stable within the page, never "anon"', () => {
    Object.defineProperty(globalThis, 'localStorage', { get: blocked, configurable: true })
    Object.defineProperty(globalThis, 'sessionStorage', { get: blocked, configurable: true })
    const a = resolveIds()
    const b = resolveIds()
    expect(a.visitor_id).toMatch(/[0-9a-f-]{36}/)
    expect(a.session_id).toMatch(/[0-9a-f-]{36}/)
    expect(b).toEqual(a)
  })

  it('a storage whose getItem/setItem throw: an in-memory id, not "anon"', () => {
    const throwing = { getItem: blocked, setItem: blocked } as unknown as Storage
    const { visitor_id } = resolveIds(throwing)
    expect(visitor_id).not.toBe('anon')
    expect(visitor_id).toMatch(/[0-9a-f-]{36}/)
  })

  it('the client tracks with blocked storage instead of throwing', () => {
    Object.defineProperty(globalThis, 'localStorage', { get: blocked, configurable: true })
    Object.defineProperty(globalThis, 'sessionStorage', { get: blocked, configurable: true })
    const insert = vi.fn(() => ({ then: () => {} }))
    const c = createFlywheelClient({ app: 'metro', supabase: { from: () => ({ insert }) } as never, isAutomated: () => false })
    expect(() => c.track('page_view', {})).not.toThrow()
    expect(insert).toHaveBeenCalledTimes(1)
  })
})

describe('createFlywheelClient', () => {
  it('does not insert and does not throw when supabase is null', () => {
    const client = createFlywheelClient({ app: 'metro', supabase: null })
    expect(() => client.track('page_view')).not.toThrow()
  })

  it('inserts an event row with app, event, props, and created_at', () => {
    const insert = vi.fn().mockReturnValue({})
    const from = vi.fn().mockReturnValue({ insert })
    const client = createFlywheelClient({
      app: 'metro',
      supabase: { from },
      now: () => '2026-01-01T00:00:00.000Z',
    })
    client.track('page_view', { src: 'direct' })
    expect(from).toHaveBeenCalledWith('events')
    const row = insert.mock.calls[0][0] as Record<string, unknown>
    expect(row.app).toBe('metro')
    expect(row.event).toBe('page_view')
    expect(row.props).toEqual({ src: 'direct' })
    expect(row.created_at).toBe('2026-01-01T00:00:00.000Z')
    expect(row.flywheel_uid).toBeNull()
  })

  it('conversion() inserts a row with event="conversion" — canonical taxonomy', () => {
    const insert = vi.fn().mockReturnValue({})
    const from = vi.fn().mockReturnValue({ insert })
    const client = createFlywheelClient({ app: 'metro', supabase: { from } })
    client.conversion({ action: 'played_timeline' })
    const row = insert.mock.calls[0][0] as Record<string, unknown>
    expect(row.event).toBe('conversion')
    expect(row.props).toEqual({ action: 'played_timeline' })
  })

  it('swallows a thenable rejection — analytics must never throw into the app', () => {
    const insert = vi.fn().mockReturnValue({
      // Simulates supabase-js returning a rejecting promise
      then: (_ok: () => void, err: () => void) => err(),
    })
    const from = vi.fn().mockReturnValue({ insert })
    const client = createFlywheelClient({ app: 'test', supabase: { from } })
    expect(() => client.track('x')).not.toThrow()
  })

  it('swallows a thrown exception inside insert — analytics must never throw into the app', () => {
    const from = vi.fn().mockReturnValue({
      insert: () => { throw new Error('unexpected') },
    })
    const client = createFlywheelClient({ app: 'test', supabase: { from } })
    expect(() => client.track('x')).not.toThrow()
  })
})

// Bots out (flywheel bot audit, 7 Nov 2026): crawlers that run JavaScript and our own headless
// runs must not count as Metro visitors.
describe('isAutomatedBrowser', () => {
  const CHROME = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
  const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1'
  it.each([
    ['webdriver (Playwright, CI)', { webdriver: true, userAgent: CHROME }, true],
    ['headless Chrome', { userAgent: CHROME.replace('Chrome/', 'HeadlessChrome/') }, true],
    ['Googlebot rendering the page', { userAgent: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Googlebot/2.1; +http://www.google.com/bot.html) Chrome/130.0.0.0 Safari/537.36' }, true],
    ['Lighthouse', { userAgent: CHROME + ' Chrome-Lighthouse' }, true],
    ['a Cubot phone (brand ends in "bot")', { userAgent: 'Mozilla/5.0 (Linux; Android 13; CUBOT KingKong 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36' }, false],
    ['desktop Chrome', { webdriver: false, userAgent: CHROME }, false],
    ['iPhone Safari', { userAgent: IPHONE }, false],
    ['no navigator (SSR, tests)', undefined, false],
  ] as const)('%s', (_name, nav, want) => {
    expect(isAutomatedBrowser(nav as { webdriver?: boolean; userAgent?: string } | undefined)).toBe(want)
  })

  it('an automated browser sends nothing, a person sends as before', () => {
    const rows = (automated: boolean) => {
      const insert = vi.fn(() => ({ then: () => {} }))
      const client = createFlywheelClient({
        app: 'metro',
        supabase: { from: () => ({ insert }) } as never,
        isAutomated: () => automated,
      })
      client.track('page_view')
      client.conversion({ action: 'played_timeline' })
      return insert.mock.calls.length
    }
    expect(rows(true)).toBe(0)
    expect(rows(false)).toBe(2)
  })

  it('by default it reads navigator: a webdriver browser sends nothing, feedback included', () => {
    const insert = vi.fn(() => ({ then: () => {} }))
    vi.stubGlobal('navigator', { webdriver: true, userAgent: 'Mozilla/5.0 Chrome/130.0.0.0' })
    try {
      const client = createFlywheelClient({ app: 'metro', supabase: { from: () => ({ insert }) } as never })
      client.track('page_view')
      client.feedback({ score: 5 })
      expect(insert).not.toHaveBeenCalled()
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
