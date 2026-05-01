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
 * Transition from auth page into the main app.
 * In production this would validate credentials via POST /api/auth/login
 * or POST /api/auth/register before proceeding.
 */
function enterApp() {
  document.getElementById('auth-page').style.display = 'none';
  document.getElementById('app-page').style.display  = 'block';

  // Render the default dashboard view on first load
  renderView('dashboard');
  showToast('Welcome back, Alexandra ✦');
}

/**
 * Sign the user out and return to the auth page.
 */
function logout() {
  document.getElementById('app-page').style.display  = 'none';
  document.getElementById('auth-page').style.display = 'flex';
  showToast('Signed out successfully');
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
function openCreateModal() {
  document.getElementById('modal-title').textContent = MODAL_TITLES[currentView] || 'Create';
  document.getElementById('modal-backdrop').classList.add('open');
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

/** Save the form and close the modal (stub — wire to your API calls). */
function saveAndClose() {
  // TODO: collect form data and call the appropriate endpoint, e.g.:
  //   POST /api/events            for events
  //   POST /api/vendors           for vendors
  //   POST /api/event-registrations for registrations
  //   etc.
  document.getElementById('modal-backdrop').classList.remove('open');
  showToast('Record saved successfully ✦');
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

/** Execute the delete action (stub — wire to your DELETE endpoints). */
function doDelete() {
  // TODO: call the appropriate endpoint, e.g.:
  //   DELETE /api/events/{id}
  //   DELETE /api/vendors/{id}
  //   DELETE /api/roles/{id}
  //   etc.
  document.getElementById('delete-modal').classList.remove('open');
  showToast('Record deleted permanently');
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
   INIT — render dashboard on page load
   (only runs if the app page is already visible)
───────────────────────────────────── */
(function init() {
  // Pre-render dashboard template so it's ready when enterApp() is called
  const dashContainer = document.getElementById('view-dashboard');
  if (dashContainer && VIEW_TEMPLATES.dashboard) {
    dashContainer.innerHTML = VIEW_TEMPLATES.dashboard;
  }
})();