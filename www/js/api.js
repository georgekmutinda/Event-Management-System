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

function parseLoginResponse(res) {
  const payload = decodeJwt(res?.token || '');
  let role = payload?.[ROLE_CLAIM] || payload?.role || res?.role || 'Attendee';
  if (Array.isArray(role)) role = role[0];

  const fullName = payload?.[NAME_CLAIM] || payload?.name || res?.fullName || '';
  const email = payload?.[EMAIL_CLAIM] || payload?.email || '';
  const userId = payload?.userId || res?.userId || null;

  return {
    id: userId,
    email,
    fullName,
    role
  };
}

async function apiFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
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
    const validationMessage = body?.errors
      ? Object.values(body.errors).flat().filter(Boolean).join(' ')
      : '';
    const error = new Error(body?.message || validationMessage || body?.title || `HTTP ${response.status}`);
    error.status = response.status;
    error.body = body;
    throw error;
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
      const user = parseLoginResponse(res);
      Auth.setSession(res.token, user, res.sessionId || null);
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

const EventVendorsAPI = {
  create: data => apiFetch('/event-vendors', { method: 'POST', body: JSON.stringify(data) })
};

const VendorsAPI = {
  getAll: () => apiFetch('/vendors'),
  update: (id, payload) => apiFetch(`/vendors/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  rate: (id, payload) => apiFetch(`/vendors/${id}/ratings`, { method: 'POST', body: JSON.stringify(payload) })
};

const EventServicesAPI = {
  create: data => apiFetch('/event-services', { method: 'POST', body: JSON.stringify(data) })
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

const FilesAPI = {
  upload: file => {
    if (!file) throw new Error('A file must be selected to upload.');
    const formData = new FormData();
    formData.append('file', file);
    return apiFetch('/files/upload', { method: 'POST', body: formData });
  }
};

const PlannerAPI = {
  getEvents: () => apiFetch('/planner/events'),
  getPaidRegistrations: () => apiFetch('/planner/paid-registrations'),
  getVendors: () => apiFetch('/planner/vendors'),
  getServiceProviders: () => apiFetch('/planner/service-providers')
};

const VendorPortalAPI = {
  getDashboard: () => apiFetch('/portal/vendor/dashboard'),
  getAssignments: () => apiFetch('/portal/vendor/assignments'),
  getProfile: () => apiFetch('/portal/vendor/profile'),
  updatePhoto: photoUrl => apiFetch('/portal/vendor/profile/photo', { method: 'PUT', body: JSON.stringify({ photoUrl }) }),
  bid: eventId => apiFetch('/portal/vendor/bids', { method: 'POST', body: JSON.stringify({ eventId }) })
};

const ProviderPortalAPI = {
  getDashboard: () => apiFetch('/portal/provider/dashboard'),
  getServices: () => apiFetch('/portal/provider/services'),
  getProfile: () => apiFetch('/portal/provider/profile'),
  updatePhoto: photoUrl => apiFetch('/portal/provider/profile/photo', { method: 'PUT', body: JSON.stringify({ photoUrl }) }),
  bid: (eventId, serviceDetails) => apiFetch('/portal/provider/bids', { method: 'POST', body: JSON.stringify({ eventId, serviceDetails }) })
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
    const role = Auth.user?.role || (() => {
      const payload = decodeJwt(res.token);
      let value = payload?.[ROLE_CLAIM] || payload?.role || res.role || 'Attendee';
      if (Array.isArray(value)) value = value[0];
      return value;
    })();
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
    const resolvedRole = Auth.user?.role || (() => {
      const payload = decodeJwt(res.token);
      let result = payload?.[ROLE_CLAIM] || payload?.role || res.role || role;
      if (Array.isArray(result)) result = result[0];
      return result;
    })();
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
window.handleUploadFile = handleUploadFile;
window.handleRateVendor = handleRateVendor;
window.refreshCurrentView = refreshCurrentView;
window.performDelete = performDelete;
window.ensureRegistrationForEvent = ensureRegistrationForEvent;
window.API = {
  Auth,
  AuthAPI,
  EventsAPI,
  RegistrationsAPI,
  EventVendorsAPI,
  VendorsAPI,
  EventServicesAPI,
  ServiceProvidersAPI,
  PaymentsAPI,
  FilesAPI,
  PlannerAPI,
  VendorPortalAPI,
  ProviderPortalAPI,
  AdminAPI
};

async function handleUploadFile() {
  const fileInput = document.getElementById('upload-file-input');
  const feedback = document.getElementById('upload-feedback');
  if (!fileInput || !feedback) return;

  feedback.style.display = 'none';
  feedback.innerHTML = '';

  const file = fileInput.files?.[0];
  if (!file) {
    feedback.style.display = 'block';
    feedback.innerHTML = `<div class="empty-title" style="color:#e74c3c">Please select a file before uploading.</div>`;
    return;
  }

  const button = document.getElementById('upload-file-button');
  if (button) {
    button.disabled = true;
    button.textContent = 'Uploading...';
  }

  try {
    const result = await FilesAPI.upload(file);
    window.uploadedFiles = window.uploadedFiles || [];
    window.uploadedFiles.unshift(result);
    if (window.uploadedFiles.length > 5) window.uploadedFiles.length = 5;

    feedback.style.display = 'block';
    feedback.innerHTML = `
      <div class="empty-title">File uploaded successfully.</div>
      <div style="margin-top:10px"><a href="${result.url}" target="_blank" rel="noopener">${escapeHtml(result.fileName)}</a></div>
    `;

    const container = document.getElementById('view-uploads-body');
    if (container && typeof renderUploads === 'function') {
      renderUploads(container);
    }
  } catch (err) {
    feedback.style.display = 'block';
    feedback.innerHTML = `<div class="empty-title" style="color:#e74c3c">${escapeHtml(err.message || 'Upload failed.')}</div>`;
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = 'Upload File';
    }
  }
}

async function handleRateVendor(vendorId, vendorName) {
  const ratingValue = prompt(`Rate ${vendorName} from 1 to 5`);
  if (ratingValue === null) return;

  const rating = Number(ratingValue);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    showToast('Please enter a whole number from 1 to 5.');
    return;
  }

  const recommendation = prompt('Add a short recommendation');

  try {
    await VendorsAPI.rate(vendorId, {
      rating,
      recommendation: recommendation || ''
    });
    showToast('Vendor rating saved.');
    refreshCurrentView();
  } catch (err) {
    showToast(err.message || 'Unable to save rating.');
  }
}
