/* ═══════════════════════════════════════
   modals.js — Create/Edit Modal,
   Delete Confirm Modal, Form Builders
═══════════════════════════════════════ */

/* ─────────────────────────────────────
   FORM BUILDER MAP
   Maps each view id to a form-HTML
   function. null = no form available.
───────────────────────────────────── */
const MODAL_FORMS = {
  dashboard:            createEventForm,
  events:               createEventForm,
  registrations:        registerAttendeeForm,
  vendors:              addVendorForm,
  'event-vendors':      linkVendorForm,
  'service-providers':  addProviderForm,
  'event-services':     linkServiceForm,
  payments:             recordPaymentForm,
  users:                inviteUserForm,
  roles:                createRoleForm,
  'browse-events':      registerEventUserForm,
  'vendor-dashboard':   submitQuoteForm,
  'vendor-invoices':    newInvoiceForm,
};

/* ─────────────────────────────────────
   CREATE / EDIT MODAL
───────────────────────────────────── */

/** Open the create/edit modal, contextual to the current view. */
function openCreateModal() {  // eslint-disable-line no-unused-vars
  const titleEl = document.getElementById('modal-title');
  const bodyEl  = document.getElementById('modal-body');

  titleEl.textContent = MODAL_TITLES_MAP[currentView] || 'Create';

  const formFn = MODAL_FORMS[currentView];
  bodyEl.innerHTML = formFn
    ? formFn()
    : '<p style="color:var(--muted);font-size:14px">No form available for this view.</p>';

  document.getElementById('modal-backdrop').classList.add('open');
}

/**
 * Close the create/edit modal.
 * @param {MouseEvent|null} e
 */
function closeModal(e) {  // eslint-disable-line no-unused-vars
  if (!e || e.target === document.getElementById('modal-backdrop')) {
    document.getElementById('modal-backdrop').classList.remove('open');
  }
}

/**
 * Save the form and close the modal.
 * Delegates to the view-specific submit handler in api.js when available,
 * otherwise falls back to a toast (for vendor/provider portal forms).
 */
function saveAndClose() {  // eslint-disable-line no-unused-vars
  const submitMap = {
    dashboard:           submitEventForm,
    events:              submitEventForm,
    registrations:       submitRegistrationForm,
    vendors:             submitVendorForm,
    'event-vendors':     submitEventVendorForm,
    'service-providers': submitProviderForm,
    'event-services':    submitEventServiceForm,
    payments:            submitPaymentForm,
    users:               submitUserForm,
    roles:               submitRoleForm,
  };

  const handler = submitMap[currentView];
  if (typeof handler === 'function') {
    const btn = document.querySelector('#modal-body .topbar-btn.btn-primary');
    handler(btn);
  } else {
    document.getElementById('modal-backdrop').classList.remove('open');
    showToast('Record saved successfully ✦');
  }
}

/* ─────────────────────────────────────
   DELETE CONFIRM MODAL
───────────────────────────────────── */

/**
 * Show the delete confirmation modal.
 * @param {string} type - record type label e.g. 'event', 'vendor'
 */
function confirmDelete(type) {  // eslint-disable-line no-unused-vars
  document.getElementById('delete-modal').classList.add('open');
}

/**
 * Close the delete modal.
 * @param {MouseEvent|null} e
 */
function closeDeleteModal(e) {  // eslint-disable-line no-unused-vars
  if (!e || e.target === document.getElementById('delete-modal')) {
    document.getElementById('delete-modal').classList.remove('open');
  }
}

/**
 * Execute the delete action.
 * In production, call DELETE /api/{resource}/{id}.
 */
function doDelete() {  // eslint-disable-line no-unused-vars
  document.getElementById('delete-modal').classList.remove('open');
  showToast('Record deleted permanently');
}

/* ─────────────────────────────────────
   FORM HTML BUILDERS
   Each returns an HTML string for the
   modal body.
───────────────────────────────────── */

function createEventForm() {
  return `
    <div class="form-row">
      <div class="form-group"><label>Event Name</label><input id="ef-name" class="form-control" type="text" placeholder="e.g. Annual Tech Summit 2027"></div>
      <div class="form-group"><label>Event Date</label><input id="ef-date" class="form-control" type="date"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Venue</label><input id="ef-venue" class="form-control" placeholder="e.g. KICC, Nairobi"></div>
      <div class="form-group"><label>Capacity</label><input id="ef-capacity" class="form-control" type="number" placeholder="500"></div>
    </div>
    <div class="form-row full">
      <div class="form-group"><label>Description</label><textarea id="ef-description" class="form-control" rows="3" placeholder="Brief event description…"></textarea></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Status</label>
        <select id="ef-status" class="form-control"><option>Draft</option><option>Published</option><option>Invite Only</option></select>
      </div>
      <div class="form-group"><label>Ticket Price (KES)</label><input id="ef-price" class="form-control" type="number" placeholder="0 for free"></div>
    </div>
    <div class="form-actions">
      <button class="topbar-btn btn-primary" onclick="saveAndClose()">Save Event</button>
      <button class="topbar-btn btn-ghost"   onclick="closeModal(null)">Cancel</button>
    </div>`;
}

function registerAttendeeForm() {
  return `
    <div class="form-row">
      <div class="form-group"><label>Event ID</label><input id="rf-event" class="form-control" type="number" placeholder="Event ID"></div>
      <div class="form-group"><label>User ID</label><input id="rf-user" class="form-control" type="number" placeholder="User ID"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Ticket Type</label>
        <select id="rf-ticket" class="form-control"><option>General</option><option>VIP</option><option>Media</option></select>
      </div>
    </div>
    <div class="form-actions">
      <button class="topbar-btn btn-primary" onclick="saveAndClose()">Register Attendee</button>
      <button class="topbar-btn btn-ghost"   onclick="closeModal(null)">Cancel</button>
    </div>`;
}

function addVendorForm() {
  return `
    <div class="form-row">
      <div class="form-group"><label>Vendor Name</label><input id="vf-name" class="form-control" placeholder="Bloom &amp; Co."></div>
      <div class="form-group"><label>Category</label>
        <select id="vf-category" class="form-control"><option>Catering</option><option>AV &amp; Tech</option><option>Décor</option><option>Photography</option></select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Contact Email</label><input id="vf-email" class="form-control" type="email" placeholder="vendor@email.com"></div>
      <div class="form-group"><label>Phone</label><input id="vf-phone" class="form-control" placeholder="+254 700 000 000"></div>
    </div>
    <div class="form-actions">
      <button class="topbar-btn btn-primary" onclick="saveAndClose()">Add Vendor</button>
      <button class="topbar-btn btn-ghost"   onclick="closeModal(null)">Cancel</button>
    </div>`;
}

function linkVendorForm() {
  return `
    <div class="form-row">
      <div class="form-group"><label>Event ID</label><input id="ev-event" class="form-control" type="number" placeholder="Event ID"></div>
      <div class="form-group"><label>Vendor ID</label><input id="ev-vendor" class="form-control" type="number" placeholder="Vendor ID"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Role / Service</label><input id="ev-role" class="form-control" placeholder="e.g. Main AV, Catering"></div>
      <div class="form-group"><label>Status</label>
        <select id="ev-status" class="form-control"><option>Invited</option><option>Pending</option><option>Confirmed</option></select>
      </div>
    </div>
    <div class="form-actions">
      <button class="topbar-btn btn-primary" onclick="saveAndClose()">Link Vendor</button>
      <button class="topbar-btn btn-ghost"   onclick="closeModal(null)">Cancel</button>
    </div>`;
}

function addProviderForm() {
  return `
    <div class="form-row">
      <div class="form-group"><label>Provider Name</label><input id="pf-name" class="form-control" placeholder="EventGuard Security"></div>
      <div class="form-group"><label>Service Type</label>
        <select id="pf-type" class="form-control"><option>Security</option><option>Transport</option><option>Cleaning</option><option>Lighting</option></select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Contact Email</label><input id="pf-email" class="form-control" type="email" placeholder="provider@email.com"></div>
      <div class="form-group"><label>Phone</label><input id="pf-phone" class="form-control" placeholder="+254 700 000 000"></div>
    </div>
    <div class="form-actions">
      <button class="topbar-btn btn-primary" onclick="saveAndClose()">Add Provider</button>
      <button class="topbar-btn btn-ghost"   onclick="closeModal(null)">Cancel</button>
    </div>`;
}

function linkServiceForm() {
  return `
    <div class="form-row">
      <div class="form-group"><label>Event ID</label><input id="es-event" class="form-control" type="number" placeholder="Event ID"></div>
      <div class="form-group"><label>Provider ID</label><input id="es-provider" class="form-control" type="number" placeholder="Provider ID"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Service</label><input id="es-service" class="form-control" placeholder="e.g. Security, Transport"></div>
      <div class="form-group"><label>Cost (KES)</label><input id="es-cost" class="form-control" type="number" placeholder="25000"></div>
    </div>
    <div class="form-actions">
      <button class="topbar-btn btn-primary" onclick="saveAndClose()">Link Service</button>
      <button class="topbar-btn btn-ghost"   onclick="closeModal(null)">Cancel</button>
    </div>`;
}

function recordPaymentForm() {
  return `
    <div class="form-row">
      <div class="form-group"><label>Event ID</label><input id="pay-event" class="form-control" type="number" placeholder="Event ID"></div>
      <div class="form-group"><label>User ID</label><input id="pay-user" class="form-control" type="number" placeholder="User ID"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Amount (KES)</label><input id="pay-amount" class="form-control" type="number" placeholder="45000"></div>
      <div class="form-group"><label>Payment Method</label>
        <select id="pay-method" class="form-control"><option>M-Pesa</option><option>Bank Transfer</option><option>Card</option><option>Cash</option></select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Status</label>
        <select id="pay-status" class="form-control"><option>Paid</option><option>Pending</option><option>Failed</option></select>
      </div>
      <div class="form-group"><label>Date</label><input id="pay-date" class="form-control" type="date"></div>
    </div>
    <div class="form-actions">
      <button class="topbar-btn btn-primary" onclick="saveAndClose()">Record Payment</button>
      <button class="topbar-btn btn-ghost"   onclick="closeModal(null)">Cancel</button>
    </div>`;
}

function inviteUserForm() {
  return `
    <div class="form-row">
      <div class="form-group"><label>Full Name</label><input id="uf-name" class="form-control" placeholder="James Mwangi"></div>
      <div class="form-group"><label>Email</label><input id="uf-email" class="form-control" type="email" placeholder="james@example.com"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Temporary Password</label><input id="uf-password" class="form-control" type="password" placeholder="Min 8 characters"></div>
      <div class="form-group"><label>Role ID</label>
        <input id="uf-role" class="form-control" type="number" placeholder="Role ID (e.g. 1 = Admin)">
      </div>
    </div>
    <div class="form-actions">
      <button class="topbar-btn btn-primary" onclick="saveAndClose()">Send Invitation</button>
      <button class="topbar-btn btn-ghost"   onclick="closeModal(null)">Cancel</button>
    </div>`;
}

function createRoleForm() {
  return `
    <div class="form-row full">
      <div class="form-group"><label>Role Name</label><input id="rolef-name" class="form-control" placeholder="e.g. Finance Manager"></div>
    </div>
    <div class="form-row full">
      <div class="form-group"><label>Description</label><textarea id="rolef-desc" class="form-control" rows="2" placeholder="Describe what this role can do…"></textarea></div>
    </div>
    <div class="form-actions">
      <button class="topbar-btn btn-primary" onclick="saveAndClose()">Create Role</button>
      <button class="topbar-btn btn-ghost"   onclick="closeModal(null)">Cancel</button>
    </div>`;
}

function registerEventUserForm() {
  return `
    <div class="form-row">
      <div class="form-group"><label>Event</label>
        <select class="form-control">
          <option>Tech Summit 2026 — KES 4,500</option>
          <option>Annual Gala Dinner — KES 15,000</option>
          <option>Product Launch — KES 2,500</option>
        </select>
      </div>
      <div class="form-group"><label>Ticket Type</label>
        <select class="form-control"><option>General Admission</option><option>VIP</option></select>
      </div>
    </div>
    <div class="form-row full">
      <div class="form-group"><label>Special Requirements</label>
        <textarea class="form-control" rows="2" placeholder="Dietary needs, accessibility…"></textarea>
      </div>
    </div>
    <div class="form-actions">
      <button class="topbar-btn btn-primary"
        onclick="closeModal(null); openPaymentModal('Tech Summit 2026','KES 4,500')">
        Proceed to Payment
      </button>
      <button class="topbar-btn btn-ghost" onclick="closeModal(null)">Cancel</button>
    </div>`;
}

function submitQuoteForm() {
  return `
    <div class="form-row">
      <div class="form-group"><label>Event</label>
        <select class="form-control"><option>Tech Summit 2026</option><option>Annual Gala Dinner</option></select>
      </div>
      <div class="form-group"><label>Service Category</label>
        <select class="form-control"><option>Catering</option><option>AV &amp; Tech</option><option>Décor</option><option>Photography</option></select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Quote Amount (KES)</label><input class="form-control" type="number" placeholder="45,000"></div>
      <div class="form-group"><label>Valid Until</label><input class="form-control" type="date"></div>
    </div>
    <div class="form-row full">
      <div class="form-group"><label>Notes</label><textarea class="form-control" rows="2" placeholder="Additional details…"></textarea></div>
    </div>
    <div class="form-actions">
      <button class="topbar-btn btn-primary" onclick="saveAndClose()">Submit Quote</button>
      <button class="topbar-btn btn-ghost"   onclick="closeModal(null)">Cancel</button>
    </div>`;
}

function newInvoiceForm() {
  return `
    <div class="form-row">
      <div class="form-group"><label>Event</label>
        <select class="form-control"><option>Tech Summit 2026</option><option>Annual Gala Dinner</option></select>
      </div>
      <div class="form-group"><label>Invoice Amount (KES)</label><input class="form-control" type="number" placeholder="45,000"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Due Date</label><input class="form-control" type="date"></div>
      <div class="form-group"><label>Status</label>
        <select class="form-control"><option>Draft</option><option>Sent</option></select>
      </div>
    </div>
    <div class="form-actions">
      <button class="topbar-btn btn-primary" onclick="saveAndClose()">Create Invoice</button>
      <button class="topbar-btn btn-ghost"   onclick="closeModal(null)">Cancel</button>
    </div>`;
}