/**
 * Supabase Client & Cloud Database Integration Service
 * Ayaana's Luxury Skincare
 */

const STORAGE_KEY_URL = 'ayaana_supabase_url';
const STORAGE_KEY_ANON = 'ayaana_supabase_anon';

const DEFAULT_SUPABASE_URL = 'https://piqsnvnrjedkhlpomktq.supabase.co';
const DEFAULT_SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpcXNudm5yamVka2hscG9ta3RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0ODk2NjcsImV4cCI6MjEwODA2NTY2N30.rnfWH0ZHZiBn_rrOcsXQ0qQG5cmwdRT0HEPpPHdvS58';

export function getSupabaseConfig() {
  const url = localStorage.getItem(STORAGE_KEY_URL) || import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const anon = localStorage.getItem(STORAGE_KEY_ANON) || import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON;
  return {
    url: (url || '').trim(),
    anon: (anon || '').trim(),
    isConnected: Boolean(url && anon)
  };
}

export function saveSupabaseConfig(url, anon) {
  if (url) localStorage.setItem(STORAGE_KEY_URL, url.trim());
  else localStorage.removeItem(STORAGE_KEY_URL);

  if (anon) localStorage.setItem(STORAGE_KEY_ANON, anon.trim());
  else localStorage.removeItem(STORAGE_KEY_ANON);

  return getSupabaseConfig();
}

/**
 * Execute standard Supabase REST query
 */
export async function supabaseQuery(endpoint, options = {}) {
  const { url, anon, isConnected } = getSupabaseConfig();
  if (!isConnected) {
    return { data: null, error: new Error("Supabase is not configured yet.") };
  }

  const cleanUrl = url.replace(/\/+$/, '');
  const targetUrl = `${cleanUrl}/rest/v1/${endpoint}`;

  const headers = {
    'apikey': anon,
    'Authorization': `Bearer ${anon}`,
    'Content-Type': 'application/json',
    'Prefer': options.prefer || 'return=representation',
    ...(options.headers || {})
  };

  try {
    const res = await fetch(targetUrl, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    if (!res.ok) {
      const errText = await res.text();
      return { data: null, error: new Error(`Supabase error (${res.status}): ${errText}`) };
    }

    const data = await res.json();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Test Supabase connection
 */
export async function testSupabaseConnection(url, anon) {
  const cleanUrl = (url || '').replace(/\/+$/, '');
  if (!cleanUrl || !anon) {
    return { success: false, message: "Please provide both Supabase Project URL and Anon Public Key." };
  }

  try {
    const res = await fetch(`${cleanUrl}/rest/v1/products?select=id&limit=1`, {
      headers: {
        'apikey': anon,
        'Authorization': `Bearer ${anon}`
      }
    });

    if (res.ok) {
      return { success: true, message: "Successfully connected to your Supabase Database!" };
    } else {
      const txt = await res.text();
      return { success: false, message: `Failed with status ${res.status}: ${txt}` };
    }
  } catch (err) {
    return { success: false, message: `Network error: ${err.message}` };
  }
}
