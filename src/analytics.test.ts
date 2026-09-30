import { describe, expect, it, vi, beforeEach } from 'vitest'
import { restShim } from './analytics'
import { createFlywheelClient } from './platform/flywheel-client'

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

describe('createFlywheelClient', () => {
  it('no-op when supabase is null — track never throws', () => {
    const fw = createFlywheelClient({ app: 'test', supabase: null })
    expect(() => fw.track('page_view')).not.toThrow()
  })

  it('track fires insert once per call', () => {
    const insert = vi.fn()
    const supabase = { from: () => ({ insert }) }
    const fw = createFlywheelClient({ app: 'test', supabase })
    fw.track('page_view')
    expect(insert).toHaveBeenCalledOnce()
    expect(insert.mock.calls[0][0]).toMatchObject({ app: 'test', event: 'page_view' })
  })

  it('conversion fires only once per session when guarded by sessionStorage', () => {
    // Simulate the sessionStorage guard from analytics.ts boot code
    const SESSION_KEY = 'metro_conversion_fired'
    const ss = { getItem: vi.fn(), setItem: vi.fn() }
    ss.getItem.mockReturnValue(null)

    const insert = vi.fn()
    const supabase = { from: () => ({ insert }) }
    const fw = createFlywheelClient({ app: 'test', supabase })

    // First press: key absent → fire
    if (!ss.getItem(SESSION_KEY)) {
      ss.setItem(SESSION_KEY, '1')
      fw.conversion({ action: 'played_timeline' })
    }
    expect(insert).toHaveBeenCalledOnce()

    // Second press: key present → skip
    ss.getItem.mockReturnValue('1')
    if (!ss.getItem(SESSION_KEY)) {
      fw.conversion({ action: 'played_timeline' })
    }
    expect(insert).toHaveBeenCalledOnce() // still only once
  })
})
