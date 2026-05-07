/* ═══════════════════════════════════════
   app.js — Eventara Main Controller
   Single clean implementation.
   No IIFEs, no duplicate functions.
═══════════════════════════════════════ */

/* ─────────────────────────────────────
   GLOBAL CONFIGURATION & CLAIMS
───────────────────────────────────── */
// Docker-compose maps the API to 5100
//const API_BASE_URL = 'http://localhost:5100'; 

/* ─────────────────────────────────────
   STATE
───────────────────────────────────── */
let currentUser  = null;   // { id, email, fullName, role }
let currentView  = null;
let toastTimer   = null;
let plannerEventId = null; // used by planner manage view

/* ─────────────────────────────────────
   A) UTILITIES
───────────────────────────────────── */
const $ = id => document.getElementById(id);

function esc(v) {
  if (v == null) return '';
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmt(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return dateStr; }
}

function money(v) {
  if (v == null) return '—';
  return 'KES ' + Number(v).toLocaleString('en-KE', { minimumFractionDigits: 2 });
}

function sum(arr) {
  return arr.reduce((a, b) => a + (Number(b) || 0), 0);
}

function initials(name) {
  if (!name) return '?';
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

function showToast(msg, type = 'info') {
  const toast = $('toast');
  if (!toast) return;
  if (toastTimer) clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.className = 'toast show toast-' + type;
  toastTimer = setTimeout(() => { toast.className = 'toast'; toastTimer = null; }, type === 'error' ? 4000 : 3000);
}

function setLoading(on) {
  const el = $('global-loading');
  if (el) el.style.display = on ? 'flex' : 'none';
}

function setBtnLoading(btn, on, originalText) {
  if (!btn) return;
  btn.disabled = on;
  btn.textContent = on ? 'Loading…' : originalText;
}

function emptyBlock(msg) {
  return `<div class="empty-state"><div class="empty-title">${esc(msg)}</div></div>`;
}

function badge(label, kind) {
  return `<span class="badge badge-${esc(kind)}">${esc(label)}</span>`;
}

function eventStatus(eventDate) {
  if (!eventDate) return 'unknown';
  const d = new Date(eventDate);
  const now = new Date();
  if (d < now) return 'past';
  if (d - now < 86400000) return 'ongoing';
  return 'upcoming';
}

function eventBadge(eventDate) {
  const s = eventStatus(eventDate);
  const map = { upcoming: ['Upcoming', 'green'], ongoing: ['Ongoing', 'gold'], past: ['Past', 'gray'] };
  const [label, kind] = map[s] || ['Unknown', 'gray'];
  return badge(label, kind);
}

/* ─────────────────────────────────────
   B) API LAYER
───────────────────────────────────── */
async function api(method, path, body) {
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (token) opts.headers['Authorization'] = 'Bearer ' + token;
    if (body)  opts.body = JSON.stringify(body);

    const res = await fetch(API_BASE_URL + path, opts);

    if (res.status === 401) {
      logout(false);
      showToast('Session expired. Please sign in again.', 'error');
      return null;
    }

    if (!res.ok) {
      let errMsg = `Error ${res.status}`;
      try { const e = await res.json(); errMsg = e.message || errMsg; } catch {}
      showToast(errMsg, 'error');
      return null;
    }

    if (res.status === 204) return true;
    return await res.json();
  } catch (err) {
    showToast('Network error. Check your connection.', 'error');
    return null;
  } finally {
    setLoading(false);
  }
}

async function loadData() {
  const [users, events, payments, vendors, providers, registrations, eventVendors, eventServices, invitations, roles] = await Promise.all([
    api('GET', '/users'),
    api('GET', '/events'),
    api('GET', '/payments'),
    api('GET', '/vendors'),
    api('GET', '/service-providers'),
    api('GET', '/event-registrations'),
    api('GET', '/event-vendors'),
    api('GET', '/event-services'),
    api('GET', '/invitations'),
    api('GET', '/roles'),
  ]);
  return {
    users:          users          || [],
    events:         events         || [],
    payments:       payments       || [],
    vendors:        vendors        || [],
    providers:      providers      || [],
    registrations:  registrations  || [],
    eventVendors:   eventVendors   || [],
    eventServices:  eventServices  || [],
    invitations:    invitations    || [],
    roles:          roles          || [],
  };
}

function featureComingSoon(label) {
  showToast(`${label || 'This feature'} is coming soon.`, 'info');
}

/* ─────────────────────────────────────
   C) JWT HELPERS
───────────────────────────────────── */
function decodeJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json);
  } catch { return null; }
}

function getRoleFromPayload(p) {
  if (!p) return null;
  const raw = p[ROLE_CLAIM] || p['role'] || p['Role'] || '';
  return Array.isArray(raw) ? raw[0] : raw;
}

function getNameFromPayload(p) {
  if (!p) return '';
  return p[NAME_CLAIM] || p['FullName'] || p['name'] || p['fullName'] || '';
}

function getEmailFromPayload(p) {
  if (!p) return '';
  return p[EMAIL_CLAIM] || p['email'] || p['Email'] || '';
}

function normalizeRole(r) {
  if (!r) return null;
  const map = {
    admin: 'Admin', administrator: 'Admin',
    planner: 'Planner',
    vendor: 'Vendor',
    serviceprovider: 'ServiceProvider', 'service provider': 'ServiceProvider',
    attendee: 'Attendee', user: 'Attendee',
  };
  return map[r.toLowerCase()] || r;
}

function isExpired(p) {
  if (!p || !p.exp) return false;
  return Date.now() / 1000 > p.exp;
}

/* ─────────────────────────────────────
   D) AUTH — LOGIN PAGE
───────────────────────────────────── */
function switchAuthTab(tab, el) {
  document.querySelectorAll('.auth-tab').forEach(n => n.classList.remove('active'));
  if (el) el.classList.add('active');
  $('login-form').style.display    = tab === 'login'    ? 'block' : 'none';
  $('register-form').style.display = tab === 'register' ? 'block' : 'none';
}

async function handleLogin() {
  const email    = ($('login-email')    || {}).value?.trim();
  const password = ($('login-password') || {}).value;

  if (!email || !password) {
    showToast('Please enter your email and password.', 'error');
    return;
  }

  const btn = $('login-btn');
  setBtnLoading(btn, true, 'Sign In to Platform');

  const res = await api('POST', '/auth/login', { email, password });

  setBtnLoading(btn, false, 'Sign In to Platform');

  if (!res || !res.token) {
    showToast('Invalid credentials.', 'error');
    return;
  }

  localStorage.setItem('token', res.token);
  bootFromToken(res.token);
}

async function handleRegister() {
  const fullName = ($('reg-fullname') || {}).value?.trim();
  const email    = ($('reg-email')    || {}).value?.trim();
  const password = ($('reg-password') || {}).value;
  const roleEl   = $('register-role');
  const role     = roleEl ? roleEl.value : 'Attendee';

  if (!fullName || !email || !password) {
    showToast('Please fill in all fields.', 'error');
    return;
  }
  if (password.length < 8) {
    showToast('Password must be at least 8 characters.', 'error');
    return;
  }

  const btn = $('register-btn');
  setBtnLoading(btn, true, 'Create My Account');

  const res = await api('POST', '/auth/register', { fullName, email, password, roles: [role] });

  if (!res && res !== true) {
    setBtnLoading(btn, false, 'Create My Account');
    return;
  }

  showToast('Account created! Signing you in…', 'info');

  const loginRes = await api('POST', '/auth/login', { email, password });
  setBtnLoading(btn, false, 'Create My Account');

  if (!loginRes || !loginRes.token) {
    showToast('Account created. Please sign in.', 'info');
    switchAuthTab('login', document.querySelector('.auth-tab'));
    return;
  }

  localStorage.setItem('token', loginRes.token);
  bootFromToken(loginRes.token);
}

function handleGuestDemo() {
  currentUser = { id: 0, email: 'guest@demo.com', fullName: 'Guest User', role: 'demo' };
  showAllDashboards(false);
  $('auth-page').style.display = 'none';
  $('app-page').style.display  = 'block';
  buildDemoShell();
  showToast('Browsing as guest — demo data only.', 'info');
}

function bootFromToken(token) {
  const payload = decodeJwt(token);
  if (!payload || isExpired(payload)) {
    localStorage.removeItem('token');
    showToast('Session expired. Please sign in.', 'error');
    return;
  }

  const rawRole = getRoleFromPayload(payload);
  const role    = normalizeRole(rawRole);

  if (!role || !ROLE_CONFIG[role]) {
    showToast(`Unrecognised role "${rawRole}". Contact your administrator.`, 'error');
    return;
  }

  currentUser = {
    id:       parseInt(payload['userId'] || payload['sub'] || 0),
    email:    getEmailFromPayload(payload),
    fullName: getNameFromPayload(payload),
    role,
  };

  launchDashboard(role);
}

function restoreSession() {
  const token = localStorage.getItem('token');
  if (!token) return false;
  const payload = decodeJwt(token);
  if (!payload || isExpired(payload)) {
    localStorage.removeItem('token');
    return false;
  }
  bootFromToken(token);
  return true;
}

/* ─────────────────────────────────────
   E) ROUTING
───────────────────────────────────── */
function launchDashboard(role) {
  showAllDashboards(false);
  $('auth-page').style.display = 'none';
  $('app-page').style.display  = 'block';
  buildShell(role);
  navigate(ROLE_CONFIG[role].defaultView);
  showToast(`Welcome, ${currentUser.fullName}`, 'info');
}

function logout(showMsg = true) {
  localStorage.removeItem('token');
  currentUser = null;
  currentView = null;
  if (typeof closeModal === 'function') closeModal();
  $('app-page').style.display  = 'none';
  $('auth-page').style.display = 'flex';
  if (showMsg) showToast('Signed out successfully.', 'info');
}

function showAllDashboards(visible) {
  ['app-page', 'auth-page'].forEach(id => {
    const el = $(id);
    if (el) el.style.display = visible ? '' : 'none';
  });
}
/* ─────────────────────────────────────
   F) SHELL BUILDER
───────────────────────────────────── */
function buildShell(role) {
  const cfg = ROLE_CONFIG[role];
  if (!cfg) return;

  // Role badge
  const badge = $('sidebar-role-badge');
  if (badge) { badge.className = `sidebar-role-badge ${cfg.badgeClass}`; badge.textContent = cfg.label; }

  // User info
  const name     = currentUser?.fullName || cfg.label;
  const nameEl   = $('user-display-name');
  const roleEl   = $('user-display-role');
  const avatarEl = $('user-avatar-initials');
  if (nameEl)   nameEl.textContent   = name;
  if (roleEl)   roleEl.textContent   = cfg.label;
  if (avatarEl) avatarEl.textContent = initials(name);

  buildSidebar(cfg);
}

function buildSidebar(roleConfig) {
  const nav = $('sidebar-nav');
  if (!nav) return;

  nav.innerHTML = roleConfig.navSections.map(section => `
    <div class="sidebar-section">${esc(section.title)}</div>
    ${section.items.map(item => buildNavItem(item)).join('')}
  `).join('');
}

function buildNavItem(item) {
  const badgeHtml = item.badge ? `<span class="nav-badge">${esc(item.badge)}</span>` : '';
  const iconHtml  = buildIcon(item.icon);

  if (item.hasSubmenu) {
    const submenuItems = [
      { id: 'vendors',      label: 'All Vendors'    },
      { id: 'event-vendors', label: 'Event Vendors' },
    ];
    const subHtml = submenuItems.map(s => `
      <div class="nav-sub-item" data-view="${s.id}" onclick="navigate('${s.id}')">${esc(s.label)}</div>
    `).join('');

    return `
      <div class="nav-item" data-view="${item.id}" onclick="toggleVendorMenu()">
        ${iconHtml}<span>${esc(item.label)}</span>${badgeHtml}
        <span id="vendor-arrow" style="margin-left:auto;transition:transform .2s">+</span>
      </div>
      <div class="vendor-nav-sub" id="vendor-sub">${subHtml}</div>
    `;
  }

  return `
    <div class="nav-item" data-view="${item.id}" onclick="navigate('${item.id}')">
      ${iconHtml}<span>${esc(item.label)}</span>${badgeHtml}
    </div>
  `;
}

function buildIcon(iconName) {
  const paths = ICONS[iconName] || '';
  return `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

function setActiveNav(viewKey) {
  document.querySelectorAll('.nav-item, .nav-sub-item').forEach(n => n.classList.remove('active'));
  const el = document.querySelector(`[data-view="${viewKey}"]`);
  if (el) el.classList.add('active');
}

function buildDemoShell() {
  // Use Admin chrome for demo
  const cfg = ROLE_CONFIG['Admin'];
  const badge = $('sidebar-role-badge');
  if (badge) { badge.className = 'sidebar-role-badge role-admin'; badge.textContent = 'Demo'; }
  const nameEl   = $('user-display-name');
  const roleEl   = $('user-display-role');
  const avatarEl = $('user-avatar-initials');
  if (nameEl)   nameEl.textContent   = 'Guest User';
  if (roleEl)   roleEl.textContent   = 'Demo Mode';
  if (avatarEl) avatarEl.textContent = 'GU';

  // Add demo banner
  const main = document.querySelector('.main-wrap');
  if (main && !$('demo-banner')) {
    const banner = document.createElement('div');
    banner.id = 'demo-banner';
    banner.style.cssText = 'background:rgba(201,168,76,.15);border-bottom:1px solid rgba(201,168,76,.3);padding:8px 24px;font-size:12px;color:#c9a84c;text-align:center;';
    banner.innerHTML = '⚠️ Demo Mode — No real data. <a href="#" onclick="logout()" style="color:#c9a84c;text-decoration:underline">Sign In</a> to access live data.';
    main.prepend(banner);
  }

  buildSidebar(cfg);
  // Load demo view
  const content = $('main-content');
  if (content) content.innerHTML = `<div class="view active">${getViewTemplate('dashboard') || emptyBlock('Demo dashboard')}</div>`;
  const title = $('page-title'); if (title) title.textContent = 'Dashboard (Demo)';
  const bc    = $('bc-cur');    if (bc)    bc.textContent    = 'Dashboard';
}

/* ─────────────────────────────────────
   G) NAVIGATION
───────────────────────────────────── */
async function navigate(viewKey) {
  if (!currentUser) return;

  currentView = viewKey;
  setActiveNav(viewKey);

  const title     = VIEW_TITLES[viewKey] || 'Dashboard';
  const titleEl   = $('page-title'); if (titleEl) titleEl.textContent = title;
  const bcEl      = $('bc-cur');     if (bcEl)    bcEl.textContent    = title;

  const actionLabel = ACTION_LABELS[viewKey] ?? '';
  const actionBtn   = $('topbar-action');
  if (actionBtn) {
    actionBtn.textContent    = actionLabel;
    actionBtn.style.display  = actionLabel ? 'inline-flex' : 'none';
  }

  // Vendor submenu state
  if (viewKey === 'vendors' || viewKey === 'event-vendors') {
    openVendorMenu();
  } else {
    closeVendorMenu();
  }

  const data = await loadData();
  renderView(currentUser.role, viewKey, data);
}

/* ─────────────────────────────────────
   H) VIEW RENDERER
───────────────────────────────────── */
function renderView(role, viewKey, data) {
  const content = $('main-content');
  if (!content) return;

  // Try to get a live data-driven template first,
  // fall back to static template from views.js
  let html = buildLiveView(role, viewKey, data);
  if (!html) html = getViewTemplate(viewKey) || emptyBlock('View not found');

  content.innerHTML = `<div class="view active" id="view-${viewKey}">${html}</div>`;
  bindViewEvents(role, viewKey, data);
}

function buildLiveView(role, viewKey, data) {
  // Dispatch to live builders that use real API data
  const builders = {
    // ── Admin / Planner shared views ──
    'dashboard':          () => buildDashboardView(role, data),
    'events':             () => buildEventsView(role, data),
    'registrations':      () => buildRegistrationsView(data),
    'vendors':            () => buildVendorsView(data),
    'event-vendors':      () => buildEventVendorsView(data),
    'service-providers':  () => buildServiceProvidersView(data),
    'event-services':     () => buildEventServicesView(data),
    'payments':           () => buildPaymentsView(role, data),
    'users':              () => buildUsersView(data),
    'roles':              () => buildRolesView(data),
    // ── Attendee ──
    'user-dashboard':     () => buildAttendeeDashboard(data),
    'browse-events':      () => buildBrowseEventsView(data),
    'my-registrations':   () => buildMyRegistrationsView(data),
    'my-payments':        () => buildMyPaymentsView(data),
    // ── Vendor ──
    'vendor-dashboard':   () => buildVendorDashboard(data),
    'my-assignments':     () => buildMyAssignmentsView(data),
    // ── Provider ──
    'provider-dashboard': () => buildProviderDashboard(data),
    'my-services':        () => buildMyServicesView(data),
  };

  return builders[viewKey] ? builders[viewKey]() : null;
}

/* ── Live view builders ── */

function buildDashboardView(role, data) {
  const { events, users, payments, vendors, registrations, eventVendors, eventServices } = data;
  const totalRev = sum(payments.map(p => p.amount));
  const paid     = payments.filter(p => p.paymentStatus === 'Completed');

  return `
    <div class="stats-grid">
      ${statCard('Users',         users.length,        'Total registered')}
      ${statCard('Events',        events.length,       'All events')}
      ${statCard('Revenue',       money(totalRev),     `${paid.length} paid`)}
      ${statCard('Vendors',       vendors.length,      'Registered vendors')}
    </div>
    <div class="section-header">
      <div class="section-title">Recent Events</div>
      <button class="topbar-btn btn-ghost" onclick="navigate('events')">View All</button>
    </div>
    ${eventsTable(events.slice(0, 5), role === 'Admin' || role === 'Planner')}
    <div class="dash-two-col" style="margin-top:24px">
      <div>
        <div class="section-header"><div class="section-title">Recent Payments</div></div>
        ${paymentsTable(payments.slice(0, 5), events)}
      </div>
      <div>
        <div class="section-header"><div class="section-title">Event Vendors</div></div>
        ${eventVendorsSummary(eventVendors, vendors, events)}
      </div>
    </div>`;
}

function buildEventsView(role, data) {
  const { events } = data;
  const canCreate = role === 'Admin' || role === 'Planner';
  return `
    <div class="section-header">
      <div class="section-title">All Events</div>
      ${canCreate ? `<button class="topbar-btn btn-primary" onclick="openCreateEvent(window._lastData)">+ New Event</button>` : ''}
    </div>
    ${eventsTable(events, canCreate)}`;
}

function buildRegistrationsView(data) {
  const { registrations, events, users } = data;
  return `
    <div class="section-header"><div class="section-title">All Registrations</div></div>
    ${regsTable(registrations, events, users)}`;
}

function buildVendorsView(data) {
  const { vendors, users } = data;
  if (!vendors.length) return emptyBlock('No vendors registered yet.');
  return `
    <div class="section-header"><div class="section-title">Vendor Directory</div></div>
    <div class="table-wrap"><table class="data-table"><thead><tr>
      <th>Business Name</th><th>Type</th><th>Description</th><th>Status</th>
    </tr></thead><tbody>
    ${vendors.map(v => `<tr>
      <td><strong>${esc(v.businessName)}</strong></td>
      <td>${badge(v.productType || '—', 'gray')}</td>
      <td>${esc(v.description)}</td>
      <td>${badge('Active', 'green')}</td>
    </tr>`).join('')}
    </tbody></table></div>`;
}

function buildEventVendorsView(data) {
  const { eventVendors, events, vendors } = data;
  if (!eventVendors.length) return emptyBlock('No event-vendor links yet.');
  return `
    <div class="section-header">
      <div class="section-title">Event–Vendor Assignments</div>
      <button class="topbar-btn btn-primary" onclick="openLinkVendor(window._lastData)">+ Link Vendor</button>
    </div>
    <div class="table-wrap"><table class="data-table"><thead><tr>
      <th>Event</th><th>Vendor</th><th>Status</th><th>Actions</th>
    </tr></thead><tbody>
    ${eventVendors.map(ev => {
      const event  = events.find(e => e.eventId === ev.eventId);
      const vendor = vendors.find(v => v.vendorId === ev.vendorId);
      return `<tr>
        <td>${esc(event?.title || '—')}</td>
        <td>${esc(vendor?.businessName || '—')}</td>
        <td>${badge(ev.status, ev.status === 'Confirmed' ? 'green' : 'gold')}</td>
        <td><button class="btn-danger topbar-btn" data-rm-vendor="${ev.eventVendorId}">Remove</button></td>
      </tr>`;
    }).join('')}
    </tbody></table></div>`;
}

function buildServiceProvidersView(data) {
  const { providers } = data;
  if (!providers.length) return emptyBlock('No service providers yet.');
  return `
    <div class="section-header"><div class="section-title">Service Providers</div></div>
    <div class="table-wrap"><table class="data-table"><thead><tr>
      <th>Company</th><th>Service Type</th><th>Description</th><th>Status</th>
    </tr></thead><tbody>
    ${providers.map(p => `<tr>
      <td><strong>${esc(p.companyName)}</strong></td>
      <td>${esc(p.serviceType)}</td>
      <td>${esc(p.description)}</td>
      <td>${badge('Active', 'green')}</td>
    </tr>`).join('')}
    </tbody></table></div>`;
}

function buildEventServicesView(data) {
  const { eventServices, events, providers } = data;
  if (!eventServices.length) return emptyBlock('No event-service links yet.');
  return `
    <div class="section-header">
      <div class="section-title">Event Service Assignments</div>
      <button class="topbar-btn btn-primary" onclick="openLinkProvider(window._lastData)">+ Link Service</button>
    </div>
    <div class="table-wrap"><table class="data-table"><thead><tr>
      <th>Event</th><th>Provider</th><th>Details</th><th>Status</th><th>Actions</th>
    </tr></thead><tbody>
    ${eventServices.map(es => {
      const event    = events.find(e => e.eventId === es.eventId);
      const provider = providers.find(p => p.providerId === es.providerId);
      return `<tr>
        <td>${esc(event?.title || '—')}</td>
        <td>${esc(provider?.companyName || '—')}</td>
        <td>${esc(es.serviceDetails)}</td>
        <td>${badge(es.status, es.status === 'Confirmed' ? 'green' : 'gold')}</td>
        <td><button class="btn-danger topbar-btn" data-rm-service="${es.eventServiceId}">Remove</button></td>
      </tr>`;
    }).join('')}
    </tbody></table></div>`;
}

function buildPaymentsView(role, data) {
  const { payments, events } = data;
  const mine = role === 'Attendee'
    ? payments.filter(p => p.userId === currentUser.id)
    : payments;
  const totalAmt = sum(mine.map(p => p.amount));
  const paidAmt  = sum(mine.filter(p => p.paymentStatus === 'Completed').map(p => p.amount));
  const pendAmt  = totalAmt - paidAmt;

  return `
    <div class="payment-summary">
      <div class="pay-label">Payment Summary</div>
      <div class="pay-amount">${money(totalAmt)}</div>
      <div class="pay-stats">
        <div><div class="pay-stat-label">Paid</div><div class="pay-stat-paid">${money(paidAmt)}</div></div>
        <div><div class="pay-stat-label">Pending</div><div class="pay-stat-pending">${money(pendAmt)}</div></div>
      </div>
    </div>
    <div class="section-header"><div class="section-title">Payment Records</div></div>
    ${paymentsTable(mine, events)}`;
}

function buildUsersView(data) {
  const { users } = data;
  if (!users.length) return emptyBlock('No users found.');
  return `
    <div class="section-header"><div class="section-title">System Users</div></div>
    <div class="table-wrap"><table class="data-table"><thead><tr>
      <th>Name</th><th>Email</th><th>Status</th><th>Actions</th>
    </tr></thead><tbody>
    ${users.map(u => `<tr>
      <td><div style="display:flex;align-items:center;gap:10px">
        <div class="user-avatar-sm avatar-gold">${initials(u.fullName)}</div>
        ${esc(u.fullName)}
      </div></td>
      <td>${esc(u.email)}</td>
      <td>${badge('Active', 'green')}</td>
      <td><button class="topbar-btn btn-ghost" style="padding:5px 12px;font-size:11px" data-toggle-user="${u.id}">Toggle</button></td>
    </tr>`).join('')}
    </tbody></table></div>`;
}

function buildRolesView(data) {
  const { roles } = data;
  const colorMap = { Admin: 'gold', Planner: 'blue', Vendor: 'gray', Attendee: 'green', ServiceProvider: 'gold' };
  return `
    <div class="section-header"><div class="section-title">Roles</div></div>
    <div class="table-wrap"><table class="data-table"><thead><tr>
      <th>ID</th><th>Role Name</th>
    </tr></thead><tbody>
    ${roles.map(r => `<tr>
      <td>${r.roleId}</td>
      <td>${badge(r.roleName, colorMap[r.roleName] || 'gray')}</td>
    </tr>`).join('')}
    </tbody></table></div>`;
}

// ── Attendee views ──
function buildAttendeeDashboard(data) {
  const { registrations, events, payments, invitations } = data;
  const myRegs  = registrations.filter(r => r.attendeeId === currentUser.id);
  const myPays  = payments.filter(p => p.userId === currentUser.id);
  const myInvs  = invitations.filter(i => i.email === currentUser.email);
  const upcoming = myRegs.filter(r => {
    const ev = events.find(e => e.eventId === r.eventId);
    return ev && eventStatus(ev.eventDate) === 'upcoming';
  });

  return `
    <div class="stats-grid" style="grid-template-columns:repeat(3,1fr)">
      ${statCard('Registered', myRegs.length,  'My events')}
      ${statCard('Upcoming',   upcoming.length, 'Upcoming events')}
      ${statCard('Invitations', myInvs.length,  'Pending invites')}
    </div>
    <div class="section-header">
      <div class="section-title">My Registrations</div>
      <button class="topbar-btn btn-ghost" onclick="navigate('browse-events')">Browse Events</button>
    </div>
    ${regsTable(myRegs, events, [])}`;
}

function buildBrowseEventsView(data) {
  const { events, registrations } = data;
  const myEventIds = new Set(registrations.filter(r => r.attendeeId === currentUser.id).map(r => r.eventId));
  const available  = events.filter(e => !myEventIds.has(e.eventId) && eventStatus(e.eventDate) !== 'past');

  if (!available.length) return emptyBlock('No new events to browse right now.');

  return `
    <div class="section-header"><div class="section-title">Available Events</div></div>
    <div class="table-wrap"><table class="data-table"><thead><tr>
      <th>Event</th><th>Date</th><th>Location</th><th>Action</th>
    </tr></thead><tbody>
    ${available.map(e => `<tr>
      <td><strong>${esc(e.title)}</strong></td>
      <td>${fmt(e.eventDate)}</td>
      <td>${esc(e.location)}</td>
      <td><button class="topbar-btn btn-primary" style="padding:5px 12px;font-size:11px" data-register-event="${e.eventId}">Register</button></td>
    </tr>`).join('')}
    </tbody></table></div>`;
}

function buildMyRegistrationsView(data) {
  const { registrations, events } = data;
  const mine = registrations.filter(r => r.attendeeId === currentUser.id);
  return `
    <div class="section-header"><div class="section-title">My Registrations</div></div>
    ${regsTable(mine, events, [])}`;
}

function buildMyPaymentsView(data) {
  const { payments, events } = data;
  const mine = payments.filter(p => p.userId === currentUser.id);
  return buildPaymentsView('Attendee', { payments: mine, events });
}

// ── Vendor views ──
function buildVendorDashboard(data) {
  const { vendors, eventVendors, events, payments } = data;
  const myVendor    = vendors.find(v => v.userId === currentUser.id);
  const myLinks     = myVendor ? eventVendors.filter(ev => ev.vendorId === myVendor.vendorId) : [];
  const confirmed   = myLinks.filter(l => l.status === 'Confirmed');
  const myEventIds  = new Set(myLinks.map(l => l.eventId));
  const myPayments  = payments.filter(p => myEventIds.has(p.eventId));
  const totalEarned = sum(myPayments.filter(p => p.paymentStatus === 'Completed').map(p => p.amount));

  return `
    <div class="stats-grid" style="grid-template-columns:repeat(3,1fr)">
      ${statCard('Assignments', myLinks.length,    'Total assignments')}
      ${statCard('Confirmed',   confirmed.length,  'Confirmed')}
      ${statCard('Earned',      money(totalEarned), 'Total earnings')}
    </div>
    ${myVendor ? `
    <div class="section-header"><div class="section-title">My Profile</div></div>
    <div class="info-card" style="max-width:520px">
      <div class="info-card-title">${esc(myVendor.businessName)}</div>
      <p style="color:var(--muted);font-size:13px">${esc(myVendor.productType)} · ${esc(myVendor.description)}</p>
    </div>` : `<p style="color:var(--muted)">No vendor profile found. <a href="#" onclick="navigate('vendor-profile')">Create one →</a></p>`}
    <div class="section-header"><div class="section-title">My Assignments</div></div>
    ${eventVendorsSummary(myLinks, [myVendor].filter(Boolean), events)}`;
}

function buildMyAssignmentsView(data) {
  const { vendors, eventVendors, events } = data;
  const myVendor = vendors.find(v => v.userId === currentUser.id);
  const myLinks  = myVendor ? eventVendors.filter(ev => ev.vendorId === myVendor.vendorId) : [];
  return `
    <div class="section-header"><div class="section-title">My Event Assignments</div></div>
    ${eventVendorsSummary(myLinks, [myVendor].filter(Boolean), events)}`;
}

// ── Provider views ──
function buildProviderDashboard(data) {
  const { providers, eventServices, events, payments } = data;
  const myProvider  = providers.find(p => p.userId === currentUser.id);
  const myServices  = myProvider ? eventServices.filter(es => es.providerId === myProvider.providerId) : [];
  const confirmed   = myServices.filter(s => s.status === 'Confirmed');
  const myEventIds  = new Set(myServices.map(s => s.eventId));
  const myPayments  = payments.filter(p => myEventIds.has(p.eventId));
  const totalEarned = sum(myPayments.filter(p => p.paymentStatus === 'Completed').map(p => p.amount));

  return `
    <div class="stats-grid" style="grid-template-columns:repeat(3,1fr)">
      ${statCard('Requests',  myServices.length, 'Total requests')}
      ${statCard('Confirmed', confirmed.length,  'Confirmed')}
      ${statCard('Earned',    money(totalEarned), 'Total earnings')}
    </div>
    ${myProvider ? `
    <div class="section-header"><div class="section-title">My Profile</div></div>
    <div class="info-card" style="max-width:520px">
      <div class="info-card-title">${esc(myProvider.companyName)}</div>
      <p style="color:var(--muted);font-size:13px">${esc(myProvider.serviceType)} · ${esc(myProvider.description)}</p>
    </div>` : `<p style="color:var(--muted)">No provider profile found.</p>`}
    <div class="section-header"><div class="section-title">My Assigned Services</div></div>
    ${servicesSummary(myServices, [myProvider].filter(Boolean), events)}`;
}

function buildMyServicesView(data) {
  const { providers, eventServices, events } = data;
  const myProvider = providers.find(p => p.userId === currentUser.id);
  const myServices = myProvider ? eventServices.filter(es => es.providerId === myProvider.providerId) : [];
  return `
    <div class="section-header"><div class="section-title">Assigned Services</div></div>
    ${servicesSummary(myServices, [myProvider].filter(Boolean), events)}`;
}

/* ── Shared table helpers ── */

function statCard(label, value, sub) {
  return `<div class="stat-card">
    <div class="stat-label">${esc(label)}</div>
    <div class="stat-value">${esc(String(value))}</div>
    <div class="stat-sub">${esc(sub)}</div>
  </div>`;
}

function eventsTable(events, withManage) {
  if (!events.length) return emptyBlock('No events found.');
  return `<div class="table-wrap"><table class="data-table"><thead><tr>
    <th>Title</th><th>Date</th><th>Location</th><th>Status</th>${withManage ? '<th>Actions</th>' : ''}
  </tr></thead><tbody>
  ${events.map(e => `<tr>
    <td><strong>${esc(e.title)}</strong></td>
    <td>${fmt(e.eventDate)}</td>
    <td>${esc(e.location)}</td>
    <td>${eventBadge(e.eventDate)}</td>
    ${withManage ? `<td>
      <button class="topbar-btn btn-ghost" style="padding:5px 12px;font-size:11px" data-manage-event="${e.eventId}">Manage</button>
      <button class="topbar-btn btn-ghost" style="padding:5px 12px;font-size:11px" onclick="openInviteAttendee(window._lastData, ${e.eventId})">Invite</button>
    </td>` : ''}
  </tr>`).join('')}
  </tbody></table></div>`;
}

function paymentsTable(payments, events) {
  if (!payments.length) return emptyBlock('No payment records.');
  return `<div class="table-wrap"><table class="data-table"><thead><tr>
    <th>ID</th><th>Event</th><th>Amount</th><th>Status</th><th>Date</th>
  </tr></thead><tbody>
  ${payments.map(p => {
    const ev = events.find(e => e.eventId === p.eventId);
    return `<tr>
      <td class="mono">#${p.paymentId}</td>
      <td>${esc(ev?.title || '—')}</td>
      <td class="serif-num">${money(p.amount)}</td>
      <td>${badge(p.paymentStatus, p.paymentStatus === 'Completed' ? 'green' : p.paymentStatus === 'Pending' ? 'gold' : 'red')}</td>
      <td>${fmt(p.paymentDate)}</td>
    </tr>`;
  }).join('')}
  </tbody></table></div>`;
}

function regsTable(regs, events, users) {
  if (!regs.length) return emptyBlock('No registrations found.');
  return `<div class="table-wrap"><table class="data-table"><thead><tr>
    <th>Event</th><th>Ticket</th><th>Payment</th><th>Date</th>
  </tr></thead><tbody>
  ${regs.map(r => {
    const ev = events.find(e => e.eventId === r.eventId);
    return `<tr>
      <td><strong>${esc(ev?.title || '—')}</strong></td>
      <td>${esc(r.ticketType)}</td>
      <td>${badge(r.paymentStatus, r.paymentStatus === 'Completed' ? 'green' : 'gold')}</td>
      <td>${fmt(r.registeredAt)}</td>
    </tr>`;
  }).join('')}
  </tbody></table></div>`;
}

function eventVendorsSummary(links, vendors, events) {
  if (!links.length) return emptyBlock('No vendor assignments.');
  return `<div class="table-wrap"><table class="data-table"><thead><tr>
    <th>Event</th><th>Vendor</th><th>Status</th>
  </tr></thead><tbody>
  ${links.map(l => {
    const ev = events.find(e => e.eventId === l.eventId);
    const v  = vendors.find(v => v.vendorId === l.vendorId);
    return `<tr>
      <td>${esc(ev?.title || '—')}</td>
      <td>${esc(v?.businessName || '—')}</td>
      <td>${badge(l.status, l.status === 'Confirmed' ? 'green' : 'gold')}</td>
    </tr>`;
  }).join('')}
  </tbody></table></div>`;
}

function servicesSummary(links, providers, events) {
  if (!links.length) return emptyBlock('No service assignments.');
  return `<div class="table-wrap"><table class="data-table"><thead><tr>
    <th>Event</th><th>Details</th><th>Status</th>
  </tr></thead><tbody>
  ${links.map(l => {
    const ev = events.find(e => e.eventId === l.eventId);
    return `<tr>
      <td>${esc(ev?.title || '—')}</td>
      <td>${esc(l.serviceDetails)}</td>
      <td>${badge(l.status, l.status === 'Confirmed' ? 'green' : 'gold')}</td>
    </tr>`;
  }).join('')}
  </tbody></table></div>`;
}

/* ─────────────────────────────────────
   I) EVENT BINDING
───────────────────────────────────── */
function bindViewEvents(role, viewKey, data) {
  // Cache data for inline onclick handlers
  window._lastData = data;

  // Manage event buttons
  document.querySelectorAll('[data-manage-event]').forEach(btn => {
    btn.addEventListener('click', () => {
      plannerEventId = parseInt(btn.dataset.manageEvent);
      featureComingSoon('Manage Event');
    });
  });

  // Remove vendor link
  document.querySelectorAll('[data-rm-vendor]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.rmVendor;
      if (!confirm('Remove this vendor from the event?')) return;
      const res = await api('DELETE', `/api/event-vendors/${id}`);
      if (res !== null) { showToast('Vendor removed.', 'info'); navigate(viewKey); }
    });
  });

  // Remove service link
  document.querySelectorAll('[data-rm-service]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.rmService;
      if (!confirm('Remove this service from the event?')) return;
      const res = await api('DELETE', `/api/event-services/${id}`);
      if (res !== null) { showToast('Service removed.', 'info'); navigate(viewKey); }
    });
  });

  // Register for event
  document.querySelectorAll('[data-register-event]').forEach(btn => {
    btn.addEventListener('click', () => {
      const eventId = parseInt(btn.dataset.registerEvent);
      openRegisterEvent(eventId);
    });
  });

  // Toggle user (admin)
  document.querySelectorAll('[data-toggle-user]').forEach(btn => {
    btn.addEventListener('click', () => featureComingSoon('User management'));
  });
}

/* ─────────────────────────────────────
   J) MODAL SYSTEM
───────────────────────────────────── */
function openModal(title, html) {
  const titleEl = $('modal-title');
  const bodyEl  = $('modal-body');
  const backdrop = $('modal-backdrop');
  if (titleEl)  titleEl.textContent = title;
  if (bodyEl)   bodyEl.innerHTML    = html;
  if (backdrop) backdrop.style.display = 'flex';
}

function closeModal(e) {
  if (e && e.target !== $('modal-backdrop')) return;
  const backdrop = $('modal-backdrop');
  if (backdrop) backdrop.style.display = 'none';
  const body = $('modal-body');
  if (body) body.innerHTML = '';
}

/* ─────────────────────────────────────
   K) FORMS
───────────────────────────────────── */
function openCreateEvent(data) {
  const planners = (data?.users || []);
  openModal('Create New Event', `
    <div class="auth-field"><label>Title *</label><input id="ef-title" class="form-control" placeholder="Event title"></div>
    <div class="auth-field"><label>Description</label><textarea id="ef-desc" class="form-control" rows="3" placeholder="Description"></textarea></div>
    <div class="auth-field"><label>Location *</label><input id="ef-loc" class="form-control" placeholder="Venue"></div>
    <div class="auth-field"><label>Date *</label><input id="ef-date" class="form-control" type="datetime-local"></div>
    <button class="auth-btn" style="margin-top:10px" onclick="submitCreateEvent()">Create Event</button>
  `);
}

async function submitCreateEvent() {
  const title       = $('ef-title')?.value?.trim();
  const description = $('ef-desc')?.value?.trim();
  const location    = $('ef-loc')?.value?.trim();
  const eventDate   = $('ef-date')?.value;

  if (!title || !location || !eventDate) { showToast('Please fill in all required fields.', 'error'); return; }

  const res = await api('POST', '/api/events', {
    title, description, location,
    eventDate: new Date(eventDate).toISOString(),
    plannerId: currentUser.id,
    capacity: 100
  });
  if (res) { showToast('Event created!', 'info'); closeModal(null); navigate(currentView); }
}

function openInviteAttendee(data, eventId) {
  openModal('Invite Attendee', `
    <div class="auth-field"><label>Email *</label><input id="inv-email" class="form-control" type="email" placeholder="attendee@email.com"></div>
    <button class="auth-btn" style="margin-top:10px" onclick="submitInvite(${eventId})">Send Invitation</button>
  `);
}

async function submitInvite(eventId) {
  const email = $('inv-email')?.value?.trim();
  if (!email) { showToast('Email is required.', 'error'); return; }
  const res = await api('POST', '/api/invitations', { email, role: 'Attendee', eventId, invitedByUserId: currentUser.id });
  if (res) { showToast('Invitation sent!', 'info'); closeModal(null); }
}

function openLinkVendor(data) {
  const events  = data?.events  || [];
  const vendors = data?.vendors || [];
  openModal('Link Vendor to Event', `
    <div class="auth-field"><label>Event *</label>
      <select id="lv-event" class="form-control">
        ${events.map(e => `<option value="${e.eventId}">${esc(e.title)}</option>`).join('')}
      </select>
    </div>
    <div class="auth-field"><label>Vendor *</label>
      <select id="lv-vendor" class="form-control">
        ${vendors.map(v => `<option value="${v.vendorId}">${esc(v.businessName)}</option>`).join('')}
      </select>
    </div>
    <button class="auth-btn" style="margin-top:10px" onclick="submitLinkVendor()">Link Vendor</button>
  `);
}

async function submitLinkVendor() {
  const eventId  = parseInt($('lv-event')?.value);
  const vendorId = parseInt($('lv-vendor')?.value);
  if (!eventId || !vendorId) { showToast('Please select an event and vendor.', 'error'); return; }
  const res = await api('POST', '/api/event-vendors', { eventId, vendorId, status: 'Pending' });
  if (res) { showToast('Vendor linked!', 'info'); closeModal(null); navigate(currentView); }
}

function openLinkProvider(data) {
  const events    = data?.events    || [];
  const providers = data?.providers || [];
  openModal('Link Service Provider', `
    <div class="auth-field"><label>Event *</label>
      <select id="lp-event" class="form-control">
        ${events.map(e => `<option value="${e.eventId}">${esc(e.title)}</option>`).join('')}
      </select>
    </div>
    <div class="auth-field"><label>Provider *</label>
      <select id="lp-provider" class="form-control">
        ${providers.map(p => `<option value="${p.providerId}">${esc(p.companyName)}</option>`).join('')}
      </select>
    </div>
    <div class="auth-field"><label>Service Details *</label>
      <textarea id="lp-details" class="form-control" rows="2" placeholder="Describe the service needed"></textarea>
    </div>
    <button class="auth-btn" style="margin-top:10px" onclick="submitLinkProvider()">Link Provider</button>
  `);
}

async function submitLinkProvider() {
  const eventId        = parseInt($('lp-event')?.value);
  const providerId     = parseInt($('lp-provider')?.value);
  const serviceDetails = $('lp-details')?.value?.trim();
  if (!eventId || !providerId || !serviceDetails) { showToast('Please fill in all fields.', 'error'); return; }
  const res = await api('POST', '/api/event-services', { eventId, providerId, serviceDetails, status: 'Pending' });
  if (res) { showToast('Provider linked!', 'info'); closeModal(null); navigate(currentView); }
}

function openRegisterEvent(eventId) {
  openModal('Register for Event', `
    <div class="auth-field"><label>Ticket Type</label>
      <select id="reg-ticket" class="form-control">
        <option value="General">General</option>
        <option value="VIP">VIP</option>
      </select>
    </div>
    <button class="auth-btn" style="margin-top:10px" onclick="submitRegisterEvent(${eventId})">Confirm Registration</button>
  `);
}

async function submitRegisterEvent(eventId) {
  const ticketType = $('reg-ticket')?.value || 'General';
  const res = await api('POST', '/api/event-registrations', { eventId, attendeeId: currentUser.id, ticketType });
  if (res) { showToast('Registered successfully!', 'info'); closeModal(null); navigate(currentView); }
}

/* ─────────────────────────────────────
   VENDOR SUBMENU
───────────────────────────────────── */
const VENDOR_SUBMENU_ITEMS = [
  { id: 'vendors',       label: 'All Vendors'   },
  { id: 'event-vendors', label: 'Event Vendors' },
];

function toggleVendorMenu() {
  const sub = $('vendor-sub');
  if (!sub) return;
  sub.classList.contains('open') ? closeVendorMenu() : openVendorMenu();
  if (!sub.classList.contains('open')) navigate('vendors');
}

function openVendorMenu() {
  const sub   = $('vendor-sub');
  const arrow = $('vendor-arrow');
  if (sub)   sub.classList.add('open');
  if (arrow) arrow.textContent = '−';
}

function closeVendorMenu() {
  const sub   = $('vendor-sub');
  const arrow = $('vendor-arrow');
  if (sub)   sub.classList.remove('open');
  if (arrow) arrow.textContent = '+';
}

/* ─────────────────────────────────────
   TOPBAR ACTION BUTTON
───────────────────────────────────── */
function handleTopbarAction() {
  const data = window._lastData || {};
  const handlers = {
    'dashboard':         () => openCreateEvent(data),
    'events':            () => openCreateEvent(data),
    'event-vendors':     () => openLinkVendor(data),
    'event-services':    () => openLinkProvider(data),
    'user-dashboard':    () => navigate('browse-events'),
    'vendor-profile':    () => featureComingSoon('Edit Profile'),
    'provider-profile':  () => featureComingSoon('Edit Profile'),
  };
  const fn = handlers[currentView];
  if (fn) fn();
  else showToast('Use the inline actions in the content area.', 'info');
}

/* ─────────────────────────────────────
   AUTH PAGE — ROLE TILES & TABS
   (kept for register form UX only)
───────────────────────────────────── */
function switchAuthTab(tab, el) {
  document.querySelectorAll('.auth-tab').forEach(n => n.classList.remove('active'));
  if (el) el.classList.add('active');
  $('login-form').style.display    = tab === 'login'    ? 'block' : 'none';
  $('register-form').style.display = tab === 'register' ? 'block' : 'none';
}

/* ─────────────────────────────────────
   BOOT
───────────────────────────────────── */
(function boot() {
  // Ensure correct initial page state
  $('app-page').style.display  = 'none';
  $('auth-page').style.display = 'flex';

  // Try to restore from stored token
  restoreSession();
})();
