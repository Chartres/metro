import { describe, expect, it, vi } from 'vitest'
import { buildEventRow, createFlywheelClient, resolveIds } from './flywheel-client'

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

  it('returns "anon" for visitor_id when ls-storage throws', () => {
    const bad = {
      getItem: () => { throw new Error('no storage') },
      setItem: () => { throw new Error('no storage') },
    } as unknown as Storage
    // bad storage is used as ls (visitor_id); session_id may come from native sessionStorage
    const ids = resolveIds(bad)
    expect(ids.visitor_id).toBe('anon')
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
