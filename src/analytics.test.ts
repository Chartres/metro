import { describe, expect, it, vi } from 'vitest'
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
