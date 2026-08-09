import {deleteQuote, listAnalytics, listQuotes, signIn, signOut, updateQuoteStatus} from './modules/supabase.js';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const loginPanel = $('[data-login-panel]');
const dashboard = $('[data-dashboard]');
const loginForm = $('[data-login-form]');
const status = $('.admin-status');
const list = $('[data-quote-list]');
const refreshButtons = $$('[data-refresh]');
const tokenKey = 'truenorth-supabase-session';
const typeFilter = $('[data-filter-type]');
if (typeFilter) typeFilter.setAttribute('aria-label', 'Project type filter');
let quotes = [];
let analytics = [];
let pendingDelete = null;
let refreshTimer;

const escape = value => { const node = document.createElement('div'); node.textContent = value == null ? '' : value; return node.innerHTML; };
const dateValue = value => new Date(value || Date.now()).getTime();
const formatDate = value => new Intl.DateTimeFormat('en-PK', {dateStyle:'medium', timeStyle:'short'}).format(new Date(value));
const currentSession = () => { try { return JSON.parse(sessionStorage.getItem(tokenKey) || 'null'); } catch { return null; } };
const saveSession = data => sessionStorage.setItem(tokenKey, JSON.stringify(data));
const clearSession = () => sessionStorage.removeItem(tokenKey);
const token = () => currentSession() && currentSession().access_token;

function toast(message, type) { const node = document.createElement('div'); node.className = 'toast ' + (type || 'success'); node.textContent = message; $('[data-toast-stack]').append(node); setTimeout(() => node.remove(), 3800); }
function message(value, type) { status.textContent = value; status.dataset.type = type || 'info'; }
function setBusy(busy) { refreshButtons.forEach(button => { button.disabled = busy; }); const icon = $('[data-refresh-icon]'); if (icon) icon.classList.toggle('spin', busy); }
function switchView(name) { $$('[data-view]').forEach(button => button.classList.toggle('is-active', button.dataset.view === name)); $$('[data-view-panel]').forEach(panel => panel.classList.toggle('is-active', panel.dataset.viewPanel === name)); }

function filteredQuotes() {
  const query = $('[data-search]').value.trim().toLowerCase();
  const type = $('[data-filter-type]').value;
  const direction = $('[data-sort]').value === 'oldest' ? 1 : -1;
  return quotes.filter(row => !type || row.project_type === type).filter(row => !query || [row.name,row.email,row.project_type,row.message].some(value => String(value || '').toLowerCase().includes(query))).sort((a,b) => (dateValue(a.created_at) - dateValue(b.created_at)) * direction);
}

function renderQuotes() {
  const rows = filteredQuotes();
  if (!rows.length) { list.innerHTML = '<div class=\"empty-state\"><strong>No quote requests found</strong><span>Try changing your search or filters, or check back after the next enquiry.</span></div>'; return; }
  list.innerHTML = rows.map(row => '<article class=\"crm-card\" data-quote-id=\"' + escape(row.id) + '\"><div><h3>' + escape(row.name) + '</h3><a href=\"mailto:' + escape(row.email) + '\">' + escape(row.email) + '</a></div><div><p><strong>' + escape(row.project_type) + '</strong></p><p>' + (row.area ? escape(row.area) + ' sq ft' : 'Area not provided') + ' · ' + formatDate(row.created_at) + '</p></div><p class=\"message\" title=\"' + escape(row.message) + '\">' + escape(row.message) + '</p><div class=\"crm-actions\"><select class=\"status-select\" data-status aria-label=\"Change quote status\"><option value=\"new\" ' + (row.status === 'new' ? 'selected' : '') + '>New</option><option value=\"quoted\" ' + (row.status === 'quoted' ? 'selected' : '') + '>Quoted</option><option value=\"won\" ' + (row.status === 'won' ? 'selected' : '') + '>Won</option><option value=\"lost\" ' + (row.status === 'lost' ? 'selected' : '') + '>Lost</option></select><button class=\"copy-button\" type=\"button\" data-copy title=\"Copy email\" aria-label=\"Copy email\">⧉</button><button class=\"delete-button\" type=\"button\" data-delete title=\"Delete request\" aria-label=\"Delete request\">×</button></div></article>').join('');
}

function renderAnalytics() {
  const now = new Date(), midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime(), week = midnight - 6 * 86400000, month = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const counts = {today:0,week:0,month:0,total:quotes.length}, statuses = {new:0,quoted:0,won:0,lost:0}, types = {};
  const days = Array.from({length:14}, (_, index) => { const date = new Date(midnight - (13-index)*86400000); return {date:date,count:0}; });
  quotes.forEach(row => { const time = dateValue(row.created_at); if (time >= midnight) counts.today++; if (time >= week) counts.week++; if (time >= month) counts.month++; statuses[row.status] = (statuses[row.status] || 0) + 1; types[row.project_type] = (types[row.project_type] || 0) + 1; const day = days.find(item => item.date.toDateString() === new Date(time).toDateString()); if (day) day.count++; });
  Object.entries(counts).forEach(([key,value]) => { const node = $('[data-metric=\"' + key + '\"]'); if (node) node.textContent = value; });
  const areas = quotes.map(row => Number(row.area)).filter(value => value > 0);
  $('[data-metric=\"average\"]').textContent = areas.length ? Math.round(areas.reduce((sum, value) => sum + value, 0) / areas.length).toLocaleString() : '0';
  $('[data-metric=\"visitors\"]').textContent = new Set(analytics.map(row => row.session_id).filter(Boolean)).size.toLocaleString();
  $('[data-status-count=\"new\"]').textContent = (statuses.new || 0) + (statuses.quoted || 0); $('[data-status-count=\"won\"]').textContent = statuses.won || 0; $('[data-status-count=\"lost\"]').textContent = statuses.lost || 0;
  const conversion = quotes.length ? Math.round((statuses.won / quotes.length) * 100) : 0; $('[data-conversion]').textContent = conversion + '%';
  const max = Math.max(1, ...days.map(day => day.count)); $('[data-activity-chart]').innerHTML = days.map((day,index) => '<div class=\"' + (index === 13 ? 'is-today' : '') + '\" style=\"height:' + Math.max(5, day.count / max * 100) + '%\" title=\"' + day.count + ' quote(s)\"><span>' + day.date.getDate() + '/' + (day.date.getMonth()+1) + '</span></div>').join('');
  const wonPct = quotes.length ? statuses.won / quotes.length * 100 : 0, openPct = quotes.length ? (statuses.new + statuses.quoted) / quotes.length * 100 : 100; $('[data-donut]').style.background = 'conic-gradient(var(--admin-green) 0 ' + wonPct + '%, #6d9fe4 ' + wonPct + '% ' + (wonPct + openPct) + '%, #e36b70 ' + (wonPct + openPct) + '% 100%)';
  const typeRows = Object.entries(types).sort((a,b) => b[1]-a[1]).slice(0,5), largest = Math.max(1, ...typeRows.map(item => item[1])); $('[data-type-list]').innerHTML = typeRows.length ? typeRows.map(item => '<div class=\"type-row\"><span>' + escape(item[0]) + '</span><i style=\"--value:' + (item[1]/largest*100) + '%\"></i><b>' + item[1] + '</b></div>').join('') : '<p class=\"muted\">No project mix yet.</p>';
  const activity = quotes.slice().sort((a,b) => dateValue(b.created_at)-dateValue(a.created_at)).slice(0,5).map(row => '<div class=\"activity-row\"><i></i><span><strong>' + escape(row.name) + '</strong> requested ' + escape(row.project_type) + '<br><small>' + formatDate(row.created_at) + '</small></span><small>' + escape(row.status || 'new') + '</small></div>').join('');
  $('[data-activity-list]').innerHTML = activity || '<p class=\"muted\">No recent activity.</p>'; $('[data-full-activity]').innerHTML = activity || '<div class=\"empty-state\"><strong>No activity yet</strong><span>New quote and visitor events will appear here.</span></div>';
}

function fillFilters() { const select = $('[data-filter-type]'), current = select.value, types = [...new Set(quotes.map(row => row.project_type).filter(Boolean))].sort(); select.innerHTML = '<option value=\"\">All project types</option>' + types.map(type => '<option value=\"' + escape(type) + '\">' + escape(type) + '</option>').join(''); select.value = types.includes(current) ? current : ''; }
function exportCsv() { const headers = ['Name','Email','Project type','Area','Status','Message','Created']; const body = filteredQuotes().map(row => [row.name,row.email,row.project_type,row.area,row.status,row.message,row.created_at].map(value => '\"' + String(value == null ? '' : value).replaceAll('\"','\"\"') + '\"').join(',')); const blob = new Blob([[headers.join(','),...body].join('\\n')], {type:'text/csv;charset=utf-8'}); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'true-north-quotes-' + new Date().toISOString().slice(0,10) + '.csv'; link.click(); URL.revokeObjectURL(link.href); toast('CSV export downloaded.'); }

async function load() { if (!token()) return; setBusy(true); $('[data-dashboard-status]').textContent = 'Refreshing pipeline...'; try { quotes = await listQuotes(token()); analytics = await listAnalytics(token()).catch(() => []); fillFilters(); renderQuotes(); renderAnalytics(); $('[data-dashboard-status]').textContent = 'Updated just now · ' + quotes.length + ' total request' + (quotes.length === 1 ? '' : 's'); } catch (error) { clearSession(); dashboard.hidden = true; loginPanel.hidden = false; message(error.message.includes('expired') ? 'Your session expired. Please sign in again.' : error.message, 'error'); toast('Could not load the dashboard.', 'error'); } finally { setBusy(false); } }
async function changeStatus(row, value) { try { await updateQuoteStatus(row.id, value, token()); row.status = value; renderAnalytics(); toast('Marked ' + row.name + ' as ' + value + '.'); } catch (error) { toast(error.message || 'Status could not be saved. Run the admin migration first.', 'error'); renderQuotes(); } }

loginForm.addEventListener('submit', async event => { event.preventDefault(); const button = loginForm.querySelector('button'); button.disabled = true; message('Signing in...'); try { const values = Object.fromEntries(new FormData(loginForm).entries()); const auth = await signIn(values.email, values.password); saveSession(auth); loginPanel.hidden = true; dashboard.hidden = false; toast('Welcome back.'); await load(); refreshTimer = setInterval(load, 30000); } catch (error) { message(error.message || 'Unable to sign in.', 'error'); } finally { button.disabled = false; } });
refreshButtons.forEach(button => button.addEventListener('click', load)); $('[data-search]').addEventListener('input', renderQuotes); $('[data-filter-type]').addEventListener('change', renderQuotes); $('[data-sort]').addEventListener('change', renderQuotes); $('[data-export]').addEventListener('click', exportCsv); $('[data-go-quotes]').addEventListener('click', () => switchView('quotes')); $$('[data-view]').forEach(button => button.addEventListener('click', () => switchView(button.dataset.view)));
$('[data-theme-toggle]').addEventListener('click', () => { document.body.classList.toggle('admin-dark'); localStorage.setItem('truenorth-admin-dark', document.body.classList.contains('admin-dark') ? '1' : '0'); }); if (localStorage.getItem('truenorth-admin-dark') === '1') document.body.classList.add('admin-dark');
list.addEventListener('click', async event => { const card = event.target.closest('[data-quote-id]'); if (!card) return; const row = quotes.find(item => item.id === card.dataset.quoteId); if (!row) return; if (event.target.closest('[data-copy]')) { try { await navigator.clipboard.writeText(row.email); toast('Email copied to clipboard.'); } catch { toast('Copy was blocked by the browser. Select the email manually.', 'error'); } } if (event.target.closest('[data-delete]')) { pendingDelete = row; $('[data-delete-dialog]').showModal(); } });
list.addEventListener('change', event => { if (!event.target.matches('[data-status]')) return; const row = quotes.find(item => item.id === event.target.closest('[data-quote-id]').dataset.quoteId); if (row) changeStatus(row, event.target.value); });
$('[data-cancel-delete]').addEventListener('click', () => { pendingDelete = null; $('[data-delete-dialog]').close(); }); $('[data-confirm-delete]').addEventListener('click', async () => { if (!pendingDelete) return; const row = pendingDelete; try { await deleteQuote(row.id, token()); quotes = quotes.filter(item => item.id !== row.id); $('[data-delete-dialog]').close(); renderQuotes(); renderAnalytics(); toast('Quote request deleted.'); } catch (error) { toast(error.message || 'Delete failed.', 'error'); } pendingDelete = null; });
$('[data-signout]').addEventListener('click', async () => { try { if (token()) await signOut(token()); } catch {} clearSession(); clearInterval(refreshTimer); dashboard.hidden = true; loginPanel.hidden = false; loginForm.reset(); message('Signed out successfully.'); }); if (token()) { loginPanel.hidden = true; dashboard.hidden = false; refreshTimer = setInterval(load, 30000); load(); }
