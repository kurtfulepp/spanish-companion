const SUPABASE_URL_ENV = 'NEXT_PUBLIC_SUPABASE_URL';
const SUPABASE_KEY_ENV = 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY';

export type SupabaseConfig = {
  url: string;
  publishableKey: string;
};

// Read by name so hosted Worker bindings remain runtime values instead of being
// removed from a client bundle during a clean production build.
function readRuntimeEnv(name: string) {
  return process.env[name]?.trim() ?? '';
}

export function getSupabaseConfig(): SupabaseConfig {
  return {
    url: readRuntimeEnv(SUPABASE_URL_ENV),
    publishableKey: readRuntimeEnv(SUPABASE_KEY_ENV),
  };
}

export function requireSupabaseConfig(): SupabaseConfig {
  const config = getSupabaseConfig();
  if (!config.url || !config.publishableKey) {
    throw new Error('Supabase runtime configuration is unavailable.');
  }
  return config;
}
