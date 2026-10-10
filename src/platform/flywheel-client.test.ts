import { describe, expect, it } from 'vitest'
import { createFlywheelClient, type SupabaseLike } from './flywheel-client'

describe('createFlywheelClient', () => {
  it('null supabase: conversion() is a no-op — does not throw', () => {
    const fw = createFlywheelClient({ app: 'test', supabase: null })
    expect(() => fw.conversion()).not.toThrow()
  })

  it('with supabase: conversion() inserts a row with event "conversion"', () => {
    const rows: unknown[] = []
    const supabase: SupabaseLike = {
      from: (_table: string) => ({
        insert: (row: unknown) => { rows.push(row); return Promise.resolve() },
      }),
    }
    const fw = createFlywheelClient({ app: 'test', supabase })
    fw.conversion({ action: 'played' })
    expect(rows).toHaveLength(1)
    expect((rows[0] as { event: string }).event).toBe('conversion')
  })

  it('rejected insert is swallowed — no unhandled rejection propagates', async () => {
    const supabase: SupabaseLike = {
      from: (_table: string) => ({
        insert: (_row: unknown) => Promise.reject(new Error('network')),
      }),
    }
    const fw = createFlywheelClient({ app: 'test', supabase })
    expect(() => fw.conversion()).not.toThrow()
    // flush microtasks — createFlywheelClient calls .then(()=>{}, ()=>{}) to handle it
    await Promise.resolve()
  })
})
