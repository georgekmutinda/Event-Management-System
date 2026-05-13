const MODAL_FORMS = {
  events: createEventForm
};

let pendingDelete = null;

function openCreateModal() {
  const titleEl = document.getElementById('modal-title');
  const bodyEl = document.getElementById('modal-body');
  const formFn = MODAL_FORMS[currentView];

  if (!formFn || !bodyEl || !titleEl) {
    showToast('This view does not have a create form.');
    return;
  }

  titleEl.textContent = MODAL_TITLES_MAP[currentView] || 'Create';
  bodyEl.innerHTML = formFn();
  document.getElementById('modal-backdrop').classList.add('open');
}

function closeModal(e) {
  if (!e || e.target === document.getElementById('modal-backdrop')) {
    document.getElementById('modal-backdrop').classList.remove('open');
  }
}

function saveAndClose() {
  if (currentView === 'events') {
    const button = document.querySelector('#modal-body .topbar-btn.btn-primary');
    submitEventForm(button);
  }
}

function confirmDelete(resource, id, label) {
  pendingDelete = { resource, id, label };
  document.getElementById('delete-modal').classList.add('open');
}

function closeDeleteModal(e) {
  if (!e || e.target === document.getElementById('delete-modal')) {
    document.getElementById('delete-modal').classList.remove('open');
  }
}

async function doDelete() {
  document.getElementById('delete-modal').classList.remove('open');
  if (!pendingDelete) return;

  const nextDelete = pendingDelete;
  pendingDelete = null;
  await performDelete(nextDelete.resource, nextDelete.id);
}

function createEventForm() {
  return `
    <div id="form-error" style="display:none;color:#e74c3c;font-size:13px;margin-bottom:10px"></div>
    <div class="form-row">
      <div class="form-group"><label>Event Title</label><input id="ef-name" class="form-control" type="text" placeholder="Annual Gala Dinner"></div>
      <div class="form-group"><label>Event Date</label><input id="ef-date" class="form-control" type="datetime-local"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Location</label><input id="ef-location" class="form-control" type="text" placeholder="KICC, Nairobi"></div>
      <div class="form-group"><label>Ticket Price (KES)</label><input id="ef-price" class="form-control" type="number" min="0" step="0.01" placeholder="4500"></div>
    </div>
    <div class="form-row full">
      <div class="form-group"><label>Description</label><textarea id="ef-description" class="form-control" rows="4" placeholder="Add event details"></textarea></div>
    </div>
    <div class="form-actions">
      <button class="topbar-btn btn-primary" onclick="saveAndClose()">Save Event</button>
      <button class="topbar-btn btn-ghost" onclick="closeModal(null)">Cancel</button>
    </div>`;
}
