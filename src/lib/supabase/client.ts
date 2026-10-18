import { createBrowserClient } from '@supabase/ssr'

const DEMO_SUPABASE_URL = 'https://demo.supabase.co'
const DEMO_SUPABASE_ANON_KEY = 'demo-anon-key'

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

  if (url && url !== 'demo' && /^https?:\/\//i.test(url) && anonKey) {
    return { url, anonKey, isDemo: false }
  }

  return { url: DEMO_SUPABASE_URL, anonKey: DEMO_SUPABASE_ANON_KEY, isDemo: true }
}

export function createClient() {
  const { url, anonKey, isDemo } = getSupabaseConfig()

  if (isDemo) {
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({
          data: {
            subscription: {
              unsubscribe: () => undefined,
            },
          },
        }),
        signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
        signUp: async () => ({ data: { user: null, session: null }, error: null }),
        signOut: async () => ({ error: null }),
        resetPasswordForEmail: async () => ({ data: null, error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: null }),
            order: async () => ({ data: [], error: null }),
          }),
          order: async () => ({ data: [], error: null }),
        }),
        insert: async () => ({ data: null, error: null }),
        update: async () => ({ data: null, error: null }),
        delete: async () => ({ data: null, error: null }),
      }),
    } as any
  }

  return createBrowserClient(url, anonKey)
}
