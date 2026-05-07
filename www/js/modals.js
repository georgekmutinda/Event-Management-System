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
 * In production, wire this to the appropriate POST endpoint:
 *   POST /api/events, POST /api/vendors, etc.
 */
function saveAndClose() {  // eslint-disable-line no-unused-vars
  document.getElementById('modal-backdrop').classList.remove('open');
  showToast('Record saved successfully ✦');
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
      <div class="form-group"><label>Event Name</label><input class="form-control" type="text" placeholder="e.g. Annual Tech Summit 2027"></div>
      <div class="form-group"><label>Event Date</label><input class="form-control" type="date"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Venue</label><input class="form-control" placeholder="e.g. KICC, Nairobi"></div>
      <div class="form-group"><label>Capacity</label><input class="form-control" type="number" placeholder="500"></div>
    </div>
    <div class="form-row full">
      <div class="form-group"><label>Description</label><textarea class="form-control" rows="3" placeholder="Brief event description…"></textarea></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Status</label>
        <select class="form-control"><option>Draft</option><option>Published</option><option>Invite Only</option></select>
      </div>
      <div class="form-group"><label>Ticket Price (KES)</label><input class="form-control" type="number" placeholder="0 for free"></div>
    </div>
    <div class="form-actions">
      <button class="topbar-btn btn-primary" onclick="saveAndClose()">Save Event</button>
      <button class="topbar-btn btn-ghost"   onclick="closeModal(null)">Cancel</button>
    </div>`;
}

function registerAttendeeForm() {
  return `
    <div class="form-row">
      <div class="form-group"><label>Attendee Name</label><input class="form-control" placeholder="James Mwangi"></div>
      <div class="form-group"><label>Email</label><input class="form-control" type="email" placeholder="james@example.com"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Event</label>
        <select class="form-control"><option>Tech Summit 2026</option><option>Annual Gala Dinner</option><option>Product Launch</option></select>
      </div>
      <div class="form-group"><label>Ticket Type</label>
        <select class="form-control"><option>General</option><option>VIP</option><option>Media</option></select>
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
      <div class="form-group"><label>Vendor Name</label><input class="form-control" placeholder="Bloom &amp; Co."></div>
      <div class="form-group"><label>Category</label>
        <select class="form-control"><option>Catering</option><option>AV &amp; Tech</option><option>Décor</option><option>Photography</option></select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Contact Email</label><input class="form-control" type="email" placeholder="vendor@email.com"></div>
      <div class="form-group"><label>Phone</label><input class="form-control" placeholder="+254 700 000 000"></div>
    </div>
    <div class="form-actions">
      <button class="topbar-btn btn-primary" onclick="saveAndClose()">Add Vendor</button>
      <button class="topbar-btn btn-ghost"   onclick="closeModal(null)">Cancel</button>
    </div>`;
}

function linkVendorForm() {
  return `
    <div class="form-row">
      <div class="form-group"><label>Event</label>
        <select class="form-control"><option>Tech Summit 2026</option><option>Annual Gala Dinner</option><option>Product Launch</option></select>
      </div>
      <div class="form-group"><label>Vendor</label>
        <select class="form-control"><option>SoundWave Pro</option><option>Bloom &amp; Co.</option><option>Cater Elite</option></select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Role / Service</label><input class="form-control" placeholder="e.g. Main AV, Catering"></div>
      <div class="form-group"><label>Confirmed</label>
        <select class="form-control"><option>Invited</option><option>Pending</option><option>Confirmed</option></select>
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
      <div class="form-group"><label>Provider Name</label><input class="form-control" placeholder="EventGuard Security"></div>
      <div class="form-group"><label>Service Type</label>
        <select class="form-control"><option>Security</option><option>Transport</option><option>Cleaning</option><option>Lighting</option></select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Contact Email</label><input class="form-control" type="email" placeholder="provider@email.com"></div>
      <div class="form-group"><label>Phone</label><input class="form-control" placeholder="+254 700 000 000"></div>
    </div>
    <div class="form-actions">
      <button class="topbar-btn btn-primary" onclick="saveAndClose()">Add Provider</button>
      <button class="topbar-btn btn-ghost"   onclick="closeModal(null)">Cancel</button>
    </div>`;
}

function linkServiceForm() {
  return `
    <div class="form-row">
      <div class="form-group"><label>Event</label>
        <select class="form-control"><option>Tech Summit 2026</option><option>Annual Gala Dinner</option><option>Product Launch</option></select>
      </div>
      <div class="form-group"><label>Service Provider</label>
        <select class="form-control"><option>EventGuard Security</option><option>TransEA Logistics</option><option>CleanPro Kenya</option></select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Service</label><input class="form-control" placeholder="e.g. Security, Transport"></div>
      <div class="form-group"><label>Cost (KES)</label><input class="form-control" type="number" placeholder="25,000"></div>
    </div>
    <div class="form-actions">
      <button class="topbar-btn btn-primary" onclick="saveAndClose()">Link Service</button>
      <button class="topbar-btn btn-ghost"   onclick="closeModal(null)">Cancel</button>
    </div>`;
}

function recordPaymentForm() {
  return `
    <div class="form-row">
      <div class="form-group"><label>Event</label>
        <select class="form-control"><option>Tech Summit 2026</option><option>Annual Gala Dinner</option><option>Product Launch</option></select>
      </div>
      <div class="form-group"><label>Payer Name</label><input class="form-control" placeholder="James Mwangi"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Amount (KES)</label><input class="form-control" type="number" placeholder="45,000"></div>
      <div class="form-group"><label>Payment Method</label>
        <select class="form-control"><option>M-Pesa</option><option>Bank Transfer</option><option>Card</option><option>Cash</option></select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Status</label>
        <select class="form-control"><option>Paid</option><option>Pending</option><option>Failed</option></select>
      </div>
      <div class="form-group"><label>Date</label><input class="form-control" type="date"></div>
    </div>
    <div class="form-actions">
      <button class="topbar-btn btn-primary" onclick="saveAndClose()">Record Payment</button>
      <button class="topbar-btn btn-ghost"   onclick="closeModal(null)">Cancel</button>
    </div>`;
}

function inviteUserForm() {
  return `
    <div class="form-row">
      <div class="form-group"><label>Full Name</label><input class="form-control" placeholder="James Mwangi"></div>
      <div class="form-group"><label>Email</label><input class="form-control" type="email" placeholder="james@example.com"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Role</label>
        <select class="form-control"><option>Administrator</option><option>Event Organiser</option><option>Vendor</option><option>Service Provider</option></select>
      </div>
      <div class="form-group"><label>Department</label><input class="form-control" placeholder="Operations"></div>
    </div>
    <div class="form-actions">
      <button class="topbar-btn btn-primary" onclick="saveAndClose()">Send Invitation</button>
      <button class="topbar-btn btn-ghost"   onclick="closeModal(null)">Cancel</button>
    </div>`;
}

function createRoleForm() {
  return `
    <div class="form-row full">
      <div class="form-group"><label>Role Name</label><input class="form-control" placeholder="e.g. Finance Manager"></div>
    </div>
    <div class="form-row full">
      <div class="form-group"><label>Description</label><textarea class="form-control" rows="2" placeholder="Describe what this role can do…"></textarea></div>
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