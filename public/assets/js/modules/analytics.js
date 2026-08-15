import {SUPABASE_ANON_KEY, SUPABASE_URL, supabaseReady} from '../supabase-config.js';

function sessionId() {
  const key = 'truenorth-analytics-session';
  let value = sessionStorage.getItem(key);
  if (!value) { value = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random(); sessionStorage.setItem(key, value); }
  return value;
}

export function initAnalytics() {
  if (!supabaseReady) return;
  const payload = {session_id: sessionId(), event_name: 'page_view', path: location.pathname, metadata: {referrer: document.referrer || ''}};
  fetch(SUPABASE_URL + '/rest/v1/analytics_events', {method:'POST', headers:{apikey:SUPABASE_ANON_KEY, Authorization:'Bearer ' + SUPABASE_ANON_KEY, 'Content-Type':'application/json', Prefer:'return=minimal'}, body:JSON.stringify(payload)}).catch(() => {});
  document.addEventListener('click', event => { const target = event.target.closest('[data-track]'); if (!target) return; fetch(SUPABASE_URL + '/rest/v1/analytics_events', {method:'POST', headers:{apikey:SUPABASE_ANON_KEY, Authorization:'Bearer ' + SUPABASE_ANON_KEY, 'Content-Type':'application/json', Prefer:'return=minimal'}, body:JSON.stringify({session_id:sessionId(), event_name:target.dataset.track, path:location.pathname, metadata:{label:target.textContent.trim().slice(0,80)}})}).catch(() => {}); });
}
