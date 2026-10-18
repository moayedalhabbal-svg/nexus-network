import { createBrowserClient } from '@supabase/ssr'
import { isDemoModeEnabled } from '@/lib/runtime-mode'

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

function createDemoQueryChain() {
  const chain = {
    eq: () => chain,
    order: () => chain,
    range: () => chain,
    limit: () => chain,
    single: async () => ({ data: null, error: null }),
    maybeSingle: async () => ({ data: null, error: null }),
    select: () => chain,
    then: (resolve: (value: { data: unknown[]; error: null }) => unknown) => resolve({ data: [], error: null }),
  }
  return chain
}

function createDemoMutation<T = unknown>(value: T) {
  const payload = value ?? null
  const mutationResult = { data: payload, error: null }

  const mutation = {
    ...mutationResult,
    select: () => ({
      single: async () => ({ data: payload, error: null }),
      maybeSingle: async () => ({ data: payload, error: null }),
      order: async () => ({ data: payload !== null ? [payload as never] : [], error: null }),
      range: async () => ({ data: payload !== null ? [payload as never] : [], error: null }),
      eq: () => ({
        single: async () => ({ data: payload, error: null }),
        maybeSingle: async () => ({ data: payload, error: null }),
        order: async () => ({ data: payload !== null ? [payload as never] : [], error: null }),
        range: async () => ({ data: payload !== null ? [payload as never] : [], error: null }),
      }),
    }),
    single: async () => ({ data: payload, error: null }),
    eq: () => ({
      ...mutationResult,
      select: () => ({
        single: async () => ({ data: payload, error: null }),
        maybeSingle: async () => ({ data: payload, error: null }),
      }),
      then: (resolve: (value: typeof mutationResult) => unknown) => resolve(mutationResult),
    }),
    order: async () => ({ data: payload !== null ? [payload as never] : [], error: null }),
    range: async () => ({ data: payload !== null ? [payload as never] : [], error: null }),
    then: (resolve: (value: typeof mutationResult) => unknown) => resolve(mutationResult),
  }

  return mutation
}

export function createClient() {
  const { url, anonKey, isDemo } = getSupabaseConfig()

  if (isDemo || isDemoModeEnabled()) {
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
        select: () => createDemoQueryChain(),
        insert: (values: unknown) => createDemoMutation(values),
        update: (values: unknown) => createDemoMutation(values),
        delete: () => ({
          eq: async () => ({ data: null, error: null }),
        }),
      }),
      rpc: async () => ({ data: null, error: null }),
      storage: {
        from: () => ({
          upload: async () => ({ data: { path: 'demo-upload' }, error: null }),
          getPublicUrl: (path: string) => ({ data: { publicUrl: `https://demo.supabase.co/storage/v1/object/public/post_media/${path}` }, error: null }),
        }),
      },
    } as unknown as ReturnType<typeof createBrowserClient>
  }

  return createBrowserClient(url, anonKey)
}
