// Usage tracking via the vendored Flywheel Common Platform client.
// First-party, cookieless, fire-and-forget; ships dark (no-op) unless
// VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY are set at build time.
// Dep-free: a ~15-line REST shim stands in for supabase-js (insert-only RLS).
import { createFlywheelClient, type SupabaseLike } from './platform/flywheel-client'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined

export function restShim(baseUrl: string, apikey: string, doFetch = fetch): SupabaseLike {
  return {
    from(table: string) {
      return {
        insert(row: unknown) {
          return doFetch(`${baseUrl}/rest/v1/${table}`, {
            method: 'POST',
            headers: {
              apikey,
              Authorization: `Bearer ${apikey}`,
              'Content-Type': 'application/json',
              Prefer: 'return=minimal',
            },
            body: JSON.stringify(row),
            keepalive: true,
          }).catch(() => undefined) // analytics must never break the app
        },
      }
    },
  }
}

const fw = createFlywheelClient({
  app: 'metro',
  supabase: url && key ? restShim(url, key) : null,
})

export const track = fw.track
export const conversion = fw.conversion

// Boot: page_view on load; the aha moment is pressing Play (watching the
// network grow) — fire `conversion` once per session on the first press.
if (typeof document !== 'undefined') {
  track('page_view')
  let fired = false
  document.getElementById('playBtn')?.addEventListener('click', () => {
    if (fired) return
    fired = true
    conversion({ action: 'played_timeline' })
  })
}
