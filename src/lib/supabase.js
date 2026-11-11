/**
 * Supabase Client & Cloud Database Integration Service
 * Ayaana's Luxury Skincare
 *
 * Admin login uses Supabase Auth (passwords are checked by Supabase, never
 * stored in this code). Database permissions are enforced by RLS policies
 * in supabase_schema.sql.
 */

const STORAGE_KEY_URL = 'ayaana_supabase_url';
const STORAGE_KEY_ANON = 'ayaana_supabase_anon';
const SESSION_KEY = 'ayaana_admin_session';

// The anon key is a public key by design; security comes from RLS policies.
const DEFAULT_SUPABASE_URL = 'https://piqsnvnrjedkhlpomktq.supabase.co';
const DEFAULT_SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpcXNudm5yamVka2hscG9ta3RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0ODk2NjcsImV4cCI6MjEwODA2NTY2N30.rnfWH0ZHZiBn_rrOcsXQ0qQG5cmwdRT0HEPpPHdvS58';

export function getSupabaseConfig() {
  const url = localStorage.getItem(STORAGE_KEY_URL) || import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const anon = localStorage.getItem(STORAGE_KEY_ANON) || import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON;
  return {
    url: (url || '').trim().replace(/\/+$/, ''),
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

// ---------------------------------------------------------------------------
// Auth session helpers
// ---------------------------------------------------------------------------

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSession(data) {
  if (!data?.access_token) {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
  const session = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at || Math.floor(Date.now() / 1000) + (data.expires_in || 3600),
    email: data.user?.email || null
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

async function authRequest(path, { method = 'POST', body, token } = {}) {
  const { url, anon, isConnected } = getSupabaseConfig();
  if (!isConnected) return { data: null, error: new Error('Supabase is not configured yet.') };

  try {
    const res = await fetch(`${url}/auth/v1/${path}`, {
      method,
      headers: {
        apikey: anon,
        Authorization: `Bearer ${token || anon}`,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) {
      const msg = data?.error_description || data?.msg || data?.message || `Auth error (${res.status})`;
      return { data: null, error: new Error(msg) };
    }
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

let refreshPromise = null;

/** Returns a valid session (refreshing it if it is about to expire), or null. */
export async function getValidSession() {
  const session = readSession();
  if (!session) return null;

  const now = Math.floor(Date.now() / 1000);
  if (session.expires_at - now > 60) return session;
  if (!session.refresh_token) {
    writeSession(null);
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = authRequest('token?grant_type=refresh_token', {
      body: { refresh_token: session.refresh_token }
    }).finally(() => { refreshPromise = null; });
  }
  const { data, error } = await refreshPromise;
  if (error || !data) {
    writeSession(null);
    return null;
  }
  return writeSession(data);
}

export async function signInWithPassword(email, password) {
  const { data, error } = await authRequest('token?grant_type=password', {
    body: { email: (email || '').trim().toLowerCase(), password }
  });
  if (error) return { session: null, error };
  return { session: writeSession(data), error: null };
}

export async function signOut() {
  const session = readSession();
  writeSession(null);
  if (session?.access_token) {
    await authRequest('logout', { token: session.access_token });
  }
}

export async function updateOwnPassword(newPassword) {
  const session = await getValidSession();
  if (!session) return { error: new Error('Your session has expired. Please log in again.') };
  const { error } = await authRequest('user', {
    method: 'PUT',
    body: { password: newPassword },
    token: session.access_token
  });
  return { error };
}

/**
 * Creates a Supabase Auth login for a new admin. Works only if "Allow new users
 * to sign up" is enabled in Supabase; otherwise create the user from the
 * Supabase Dashboard (Authentication -> Users -> Add user).
 */
export async function signUpUser(email, password) {
  const { data, error } = await authRequest('signup', {
    body: { email: (email || '').trim().toLowerCase(), password }
  });
  return { data, error };
}

// ---------------------------------------------------------------------------
// REST queries
// ---------------------------------------------------------------------------

/**
 * Execute a Supabase REST query. Uses the logged-in admin's token when there
 * is one, otherwise the public anon key.
 */
export async function supabaseQuery(endpoint, options = {}) {
  const { url, anon, isConnected } = getSupabaseConfig();
  if (!isConnected) {
    return { data: null, error: new Error('Supabase is not configured yet.') };
  }

  const session = options.anonymous ? null : await getValidSession();
  const headers = {
    apikey: anon,
    Authorization: `Bearer ${session?.access_token || anon}`,
    'Content-Type': 'application/json',
    Prefer: options.prefer || 'return=representation',
    ...(options.headers || {})
  };

  try {
    const res = await fetch(`${url}/rest/v1/${endpoint}`, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    const text = await res.text();
    if (!res.ok) {
      return { data: null, error: new Error(`Supabase error (${res.status}): ${text}`) };
    }
    return { data: text ? JSON.parse(text) : null, error: null };
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
