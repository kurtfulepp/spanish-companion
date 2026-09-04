import { createBrowserClient } from '@supabase/ssr';

function getBrowserConfig() {
  const root = document.documentElement;
  const url = root.dataset.supabaseUrl?.trim();
  const publishableKey = root.dataset.supabasePublishableKey?.trim();
  if (!url || !publishableKey) {
    throw new Error('Supabase is temporarily unavailable. Reload the page to try again.');
  }
  return { url, publishableKey };
}

export function createClient() {
  const { url, publishableKey } = getBrowserConfig();
  return createBrowserClient(url, publishableKey);
}
