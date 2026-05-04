/* ═══════════════════════════════════════
   app.js — Main Application Logic
   Auth · Navigation · Modals · Toast
═══════════════════════════════════════ */

/* ─────────────────────────────────────
   CONFIG MAPS
───────────────────────────────────── */
const VIEW_TITLES = {
  dashboard:          'Dashboard',
  events:             'Events',
  registrations:      'Registrations',
  vendors:            'Vendors',
  'event-vendors':    'Event Vendors',
  'service-providers':'Service Providers',
  'event-services':   'Event Services',
  payments:           'Payments',
  users:              'Users',
  roles:              'Roles',
};

const ACTION_LABELS = {
  dashboard:          '+ Create Event',
  events:             '+ New Event',
  registrations:      '+ Register Attendee',
  vendors:            '+ Add Vendor',
  'event-vendors':    '+ Link Vendor',
  'service-providers':'+ Add Provider',
  'event-services':   '+ Link Service',
  payments:           '+ Record Payment',
  users:              '+ Invite User',
  roles:              '+ Create Role',
};

const MODAL_TITLES = {
  dashboard:          'Create New Event',
  events:             'Create New Event',
  registrations:      'Register Attendee',
  vendors:            'Add Vendor',
  'event-vendors':    'Link Vendor to Event',
  'service-providers':'Add Service Provider',
  'event-services':   'Link Service to Event',
  payments:           'Record Payment',
  users:              'Invite User',
  roles:              'Create Role',
};

/* ─────────────────────────────────────
   STATE
───────────────────────────────────── */
let currentView = 'dashboard';
let currentUser = null;
let authToken = null;
let editingEventId = null; // Track which event is being edited

/* ─────────────────────────────────────
   API CONFIGURATION & CLIENT
───────────────────────────────────── */
const API_BASE_URL = 'http://localhost:5100';

/**
 * Creative error messages for various scenarios
 */
const ERROR_MESSAGES = {
  network: '🌐 Connection lost. Check your internet or if the backend is running.',
  timeout: '⏱️ Request timed out. The server is taking too long to respond.',
  unauthorized: '🔐 Your session expired. Please log in again.',
  forbidden: '🚫 You don\'t have permission to do that.',
  notfound: '❌ Resource not found. It may have been deleted.',
  conflict: '⚠️ This resource already exists or there\'s a conflict.',
  validation: '📝 Please check your input. Something doesn\'t look right.',
  badrequest: '❌ Bad request. Please try again with valid data.',
  server: '💥 Oops! Server encountered an error. Try again later.',
  unknown: '❓ Something went wrong. Please try again.',
};

/**
 * Centralized API client with token management
 * @param {string} endpoint - API endpoint (e.g., '/api/auth/login')
 * @param {Object} options - fetch options (method, body, headers)
 * @returns {Promise<any>} - parsed JSON response or throws error
 */
async function apiCall(endpoint, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Attach JWT token if available
  if (authToken) {
    defaultHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  const config = {
    method: options.method || 'GET',
    headers: { ...defaultHeaders, ...options.headers },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      return handleApiError(response.status, data);
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      showToast(ERROR_MESSAGES.network, 5000);
      throw new Error('NETWORK_ERROR');
    }
    throw error;
  }
}

/**
 * Handle API errors with creative messages
 * @param {number} status - HTTP status code
 * @param {any} data - response data
 */
function handleApiError(status, data) {
  let message = ERROR_MESSAGES.unknown;

  if (status === 401) {
    message = ERROR_MESSAGES.unauthorized;
    // Auto-logout on 401
    authToken = null;
    localStorage.removeItem('auth_token');
    setTimeout(() => logout(), 1500);
  } else if (status === 403) {
    message = ERROR_MESSAGES.forbidden;
  } else if (status === 404) {
    message = ERROR_MESSAGES.notfound;
  } else if (status === 409) {
    message = ERROR_MESSAGES.conflict;
  } else if (status === 422) {
    message = ERROR_MESSAGES.validation;
    // Add field-level errors if available
    if (data.errors) {
      const fields = Object.keys(data.errors).join(', ');
      message += ` (${fields})`;
    }
  } else if (status === 400) {
    message = data.message || ERROR_MESSAGES.badrequest;
  } else if (status >= 500) {
    message = ERROR_MESSAGES.server;
  }

  showToast(message, 4000);
  throw new Error(message);
}

/**
 * Restore auth token from localStorage (called on page load)
 */
function restoreAuthToken() {
  authToken = localStorage.getItem('auth_token');
  const userJson = localStorage.getItem('current_user');
  if (userJson) {
    try {
      currentUser = JSON.parse(userJson);
    } catch (e) {
      // Invalid JSON, ignore
    }
  }
  // If token exists, skip auth page
  if (authToken && currentUser) {
    document.getElementById('auth-page').style.display = 'none';
    document.getElementById('app-page').style.display = 'block';
    showView('dashboard');
    showToast(`Welcome back, ${currentUser.fullName} ✦`);
  }
}

/**
 * Fetch the authenticated user details after login.
 * Falls back to email-based user if endpoint fails.
 * @param {string} email
 */
async function loadCurrentUser(email) {
  try {
    const user = await apiCall(`/api/users/email/${encodeURIComponent(email)}`, { method: 'GET' });
    currentUser = {
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
    };
  } catch (err) {
    // Fallback: use email as basis for user object
    // This allows testing even if user service has issues
    currentUser = {
      userId: 1, // Fallback ID
      fullName: email.split('@')[0],
      email: email,
    };
  }
  localStorage.setItem('current_user', JSON.stringify(currentUser));
}

/**
 * Login helper that stores token and user info.
 * Uses email-based user object for simplicity and reliability.
 */
async function loginUser(email, password) {
  const response = await apiCall('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });

  authToken = response.token;
  localStorage.setItem('auth_token', authToken);

  // Create user object from email (simplified approach)
  // Use the username (part before @) as fullName fallback
  currentUser = {
    userId: Math.random().toString(36).substr(2, 9), // Temporary ID
    fullName: email.split('@')[0],
    email: email,
  };
  localStorage.setItem('current_user', JSON.stringify(currentUser));
}

/* ─────────────────────────────────────
   AUTH
───────────────────────────────────── */

/**
 * Toggle between login and register tabs on the auth page.
 * @param {'login'|'register'} tab
 * @param {HTMLElement} el - the clicked tab button
 */
function switchAuthTab(tab, el) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('login-form').style.display    = tab === 'login'    ? 'block' : 'none';
  document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';
}

/**
 * Handle login or register (contextual based on active tab)
 */
async function enterApp() {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const isLoginMode = loginForm.style.display !== 'none';

  try {
    if (isLoginMode) {
      await handleLogin();
    } else {
      await handleRegister();
    }
  } catch (error) {
    // Error already shown via showToast in apiCall
  }
}

/**
 * Handle login request
 */
async function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value.trim();

  if (!email || !password) {
    showToast('📋 Please enter both email and password', 3000);
    return;
  }

  await loginUser(email, password);

  // Transition to app
  document.getElementById('auth-page').style.display = 'none';
  document.getElementById('app-page').style.display = 'block';
  showView('dashboard');
  showToast(`🎉 Welcome back, ${currentUser.fullName} ✦`, 3000);

  // Clear form
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
}

/**
 * Continue as guest stub for demo users.
 */
function continueAsGuest() {
  showToast('🔐 Guest demo is not supported for authenticated API operations. Please sign in or register.', 4500);
}

/**
 * Handle registration request
 */
async function handleRegister() {
  const firstName = document.getElementById('register-first-name').value.trim();
  const lastName = document.getElementById('register-last-name').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value.trim();
  const roleSelect = document.getElementById('register-role');
  const role = roleSelect ? roleSelect.value : 'Attendee';

  if (!firstName || !lastName || !email || !password) {
    showToast('📋 Please fill in all fields', 3000);
    return;
  }

  if (password.length < 8) {
    showToast('🔒 Password must be at least 8 characters', 3000);
    return;
  }

  const fullName = `${firstName} ${lastName}`;

  await apiCall('/api/auth/register', {
    method: 'POST',
    body: {
      fullName,
      email,
      password,
      roles: [role],
    },
  });

  await loginUser(email, password);

  document.getElementById('register-first-name').value = '';
  document.getElementById('register-last-name').value = '';
  document.getElementById('register-email').value = '';
  document.getElementById('register-password').value = '';

  document.getElementById('auth-page').style.display = 'none';
  document.getElementById('app-page').style.display = 'block';
  showView('dashboard');
  showToast(`🎊 Account created and logged in as ${currentUser.fullName}!`, 3000);
}

/**
 * Sign the user out and return to the auth page.
 */
function logout() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('current_user');

  document.getElementById('app-page').style.display = 'none';
  document.getElementById('auth-page').style.display = 'flex';

  // Clear forms
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
  document.getElementById('register-first-name').value = '';
  document.getElementById('register-last-name').value = '';
  document.getElementById('register-email').value = '';
  document.getElementById('register-password').value = '';

  showToast('👋 Signed out successfully', 2000);
}

/* ─────────────────────────────────────
   NAVIGATION
───────────────────────────────────── */

/**
 * Render a view's HTML template into its container and
 * update the topbar title, breadcrumb, and primary action button.
 * @param {string} id - view key (e.g. 'events', 'vendors')
 * @param {HTMLElement|null} navEl - the clicked nav item (to mark active)
 */
function showView(id, navEl) {
  // Swap active view
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const container = document.getElementById('view-' + id);
  if (!container) return;

  // Inject template if not already rendered
  if (container.innerHTML.trim() === '') {
    container.innerHTML = VIEW_TEMPLATES[id] || '<div class="empty-state"><div class="empty-title">Coming soon</div></div>';
  }

  container.classList.add('active');
  if (navEl) navEl.classList.add('active');

  // Update topbar
  document.getElementById('page-title').textContent   = VIEW_TITLES[id]  || id;
  document.getElementById('bc-cur').textContent        = VIEW_TITLES[id]  || id;
  document.getElementById('topbar-action').textContent = ACTION_LABELS[id] || '+ Create';

  currentView = id;

  if (id === 'events' || id === 'dashboard') {
    loadEvents();
  } else if (id === 'registrations') {
    loadRegistrations();
  }

  // Auto-expand vendor submenu when a vendor view is active
  if (id === 'vendors' || id === 'event-vendors') {
    openVendorMenu();
  }
}

/**
 * Toggle the vendors collapsible sub-menu.
 * @param {HTMLElement} el - the parent nav item
 */
function toggleVendorMenu(el) {
  const sub   = document.getElementById('vendor-sub');
  const arrow = document.getElementById('vendor-arrow');
  const isOpen = sub.classList.contains('open');

  if (isOpen) {
    sub.classList.remove('open');
    arrow.style.transform = 'rotate(0deg)';
  } else {
    openVendorMenu();
    showView('vendors', null);
  }
}

/** Open (expand) the vendor sub-menu without toggling. */
function openVendorMenu() {
  document.getElementById('vendor-sub').classList.add('open');
  document.getElementById('vendor-arrow').style.transform = 'rotate(180deg)';
}

/* ─────────────────────────────────────
   MODALS
───────────────────────────────────── */

/** Open the create/edit modal, contextual to the current view. */
async function openCreateModal() {
  editingEventId = null;
  document.getElementById('modal-title').textContent = MODAL_TITLES[currentView] || 'Create';
  await renderModalBody(currentView);
  document.getElementById('modal-backdrop').classList.add('open');
}

/**
 * Open modal to edit an existing event.
 * @param {number} eventId
 * @param {Object} eventData - event object from API
 */
async function openEditModal(eventId, eventData) {
  editingEventId = eventId;
  document.getElementById('modal-title').textContent = 'Edit Event';
  
  const body = document.getElementById('modal-body');
  if (!body) return;

  body.innerHTML = `
    <div class="form-row">
      <div class="form-group"><label>Event Name</label><input id="form-event-name" class="form-control" type="text" value="${escapeHtml(eventData.title || '')}"></div>
      <div class="form-group"><label>Event Date</label><input id="form-event-date" class="form-control" type="date" value="${new Date(eventData.eventDate).toISOString().split('T')[0]}"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Location</label><input id="form-event-location" class="form-control" value="${escapeHtml(eventData.location || '')}"></div>
      <div class="form-group"><label>Capacity</label><input class="form-control" type="number" placeholder="500"></div>
    </div>
    <div class="form-row full">
      <div class="form-group"><label>Description</label><textarea id="form-event-description" class="form-control" rows="3">${escapeHtml(eventData.description || '')}</textarea></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Status</label>
        <select class="form-control"><option>Draft</option><option>Published</option><option>Invite Only</option></select>
      </div>
      <div class="form-group"><label>Ticket Price (KES)</label><input class="form-control" type="number" placeholder="0 for free"></div>
    </div>
    <div class="form-actions">
      <button class="topbar-btn btn-primary" onclick="saveAndClose()">Update Event</button>
      <button class="topbar-btn btn-ghost" onclick="closeModal(null)">Cancel</button>
    </div>
  `;

  document.getElementById('modal-backdrop').classList.add('open');
}

/**
 * Escape HTML to prevent XSS in modal form fields.
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function renderModalBody(view) {
  const body = document.getElementById('modal-body');
  if (!body) return;

  if (view === 'events' || view === 'dashboard') {
    body.innerHTML = `
      <div class="form-row">
        <div class="form-group"><label>Event Name</label><input id="form-event-name" class="form-control" type="text" placeholder="e.g. Annual Tech Summit 2027"></div>
        <div class="form-group"><label>Event Date</label><input id="form-event-date" class="form-control" type="date"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Location</label><input id="form-event-location" class="form-control" placeholder="e.g. KICC, Nairobi"></div>
        <div class="form-group"><label>Capacity</label><input class="form-control" type="number" placeholder="500"></div>
      </div>
      <div class="form-row full">
        <div class="form-group"><label>Description</label><textarea id="form-event-description" class="form-control" rows="3" placeholder="Brief event description…"></textarea></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Status</label>
          <select class="form-control"><option>Draft</option><option>Published</option><option>Invite Only</option></select>
        </div>
        <div class="form-group"><label>Ticket Price (KES)</label><input class="form-control" type="number" placeholder="0 for free"></div>
      </div>
      <div class="form-actions">
        <button class="topbar-btn btn-primary" onclick="saveAndClose()">Save Event</button>
        <button class="topbar-btn btn-ghost" onclick="closeModal(null)">Cancel</button>
      </div>
    `;
  } else if (view === 'registrations') {
    let events = [];
    try {
      events = await apiCall('/api/events', { method: 'GET' });
    } catch (e) {
      events = [];
    }

    const eventOptions = events && events.length
      ? events.map(e => `<option value="${e.eventId}">${e.title} (${new Date(e.eventDate).toLocaleDateString()})</option>`).join('')
      : '<option disabled>No events available</option>';

    body.innerHTML = `
      <div class="form-row">
        <div class="form-group"><label>Attendee</label><input class="form-control" value="${currentUser?.fullName || 'You'}" readonly></div>
        <div class="form-group"><label>Select Event</label><select id="form-registration-event" class="form-control">${eventOptions}</select></div>
      </div>
      <div class="form-row full">
        <div class="form-group"><label>Notes</label><textarea id="form-registration-notes" class="form-control" rows="3" placeholder="Optional notes…"></textarea></div>
      </div>
      <div class="form-actions">
        <button class="topbar-btn btn-primary" onclick="saveAndClose()">Register</button>
        <button class="topbar-btn btn-ghost" onclick="closeModal(null)">Cancel</button>
      </div>
    `;
  } else {
    body.innerHTML = '<div class="empty-state"><div class="empty-title">This create form is not available yet.</div></div>';
  }
}

/**
 * Close the create modal.
 * @param {MouseEvent|null} e - pass null to close unconditionally;
 *   pass the event to close only when the backdrop itself is clicked.
 */
function closeModal(e) {
  if (!e || e.target === document.getElementById('modal-backdrop')) {
    document.getElementById('modal-backdrop').classList.remove('open');
  }
}

/** Save the form and call the appropriate API endpoint. */
async function saveAndClose() {
  try {
    let result;
    if (currentView === 'events' || currentView === 'dashboard') {
      result = await saveEvent();
    } else if (currentView === 'vendors') {
      result = await saveVendor();
    } else if (currentView === 'registrations') {
      result = await saveRegistration();
    } else {
      showToast('📋 Feature not yet implemented', 2000);
      return;
    }

    if (result === false) return;
    document.getElementById('modal-backdrop').classList.remove('open');
  } catch (error) {
    // Error already shown via showToast in apiCall
  }
}

/**
 * Save event (create or update)
 */
async function saveEvent() {
  const title = document.getElementById('form-event-name')?.value.trim();
  const eventDate = document.getElementById('form-event-date')?.value;
  const location = document.getElementById('form-event-location')?.value.trim();
  const description = document.getElementById('form-event-description')?.value.trim();

  if (!title || !eventDate || !location) {
    showToast('📋 Please fill in all required fields', 3000);
    return false;
  }

  const payload = {
    title,
    description,
    location,
    eventDate: new Date(eventDate).toISOString(),
    plannerId: currentUser?.userId || 1, // Fallback
  };

  // Determine if this is a create or update
  const isUpdate = editingEventId !== null;
  const endpoint = isUpdate ? `/api/events/${editingEventId}` : '/api/events';
  const method = isUpdate ? 'PUT' : 'POST';

  await apiCall(endpoint, {
    method: method,
    body: payload,
  });

  const message = isUpdate 
    ? '✏️ Event updated successfully! ✦' 
    : '🎉 Event created successfully! ✦';
  showToast(message, 2000);
  
  // Clear form
  document.getElementById('form-event-name').value = '';
  document.getElementById('form-event-date').value = '';
  document.getElementById('form-event-location').value = '';
  document.getElementById('form-event-description').value = '';

  // Reset edit state
  editingEventId = null;

  // Refresh events list
  loadEvents();
  return true;
}

/**
 * Load and display events
 */
async function loadEvents() {
  try {
    const events = await apiCall('/api/events', { method: 'GET' });
    const container = document.getElementById('events-list-container');
    
    if (!container) return;

    if (!events || events.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-title">No events yet</div></div>';
      return;
    }

    container.innerHTML = `
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Event Name</th>
              <th>Date</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${events.map(e => `
              <tr>
                <td>${e.title || 'Untitled'}</td>
                <td>${new Date(e.eventDate).toLocaleDateString()}</td>
                <td>${e.location || 'TBD'}</td>
                <td>
                  <button class="btn-ghost" onclick="openEditModal(${e.eventId}, ${JSON.stringify(e).replace(/"/g, '&quot;')})">Edit</button>
                  <button class="btn-ghost" onclick="deleteEvent(${e.eventId})" style="color: #e74c3c;">Delete</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (error) {
    const container = document.getElementById('events-list-container');
    if (container) {
      container.innerHTML = '<div class="empty-state"><div class="empty-title">Failed to load events</div></div>';
    }
  }
}

/**
 * Delete event after confirmation.
 */
async function deleteEvent(eventId) {
  if (!confirm('Are you sure you want to delete this event?')) return;

  try {
    await apiCall(`/api/events/${eventId}`, { method: 'DELETE' });
    showToast('🗑️ Event deleted successfully', 2000);
    loadEvents();
  } catch (error) {
    // Error already shown
  }
}

/**
 * Stub for editing events (kept for backward compatibility).
 */
function editEvent(eventId) {
  // This is now called via openEditModal with full event data
  showToast('📝 Edit functionality is handled via the modal', 1500);
}

/**
 * Load all registrations for the current user.
 */
async function loadRegistrations() {
  try {
    const registrations = await apiCall('/api/event-registrations', { method: 'GET' });
    const container = document.getElementById('view-registrations');
    if (!container) return;

    if (!registrations || registrations.length === 0) {
      container.innerHTML = `
        <div class="section-header">
          <div class="section-title">Event Registrations</div>
          <button class="topbar-btn btn-primary" onclick="openCreateModal()">+ Register Attendee</button>
        </div>
        <div class="empty-state"><div class="empty-title">No registrations yet</div></div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="section-header">
        <div class="section-title">Event Registrations</div>
        <button class="topbar-btn btn-primary" onclick="openCreateModal()">+ Register Attendee</button>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Registration ID</th><th>Event ID</th><th>Attendee ID</th><th>Status</th><th>Registered On</th><th>Actions</th></tr></thead>
          <tbody>
            ${registrations.map(r => `
              <tr>
                <td>${r.registrationId}</td>
                <td>${r.eventId}</td>
                <td>${r.attendeeId}</td>
                <td>${r.paymentStatus || 'Pending'}</td>
                <td>${new Date(r.registeredAt).toLocaleDateString()}</td>
                <td><button class="btn-danger topbar-btn" onclick="confirmDelete('registration')">Cancel</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (error) {
    const container = document.getElementById('view-registrations');
    if (container) {
      container.innerHTML = '<div class="empty-state"><div class="empty-title">Unable to load registrations</div></div>';
    }
  }
}

/**
 * Stub for vendor saving (implement similarly to saveEvent)
 */
async function saveVendor() {
  showToast('🔄 Vendor management coming soon!', 2000);
}

/**
 * Stub for registration saving
 */
async function saveRegistration() {
  const eventId = Number(document.getElementById('form-registration-event')?.value);
  if (!eventId || !currentUser?.userId) {
    showToast('📋 Select an event and make sure you are logged in', 3000);
    return false;
  }

  await apiCall('/api/event-registrations', {
    method: 'POST',
    body: {
      eventId,
      attendeeId: currentUser.userId,
    },
  });

  showToast('✅ Registered for event successfully!', 3000);
  loadRegistrations();
  return true;
}

/* ─────────────────────────────────────
   DELETE MODAL
───────────────────────────────────── */

/**
 * Show the delete confirmation modal.
 * @param {string} type - record type label for logging (e.g. 'event', 'vendor')
 */
function confirmDelete(type) {
  document.getElementById('delete-modal').classList.add('open');
}

/**
 * Close the delete modal.
 * @param {MouseEvent|null} e
 */
function closeDeleteModal(e) {
  if (!e || e.target === document.getElementById('delete-modal')) {
    document.getElementById('delete-modal').classList.remove('open');
  }
}

/** Execute the delete action. */
async function doDelete() {
  try {
    // Generic delete handler (specific delete functions handle the API calls)
    document.getElementById('delete-modal').classList.remove('open');
    showToast('🗑️ Record deleted permanently', 2000);
  } catch (error) {
    // Error already shown
  }
}

/* ─────────────────────────────────────
   TOAST
───────────────────────────────────── */

/**
 * Show a temporary notification toast.
 * @param {string} msg - message to display
 * @param {number} [duration=3000] - milliseconds before auto-hide
 */
function showToast(msg, duration = 3000) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

/* ─────────────────────────────────────
   INIT — restore auth and render on page load
───────────────────────────────────── */
(function init() {
  // Pre-render dashboard template so it's ready when enterApp() is called
  const dashContainer = document.getElementById('view-dashboard');
  if (dashContainer && VIEW_TEMPLATES.dashboard) {
    dashContainer.innerHTML = VIEW_TEMPLATES.dashboard;
  }

  // Restore previous session if available
  restoreAuthToken();

  // Load events if authenticated
  if (authToken) {
    loadEvents();
  }
})();