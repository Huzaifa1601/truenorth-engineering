import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseReady } from '../supabase-config.js';

function endpoint(path) {
  return `${SUPABASE_URL}${path}`;
}

function headers(token = SUPABASE_ANON_KEY) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

async function request(path, options = {}, token) {

  if (!supabaseReady) {
    throw new Error('Website is not connected to Supabase.');
  }

  let response;

  try {

    response = await fetch(endpoint(path), {
      ...options,
      headers: {
        ...headers(token),
        ...(options.headers || {})
      }
    });

  } catch {

    throw new Error(
      'Unable to connect to the server. Please check your internet connection.'
    );

  }

  const data =
    response.status === 204
      ? null
      : await response.json().catch(() => ({}));

  if (!response.ok) {

    const message =
      data?.message ||
      data?.error_description ||
      data?.error ||
      '';

    switch (message) {

      case 'Invalid login credentials':
        throw new Error('Incorrect email or password.');

      case 'Email not confirmed':
        throw new Error('Please verify your email before signing in.');

      case 'User not found':
        throw new Error('No account exists with that email.');

      case 'JWT expired':
        throw new Error('Your session has expired. Please sign in again.');

      default:
        throw new Error(
          message || `Request failed (${response.status}).`
        );
    }

  }

  return data;
}

export function submitQuote(payload) {

  return request(
    '/rest/v1/quote_requests',
    {
      method: 'POST',
      headers: {
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(payload)
    }
  );

}

export async function uploadQuoteAttachment(file) {
  if (!supabaseReady) throw new Error('Website is not connected to Supabase.');
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
  const path = `public/${crypto.randomUUID()}-${safeName}`;
  const response = await fetch(endpoint('/storage/v1/object/quote-attachments/' + path), {
    method: 'POST',
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, 'x-upsert': 'false', 'Content-Type': file.type || 'application/octet-stream' },
    body: file
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'An attachment could not be uploaded.');
  }
  return path;
}

export function signIn(email, password) {

  return request(
    '/auth/v1/token?grant_type=password',
    {
      method: 'POST',
      body: JSON.stringify({
        email,
        password
      })
    }
  );

}

export function signOut(token) {

  return request(
    '/auth/v1/logout',
    {
      method: 'POST'
    },
    token
  );

}

export function listQuotes(token) {
  return request('/rest/v1/quote_requests?select=id,name,email,project_type,area,message,status,attachment_paths,created_at,updated_at&order=created_at.desc&limit=500', {}, token)
    .catch(() => request('/rest/v1/quote_requests?select=id,name,email,project_type,area,message,attachment_paths,created_at&order=created_at.desc&limit=500', {}, token)
      .then(rows => rows.map(row => ({...row, status: 'new'})))
      .catch(() => request('/rest/v1/quote_requests?select=id,name,email,project_type,area,message,created_at&order=created_at.desc&limit=500', {}, token)
        .then(rows => rows.map(row => ({...row, status: 'new', attachment_paths: []})))));
}

export function updateQuoteStatus(id, status, token) {
  return request('/rest/v1/quote_requests?id=eq.' + encodeURIComponent(id), {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({status, updated_at: new Date().toISOString()})
  }, token);
}

export async function createAttachmentUrl(path, token) {
  const safePath = String(path || '').split('/').map(encodeURIComponent).join('/');
  const data = await request('/storage/v1/object/sign/quote-attachments/' + safePath, {
    method: 'POST',
    body: JSON.stringify({expiresIn: 3600})
  }, token);
  return data?.signedURL ? endpoint('/storage/v1' + data.signedURL) : '';
}

export function deleteQuote(id, token) {
  return request('/rest/v1/quote_requests?id=eq.' + encodeURIComponent(id), {method: 'DELETE'}, token);
}

export function listAnalytics(token) {
  return request('/rest/v1/analytics_events?select=session_id,event_name,path,created_at&order=created_at.desc&limit=2000', {}, token);
}
