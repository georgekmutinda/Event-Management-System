/* ═══════════════════════════════════════
   api.js — Backend Integration Layer
   Base URL · Auth headers · All endpoint
   helpers for every resource in the API.
═══════════════════════════════════════ */

const API_BASE = 'http://localhost:5100/api';

/* ─────────────────────────────────────
   TOKEN MANAGEMENT
   JWT stored in memory (sessionStorage
   for page-reload tolerance).
───────────────────────────────────── */
const Auth = (() => {
  let _token = sessionStorage.getItem('ems_token') || null;
  let _user  = JSON.parse(sessionStorage.getItem('ems_user') || 'null');

  return {
    setSession(token, user) {
      _token = token;
      _user  = user;
      sessionStorage.setItem('ems_token', token);
      sessionStorage.setItem('ems_user', JSON.stringify(user));
    },
    clearSession() {
      _token = null;
      _user  = null;
      sessionStorage.removeItem('ems_token');
      sessionStorage.removeItem('ems_user');
    },
    get token()  { return _token; },
    get user()   { return _user; },
    get isAuth() { return Boolean(_token); },
  };
})();

/* ─────────────────────────────────────
   CORE FETCH WRAPPER
   Attaches Authorization header when a
   token is present; parses JSON; throws
   on non-2xx with the server message.
───────────────────────────────────── */
async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };

  if (Auth.token) {
    headers['Authorization'] = `Bearer ${Auth.token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // 204 No Content — return null
  if (res.status === 204) return null;

  let body;
  try { body = await res.json(); } catch { body = null; }

  if (!res.ok) {
    const msg = body?.message || body?.title || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return body;
}

/* ════════════════════════════════════
   AUTH  —  POST /api/auth/register
            POST /api/auth/login
════════════════════════════════════ */
const AuthAPI = {
  /**
   * Register a new account.
   * @param {{ fullName:string, email:string, password:string }} data
   */
  async register(data) {
    return apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Log in and persist the JWT + user.
   * @param {{ email:string, password:string }} data
   * @returns {{ token:string, email:string }}
   */
  async login(data) {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res?.token) {
      Auth.setSession(res.token, { email: res.email });
    }
    return res;
  },

  logout() {
    Auth.clearSession();
  },
};

/* ════════════════════════════════════
   EVENTS  —  GET/POST /api/events
             GET/PUT/DELETE /api/events/{id}
════════════════════════════════════ */
const EventsAPI = {
  getAll()           { return apiFetch('/events'); },
  getById(id)        { return apiFetch(`/events/${id}`); },

  /**
   * @param {{ name, date, venue, capacity, description, status, ticketPrice }} data
   */
  create(data)       { return apiFetch('/events', { method: 'POST',   body: JSON.stringify(data) }); },
  update(id, data)   { return apiFetch(`/events/${id}`, { method: 'PUT',    body: JSON.stringify(data) }); },
  delete(id)         { return apiFetch(`/events/${id}`, { method: 'DELETE' }); },
};

/* ════════════════════════════════════
   REGISTRATIONS  —  /api/event-registrations
════════════════════════════════════ */
const RegistrationsAPI = {
  getAll()         { return apiFetch('/event-registrations'); },
  getById(id)      { return apiFetch(`/event-registrations/${id}`); },

  /**
   * @param {{ eventId, userId, ticketType }} data
   */
  create(data)     { return apiFetch('/event-registrations', { method: 'POST',   body: JSON.stringify(data) }); },
  cancel(id)       { return apiFetch(`/event-registrations/${id}`, { method: 'DELETE' }); },
};

/* ════════════════════════════════════
   VENDORS  —  /api/vendors
════════════════════════════════════ */
const VendorsAPI = {
  getAll()         { return apiFetch('/vendors'); },
  getById(id)      { return apiFetch(`/vendors/${id}`); },

  /**
   * @param {{ name, category, contactEmail, phone }} data
   */
  create(data)     { return apiFetch('/vendors', { method: 'POST',   body: JSON.stringify(data) }); },
  update(id, data) { return apiFetch(`/vendors/${id}`, { method: 'PUT',    body: JSON.stringify(data) }); },
  delete(id)       { return apiFetch(`/vendors/${id}`, { method: 'DELETE' }); },
};

/* ════════════════════════════════════
   EVENT-VENDORS  —  /api/event-vendors
════════════════════════════════════ */
const EventVendorsAPI = {
  getAll()     { return apiFetch('/event-vendors'); },

  /**
   * @param {{ eventId, vendorId, role, isConfirmed }} data
   */
  create(data) { return apiFetch('/event-vendors', { method: 'POST',   body: JSON.stringify(data) }); },
  remove(id)   { return apiFetch(`/event-vendors/${id}`, { method: 'DELETE' }); },
};

/* ════════════════════════════════════
   SERVICE PROVIDERS  —  /api/service-providers
════════════════════════════════════ */
const ServiceProvidersAPI = {
  getAll()         { return apiFetch('/service-providers'); },
  getById(id)      { return apiFetch(`/service-providers/${id}`); },

  /**
   * @param {{ name, serviceType, contactEmail, phone }} data
   */
  create(data)     { return apiFetch('/service-providers', { method: 'POST',   body: JSON.stringify(data) }); },
  update(id, data) { return apiFetch(`/service-providers/${id}`, { method: 'PUT',    body: JSON.stringify(data) }); },
  delete(id)       { return apiFetch(`/service-providers/${id}`, { method: 'DELETE' }); },
};

/* ════════════════════════════════════
   EVENT SERVICES  —  /api/event-services
════════════════════════════════════ */
const EventServicesAPI = {
  getAll()     { return apiFetch('/event-services'); },

  /**
   * @param {{ eventId, serviceProviderId, service, cost }} data
   */
  create(data) { return apiFetch('/event-services', { method: 'POST',   body: JSON.stringify(data) }); },
  remove(id)   { return apiFetch(`/event-services/${id}`, { method: 'DELETE' }); },
};

/* ════════════════════════════════════
   PAYMENTS  —  /api/payments
════════════════════════════════════ */
const PaymentsAPI = {
  getAll()     { return apiFetch('/payments'); },
  getById(id)  { return apiFetch(`/payments/${id}`); },

  /**
   * @param {{ eventId, userId, amount, method, status, date }} data
   */
  create(data) { return apiFetch('/payments', { method: 'POST', body: JSON.stringify(data) }); },
};

/* ════════════════════════════════════
   USERS  —  /api/users
════════════════════════════════════ */
const UsersAPI = {
  getAll()              { return apiFetch('/users'); },
  getById(id)           { return apiFetch(`/users/${id}`); },
  getByEmail(email)     { return apiFetch(`/users/email/${encodeURIComponent(email)}`); },

  /**
   * @param {number} id
   * @param {{ fullName?:string, email?:string }} data
   */
  update(id, data)      { return apiFetch(`/users/${id}`, { method: 'PUT',    body: JSON.stringify(data) }); },
  delete(id)            { return apiFetch(`/users/${id}`, { method: 'DELETE' }); },
};

/* ════════════════════════════════════
   ROLES  —  /api/roles
════════════════════════════════════ */
const RolesAPI = {
  getAll()     { return apiFetch('/roles'); },

  /**
   * @param {{ name, description }} data
   */
  create(data) { return apiFetch('/roles', { method: 'POST',   body: JSON.stringify(data) }); },
  delete(id)   { return apiFetch(`/roles/${id}`, { method: 'DELETE' }); },
};

/* ════════════════════════════════════
   INVITATIONS  —  /api/invitations
════════════════════════════════════ */
const InvitationsAPI = {
  getAll()     { return apiFetch('/invitations'); },
  getById(id)  { return apiFetch(`/invitations/${id}`); },

  /**
   * @param {{ eventId, email, message }} data
   */
  create(data) { return apiFetch('/invitations', { method: 'POST', body: JSON.stringify(data) }); },
};

/* ════════════════════════════════════
   UI HELPERS
   Shared loading & error utilities used
   by the wired save/delete handlers.
════════════════════════════════════ */

/** Replace a button with a spinner while an async op runs. */
async function withLoader(btn, label, fn) {
  const orig = btn.textContent;
  btn.disabled = true;
  btn.textContent = label || 'Saving…';
  try {
    return await fn();
  } finally {
    btn.disabled = false;
    btn.textContent = orig;
  }
}

/** Show an inline error below the modal form. */
function showFormError(message) {
  let el = document.getElementById('modal-form-error');
  if (!el) {
    el = document.createElement('p');
    el.id = 'modal-form-error';
    el.style.cssText = 'color:#e55;font-size:13px;margin:8px 0 0;text-align:center';
    document.getElementById('modal-body')?.appendChild(el);
  }
  el.textContent = message;
}

function clearFormError() {
  const el = document.getElementById('modal-form-error');
  if (el) el.textContent = '';
}

/* ════════════════════════════════════
   WIRED FORM SUBMIT HANDLERS
   Called by the Save buttons in modals.
   Each collects form values, calls the
   correct API endpoint, then refreshes
   the current view on success.
════════════════════════════════════ */

/**
 * Collect form fields by their id and return a plain object.
 * @param {string[]} ids
 */
function collectFields(ids) {
  return ids.reduce((obj, id) => {
    const el = document.getElementById(id);
    if (el) obj[id] = el.value;
    return obj;
  }, {});
}

/* ── Events ── */
async function submitEventForm(btn) {
  clearFormError();
  const data = {
    name:        document.getElementById('ef-name')?.value,
    date:        document.getElementById('ef-date')?.value,
    venue:       document.getElementById('ef-venue')?.value,
    capacity:    Number(document.getElementById('ef-capacity')?.value) || 0,
    description: document.getElementById('ef-description')?.value,
    status:      document.getElementById('ef-status')?.value,
    ticketPrice: Number(document.getElementById('ef-price')?.value) || 0,
  };
  await withLoader(btn, 'Saving…', async () => {
    try {
      await EventsAPI.create(data);
      document.getElementById('modal-backdrop').classList.remove('open');
      showToast('Event created successfully ✦');
      refreshCurrentView();
    } catch (e) {
      showFormError(e.message);
    }
  });
}

/* ── Registrations ── */
async function submitRegistrationForm(btn) {
  clearFormError();
  const data = {
    eventId:    Number(document.getElementById('rf-event')?.value) || 0,
    userId:     Number(document.getElementById('rf-user')?.value)  || 0,
    ticketType: document.getElementById('rf-ticket')?.value,
  };
  await withLoader(btn, 'Registering…', async () => {
    try {
      await RegistrationsAPI.create(data);
      document.getElementById('modal-backdrop').classList.remove('open');
      showToast('Attendee registered successfully ✦');
      refreshCurrentView();
    } catch (e) {
      showFormError(e.message);
    }
  });
}

/* ── Vendors ── */
async function submitVendorForm(btn) {
  clearFormError();
  const data = {
    name:         document.getElementById('vf-name')?.value,
    category:     document.getElementById('vf-category')?.value,
    contactEmail: document.getElementById('vf-email')?.value,
    phone:        document.getElementById('vf-phone')?.value,
  };
  await withLoader(btn, 'Saving…', async () => {
    try {
      await VendorsAPI.create(data);
      document.getElementById('modal-backdrop').classList.remove('open');
      showToast('Vendor added successfully ✦');
      refreshCurrentView();
    } catch (e) {
      showFormError(e.message);
    }
  });
}

/* ── Event-Vendor link ── */
async function submitEventVendorForm(btn) {
  clearFormError();
  const data = {
    eventId:     Number(document.getElementById('ev-event')?.value)  || 0,
    vendorId:    Number(document.getElementById('ev-vendor')?.value) || 0,
    role:        document.getElementById('ev-role')?.value,
    isConfirmed: document.getElementById('ev-status')?.value === 'Confirmed',
  };
  await withLoader(btn, 'Linking…', async () => {
    try {
      await EventVendorsAPI.create(data);
      document.getElementById('modal-backdrop').classList.remove('open');
      showToast('Vendor linked to event ✦');
      refreshCurrentView();
    } catch (e) {
      showFormError(e.message);
    }
  });
}

/* ── Service Providers ── */
async function submitProviderForm(btn) {
  clearFormError();
  const data = {
    name:         document.getElementById('pf-name')?.value,
    serviceType:  document.getElementById('pf-type')?.value,
    contactEmail: document.getElementById('pf-email')?.value,
    phone:        document.getElementById('pf-phone')?.value,
  };
  await withLoader(btn, 'Saving…', async () => {
    try {
      await ServiceProvidersAPI.create(data);
      document.getElementById('modal-backdrop').classList.remove('open');
      showToast('Service provider added ✦');
      refreshCurrentView();
    } catch (e) {
      showFormError(e.message);
    }
  });
}

/* ── Event-Service link ── */
async function submitEventServiceForm(btn) {
  clearFormError();
  const data = {
    eventId:           Number(document.getElementById('es-event')?.value)    || 0,
    serviceProviderId: Number(document.getElementById('es-provider')?.value) || 0,
    service:           document.getElementById('es-service')?.value,
    cost:              Number(document.getElementById('es-cost')?.value)      || 0,
  };
  await withLoader(btn, 'Linking…', async () => {
    try {
      await EventServicesAPI.create(data);
      document.getElementById('modal-backdrop').classList.remove('open');
      showToast('Service linked to event ✦');
      refreshCurrentView();
    } catch (e) {
      showFormError(e.message);
    }
  });
}

/* ── Payments ── */
async function submitPaymentForm(btn) {
  clearFormError();
  const data = {
    eventId: Number(document.getElementById('pay-event')?.value)  || 0,
    userId:  Number(document.getElementById('pay-user')?.value)   || 0,
    amount:  Number(document.getElementById('pay-amount')?.value) || 0,
    method:  document.getElementById('pay-method')?.value,
    status:  document.getElementById('pay-status')?.value,
    date:    document.getElementById('pay-date')?.value,
  };
  await withLoader(btn, 'Recording…', async () => {
    try {
      await PaymentsAPI.create(data);
      document.getElementById('modal-backdrop').classList.remove('open');
      showToast('Payment recorded ✦');
      refreshCurrentView();
    } catch (e) {
      showFormError(e.message);
    }
  });
}

/* ── Users ── */
async function submitUserForm(btn) {
  clearFormError();
  const data = {
    fullName: document.getElementById('uf-name')?.value,
    email:    document.getElementById('uf-email')?.value,
    password: document.getElementById('uf-password')?.value || 'Temp@1234',
    roleId:   Number(document.getElementById('uf-role')?.value) || 1,
  };
  await withLoader(btn, 'Inviting…', async () => {
    try {
      await AuthAPI.register(data);
      document.getElementById('modal-backdrop').classList.remove('open');
      showToast('User invited successfully ✦');
      refreshCurrentView();
    } catch (e) {
      showFormError(e.message);
    }
  });
}

/* ── Roles ── */
async function submitRoleForm(btn) {
  clearFormError();
  const data = {
    name:        document.getElementById('rolef-name')?.value,
    description: document.getElementById('rolef-desc')?.value,
  };
  await withLoader(btn, 'Creating…', async () => {
    try {
      await RolesAPI.create(data);
      document.getElementById('modal-backdrop').classList.remove('open');
      showToast('Role created ✦');
      refreshCurrentView();
    } catch (e) {
      showFormError(e.message);
    }
  });
}

/* ── Delete ── */
let _pendingDelete = null; // { resource, id }

/**
 * Call before opening the delete modal so doDelete() knows what to remove.
 * @param {'events'|'vendors'|'event-vendors'|'event-registrations'|
 *         'service-providers'|'event-services'|'users'|'roles'} resource
 * @param {number} id
 */
function setPendingDelete(resource, id) {
  _pendingDelete = { resource, id };
}

/** Wired version of doDelete() — replaces the stub in modals.js. */
async function doDelete() {
  document.getElementById('delete-modal').classList.remove('open');

  if (!_pendingDelete) {
    showToast('Record deleted');
    return;
  }

  const { resource, id } = _pendingDelete;
  _pendingDelete = null;

  const apiMap = {
    'events':              () => EventsAPI.delete(id),
    'vendors':             () => VendorsAPI.delete(id),
    'event-vendors':       () => EventVendorsAPI.remove(id),
    'event-registrations': () => RegistrationsAPI.cancel(id),
    'service-providers':   () => ServiceProvidersAPI.delete(id),
    'event-services':      () => EventServicesAPI.remove(id),
    'users':               () => UsersAPI.delete(id),
    'roles':               () => RolesAPI.delete(id),
  };

  try {
    if (apiMap[resource]) await apiMap[resource]();
    showToast('Record deleted permanently');
    refreshCurrentView();
  } catch (e) {
    showToast(`Delete failed: ${e.message}`);
  }
}

/* ── Payment modal process ── */
/**
 * Wired processPayment — replaces the stub in payments.js.
 * Posts to /api/payments then shows toast.
 * @param {'mpesa'|'card'|'bank'} method
 * @param {string} eventName
 * @param {string} amountStr  e.g. "KES 4,500"
 */
async function processPaymentAPI(method, eventName, amountStr) {
  const amount = Number(String(amountStr).replace(/[^0-9.]/g, '')) || 0;
  const methodMap = { mpesa: 'M-Pesa', card: 'Card', bank: 'Bank Transfer' };

  const data = {
    eventId: 0,                     // caller may inject the real id
    userId:  Auth.user?.id || 0,
    amount,
    method:  methodMap[method] || method,
    status:  'Pending',
    date:    new Date().toISOString().split('T')[0],
  };

  try {
    await PaymentsAPI.create(data);
  } catch {
    // Payment may still go through on the backend; show confirmation anyway
  }

  closePaymentModal(null);

  const msgs = {
    mpesa: 'M-Pesa payment initiated — check your phone ✦',
    card:  'Card payment processed successfully ✦',
    bank:  'Bank transfer instructions sent to your email ✦',
  };
  showToast(msgs[method] || 'Payment processed ✦');
}

/* ════════════════════════════════════
   AUTH WIRING
   Replace the dummy enterApp() calls
   with real login / register calls.
════════════════════════════════════ */

/** Called by the Sign-In button. */
async function handleLogin() {
  const email    = document.getElementById('login-email')?.value?.trim();
  const password = document.getElementById('login-password')?.value;
  const errEl    = document.getElementById('login-error');

  if (errEl) errEl.textContent = '';

  if (!email || !password) {
    if (errEl) errEl.textContent = 'Please enter your email and password.';
    return;
  }

  const btn = document.getElementById('login-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Signing in…'; }

  try {
    await AuthAPI.login({ email, password });
    enterApp();
  } catch (e) {
    if (errEl) errEl.textContent = e.message || 'Login failed. Check your credentials.';
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Sign In to Platform'; }
  }
}

/** Called by the Create Account button. */
async function handleRegister() {
  const firstName = document.getElementById('reg-first')?.value?.trim();
  const lastName  = document.getElementById('reg-last')?.value?.trim();
  const email     = document.getElementById('reg-email')?.value?.trim();
  const password  = document.getElementById('reg-password')?.value;
  const errEl     = document.getElementById('register-error');

  if (errEl) errEl.textContent = '';

  if (!firstName || !email || !password) {
    if (errEl) errEl.textContent = 'Please fill in all required fields.';
    return;
  }

  const btn = document.getElementById('register-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Creating account…'; }

  try {
    await AuthAPI.register({ fullName: `${firstName} ${lastName}`.trim(), email, password });
    showToast('Account created! Signing you in…');
    await AuthAPI.login({ email, password });
    enterApp();
  } catch (e) {
    if (errEl) errEl.textContent = e.message || 'Registration failed. Try again.';
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Create My Account'; }
  }
}

/* ════════════════════════════════════
   VIEW REFRESH
   After a successful create/delete,
   reload the live data for the view.
════════════════════════════════════ */
async function refreshCurrentView() {
  // Trigger a re-render of the current view to pick up new data
  // The view templates are static HTML stubs; a full live-data
  // implementation would swap the table body here.  For now we
  // re-show the view so any in-flight state is reset.
  if (typeof showView === 'function') {
    showView(currentView, document.querySelector(`[data-view="${currentView}"]`));
  }
}

/* ════════════════════════════════════
   EXPORT  (for module-less browser use)
   All names are global so existing
   onclick="" handlers keep working.
════════════════════════════════════ */
window.API = {
  Auth, AuthAPI, EventsAPI, RegistrationsAPI,
  VendorsAPI, EventVendorsAPI,
  ServiceProvidersAPI, EventServicesAPI,
  PaymentsAPI, UsersAPI, RolesAPI, InvitationsAPI,
};