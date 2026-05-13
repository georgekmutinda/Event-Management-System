const API_BASE = API_BASE_URL || 'http://localhost:5100/api';

const Auth = (() => {
  let _token = sessionStorage.getItem('ems_token') || null;
  let _user = JSON.parse(sessionStorage.getItem('ems_user') || 'null');
  let _sessionId = sessionStorage.getItem('ems_session_id') || null;

  return {
    setSession(token, user, sessionId) {
      _token = token;
      _user = user;
      _sessionId = sessionId || null;
      sessionStorage.setItem('ems_token', token);
      sessionStorage.setItem('ems_user', JSON.stringify(user));
      if (sessionId) sessionStorage.setItem('ems_session_id', sessionId);
    },
    clearSession() {
      _token = null;
      _user = null;
      _sessionId = null;
      sessionStorage.removeItem('ems_token');
      sessionStorage.removeItem('ems_user');
      sessionStorage.removeItem('ems_session_id');
    },
    get token() { return _token; },
    get user() { return _user; },
    get sessionId() { return _sessionId; },
    get isAuth() { return Boolean(_token); }
  };
})();

async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (Auth.token) headers.Authorization = `Bearer ${Auth.token}`;
  if (Auth.sessionId) headers['X-Session-Id'] = Auth.sessionId;

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (response.status === 204) return null;

  let body = null;
  try { body = await response.json(); } catch { body = null; }

  if (response.status === 401 && Auth.isAuth) {
    Auth.clearSession();
    const authPage = document.getElementById('auth-page');
    const appPage = document.getElementById('app-page');
    if (appPage) appPage.style.display = 'none';
    if (authPage) authPage.style.display = 'flex';
    if (typeof showToast === 'function') showToast(body?.message || 'Your session has expired.');
  }

  if (!response.ok) {
    throw new Error(body?.message || body?.title || `HTTP ${response.status}`);
  }

  return body;
}

const AuthAPI = {
  register(data) {
    return apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) });
  },
  async login(data) {
    const res = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(data) });
    if (res?.token) {
      Auth.setSession(res.token, {
        id: res.userId,
        email: res.email,
        fullName: res.fullName,
        role: res.role
      }, res.sessionId);
    }
    return res;
  },
  logout() {
    Auth.clearSession();
  }
};

const EventsAPI = {
  getAll: () => apiFetch('/events'),
  create: data => apiFetch('/events', { method: 'POST', body: JSON.stringify(data) }),
  delete: id => apiFetch(`/events/${id}`, { method: 'DELETE' })
};

const RegistrationsAPI = {
  getAll: () => apiFetch('/event-registrations'),
  getMine: () => apiFetch('/event-registrations/mine'),
  create: data => apiFetch('/event-registrations', { method: 'POST', body: JSON.stringify(data) })
};

const VendorsAPI = {
  getAll: () => apiFetch('/vendors')
};

const ServiceProvidersAPI = {
  getAll: () => apiFetch('/service-providers')
};

const PaymentsAPI = {
  getAll: () => apiFetch('/payments'),
  getMine: () => apiFetch('/payments/mine'),
  create: data => apiFetch('/payments', { method: 'POST', body: JSON.stringify(data) }),
  redeemCode: payload => apiFetch('/payments/redeem', { method: 'POST', body: JSON.stringify(payload) })
};

const PlannerAPI = {
  getEvents: () => apiFetch('/planner/events'),
  getPaidRegistrations: () => apiFetch('/planner/paid-registrations'),
  getVendors: () => apiFetch('/planner/vendors'),
  getServiceProviders: () => apiFetch('/planner/service-providers')
};

const AdminAPI = {
  getSessions: () => apiFetch('/admin/sessions'),
  kickUser: sessionId => apiFetch(`/admin/sessions/${sessionId}`, { method: 'DELETE' }),
  getMessages: () => apiFetch('/admin/messages'),
  broadcast: payload => apiFetch('/admin/broadcast', { method: 'POST', body: JSON.stringify(payload) }),
  registerVendor: payload => apiFetch('/admin/register-vendor', { method: 'POST', body: JSON.stringify(payload) }),
  registerServiceProvider: payload => apiFetch('/admin/register-service-provider', { method: 'POST', body: JSON.stringify(payload) })
};

function decodeJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

async function handleLogin() {
  const email = document.getElementById('login-email')?.value?.trim();
  const password = document.getElementById('login-password')?.value;
  const error = document.getElementById('login-error');
  const button = document.getElementById('login-btn');

  if (error) error.textContent = '';
  if (!email || !password) {
    if (error) error.textContent = 'Please enter your email and password.';
    return;
  }

  if (button) {
    button.disabled = true;
    button.textContent = 'Signing in...';
  }

  try {
    const res = await AuthAPI.login({ email, password });
    const payload = decodeJwt(res.token);
    let role = payload?.[ROLE_CLAIM] || payload?.role || res.role || 'Attendee';
    if (Array.isArray(role)) role = role[0];
    enterApp(role);
  } catch (err) {
    if (error) error.textContent = err.message || 'Login failed.';
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = 'Sign In to Platform';
    }
  }
}

async function handleRegister() {
  const fullName = document.getElementById('reg-fullname')?.value?.trim();
  const role = document.getElementById('register-role')?.value || 'Attendee';
  const email = document.getElementById('reg-email')?.value?.trim();
  const password = document.getElementById('reg-password')?.value;
  const error = document.getElementById('register-error');
  const button = document.getElementById('register-btn');

  if (error) error.textContent = '';
  if (!fullName || !email || !password) {
    if (error) error.textContent = 'Please fill in all required fields.';
    return;
  }

  if (button) {
    button.disabled = true;
    button.textContent = 'Creating account...';
  }

  try {
    await AuthAPI.register({ fullName, email, password, roles: [role] });
    const res = await AuthAPI.login({ email, password });
    const payload = decodeJwt(res.token);
    let resolvedRole = payload?.[ROLE_CLAIM] || payload?.role || res.role || role;
    if (Array.isArray(resolvedRole)) resolvedRole = resolvedRole[0];
    enterApp(resolvedRole);
    showToast('Account created successfully.');
  } catch (err) {
    if (error) error.textContent = err.message || 'Registration failed.';
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = 'Create My Account';
    }
  }
}

async function submitEventForm(button) {
  const title = document.getElementById('ef-name')?.value?.trim();
  const eventDate = document.getElementById('ef-date')?.value;
  const location = document.getElementById('ef-location')?.value?.trim();
  const description = document.getElementById('ef-description')?.value?.trim() || '';
  const ticketPrice = Number(document.getElementById('ef-price')?.value || 0);
  const plannerId = Auth.user?.id;
  const error = document.getElementById('form-error');

  if (error) error.style.display = 'none';
  if (!title || !eventDate || !location || !plannerId) {
    if (error) {
      error.textContent = 'Title, date, and location are required.';
      error.style.display = 'block';
    }
    return;
  }

  if (button) {
    button.disabled = true;
    button.textContent = 'Saving...';
  }

  try {
    await EventsAPI.create({
      title,
      description,
      location,
      eventDate,
      ticketPrice,
      plannerId
    });
    closeModal(null);
    showToast('Event created successfully.');
    refreshCurrentView();
  } catch (err) {
    if (error) {
      error.textContent = err.message || 'Unable to create event.';
      error.style.display = 'block';
    }
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = 'Save Event';
    }
  }
}

async function ensureRegistrationForEvent(eventId) {
  const userId = Auth.user?.id;
  if (!userId) {
    throw new Error('Please sign in to register for an event.');
  }

  try {
    await RegistrationsAPI.create({ eventId, attendeeId: userId });
  } catch (err) {
    if (!String(err.message || '').toLowerCase().includes('already registered')) {
      throw err;
    }
  }

}

async function processPaymentAPI(method, eventId, eventName, amount) {
  try {
    await ensureRegistrationForEvent(eventId);
    await PaymentsAPI.create({
      eventId,
      userId: Auth.user?.id,
      amount,
      paymentStatus: 'Completed'
    });
    closePaymentModal(null);
    showToast(`${eventName} payment recorded successfully.`);
    refreshCurrentView();
  } catch (err) {
    showToast(err.message || 'Payment failed.');
  }
}

async function refreshCurrentView() {
  if (typeof showView === 'function' && currentView) {
    showView(currentView, document.querySelector(`[data-view="${currentView}"]`));
  }
}

async function performDelete(resource, id) {
  const map = {
    events: () => EventsAPI.delete(id)
  };

  if (!map[resource]) {
    showToast('Delete is not available for this record.');
    return;
  }

  await map[resource]();
  showToast('Record deleted successfully.');
  refreshCurrentView();
}

window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.submitEventForm = submitEventForm;
window.processPaymentAPI = processPaymentAPI;
window.refreshCurrentView = refreshCurrentView;
window.performDelete = performDelete;
window.ensureRegistrationForEvent = ensureRegistrationForEvent;
window.API = {
  Auth,
  AuthAPI,
  EventsAPI,
  RegistrationsAPI,
  VendorsAPI,
  ServiceProvidersAPI,
  PaymentsAPI,
  PlannerAPI,
  AdminAPI
};
