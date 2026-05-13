function getViewTemplate(id) {
  return `
    <div class="section-header">
      <div class="section-title">${VIEW_TITLES[id] || 'Dashboard'}</div>
    </div>
    <div id="view-${id}-body" class="view-body">
      <div class="empty-state">
        <div class="empty-title">Loading...</div>
      </div>
    </div>`;
}

window.loadViewData = async function (id) {
  const root = document.getElementById(`view-${id}-body`);
  if (!root) return;

  try {
    switch (id) {
      case 'dashboard':
        await renderDashboard(root);
        break;
      case 'events':
        await renderEvents(root);
        break;
      case 'registrations':
        await renderPlannerRegistrations(root);
        break;
      case 'vendors':
        await renderVendors(root);
        break;
      case 'service-providers':
        await renderServiceProviders(root);
        break;
      case 'payments':
        await renderPayments(root);
        break;
      case 'browse-events':
        await renderBrowseEvents(root);
        break;
      case 'my-registrations':
        await renderMyRegistrations(root);
        break;
      case 'my-payments':
        await renderMyPayments(root);
        break;
      case 'vendor-dashboard':
      case 'my-assignments':
      case 'vendor-profile':
      case 'provider-dashboard':
      case 'my-services':
      case 'provider-profile':
        renderStaticPortal(root, id);
        break;
      default:
        root.innerHTML = emptyState('This view has not been connected yet.');
        break;
    }
  } catch (err) {
    root.innerHTML = emptyState(err.message || 'Unable to load this view right now.');
  }
};

async function renderDashboard(root) {
  const role = window.getCurrentRole();

  if (role === 'Planner') {
    const [events, registrations, vendors, providers] = await Promise.all([
      API.PlannerAPI.getEvents(),
      API.PlannerAPI.getPaidRegistrations(),
      API.PlannerAPI.getVendors(),
      API.PlannerAPI.getServiceProviders()
    ]);

    root.innerHTML = `
      ${statsGrid([
        ['My Events', events.length],
        ['Paid Attendees', registrations.length],
        ['Vendors', vendors.length],
        ['Service Providers', providers.length]
      ])}
      ${plannerEventsTable(events)}`;
    return;
  }

  if (role === 'Admin') {
    const [events, vendors, providers, payments] = await Promise.all([
      API.EventsAPI.getAll(),
      API.VendorsAPI.getAll(),
      API.ServiceProvidersAPI.getAll(),
      API.PaymentsAPI.getAll()
    ]);

    const totalRevenue = payments
      .filter(item => item.paymentStatus === 'Completed')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    root.innerHTML = `
      ${statsGrid([
        ['Events', events.length],
        ['Vendors', vendors.length],
        ['Service Providers', providers.length],
        ['Revenue (KES)', formatCurrency(totalRevenue)]
      ])}
      ${adminOverviewTable(events)}`;
    return;
  }

  root.innerHTML = emptyState('Use the menu on the left to access your workspace.');
}

async function renderEvents(root) {
  const role = window.getCurrentRole();
  const events = role === 'Planner' ? await API.PlannerAPI.getEvents() : await API.EventsAPI.getAll();

  if (!events.length) {
    root.innerHTML = emptyState('No events have been created yet.');
    return;
  }

  root.innerHTML = `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Event</th>
            <th>Date</th>
            <th>Location</th>
            <th>Ticket Price</th>
            <th>Paid Attendees</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${events.map(event => `
            <tr>
              <td><strong>${escapeHtml(event.title)}</strong></td>
              <td>${formatDate(event.eventDate)}</td>
              <td>${escapeHtml(event.location || '-')}</td>
              <td>${formatCurrency(event.ticketPrice || 0)}</td>
              <td>${event.paidRegistrations ?? '-'}</td>
              <td>
                <button class="btn-danger topbar-btn" onclick="confirmDelete('events', ${event.eventId}, '${escapeJs(event.title)}')">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}

async function renderPlannerRegistrations(root) {
  const registrations = await API.PlannerAPI.getPaidRegistrations();
  if (!registrations.length) {
    root.innerHTML = emptyState('No paid attendees found for your events yet.');
    return;
  }

  root.innerHTML = `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Attendee</th>
            <th>Email</th>
            <th>Event</th>
            <th>Ticket</th>
            <th>Amount Paid</th>
            <th>Registered</th>
          </tr>
        </thead>
        <tbody>
          ${registrations.map(item => `
            <tr>
              <td><strong>${escapeHtml(item.attendeeName)}</strong></td>
              <td>${escapeHtml(item.attendeeEmail)}</td>
              <td>${escapeHtml(item.eventTitle)}</td>
              <td>${escapeHtml(item.ticketType)}</td>
              <td>${formatCurrency(item.amountPaid || 0)}</td>
              <td>${formatDateTime(item.registeredAt)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}

async function renderVendors(root) {
  const role = window.getCurrentRole();
  const vendors = role === 'Planner' ? await API.PlannerAPI.getVendors() : await API.VendorsAPI.getAll();

  if (!vendors.length) {
    root.innerHTML = emptyState('No vendors are available yet.');
    return;
  }

  root.innerHTML = `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Vendor</th>
            <th>Category</th>
            <th>Description</th>
            <th>${role === 'Planner' ? 'Linked Events' : 'User ID'}</th>
          </tr>
        </thead>
        <tbody>
          ${vendors.map(item => `
            <tr>
              <td><strong>${escapeHtml(item.businessName)}</strong></td>
              <td>${escapeHtml(item.productType || '-')}</td>
              <td>${escapeHtml(item.description || '-')}</td>
              <td>${role === 'Planner' ? item.eventCount : item.userId}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}

async function renderServiceProviders(root) {
  const role = window.getCurrentRole();
  const providers = role === 'Planner' ? await API.PlannerAPI.getServiceProviders() : await API.ServiceProvidersAPI.getAll();

  if (!providers.length) {
    root.innerHTML = emptyState('No service providers are available yet.');
    return;
  }

  root.innerHTML = `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Service Type</th>
            <th>Description</th>
            <th>${role === 'Planner' ? 'Linked Events' : 'User ID'}</th>
          </tr>
        </thead>
        <tbody>
          ${providers.map(item => `
            <tr>
              <td><strong>${escapeHtml(item.companyName)}</strong></td>
              <td>${escapeHtml(item.serviceType || '-')}</td>
              <td>${escapeHtml(item.description || '-')}</td>
              <td>${role === 'Planner' ? item.eventCount : item.userId}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}

async function renderPayments(root) {
  const payments = await API.PaymentsAPI.getAll();
  if (!payments.length) {
    root.innerHTML = emptyState('No payments have been recorded yet.');
    return;
  }

  root.innerHTML = `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Payment ID</th>
            <th>User ID</th>
            <th>Event ID</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          ${payments.map(item => `
            <tr>
              <td>#${item.paymentId}</td>
              <td>${item.userId}</td>
              <td>${item.eventId}</td>
              <td>${formatCurrency(item.amount || 0)}</td>
              <td>${paymentBadge(item.paymentStatus)}</td>
              <td>${formatDateTime(item.paymentDate)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}

async function renderBrowseEvents(root) {
  const events = await API.EventsAPI.getAll();
  if (!events.length) {
    root.innerHTML = emptyState('There are no published events available right now.');
    return;
  }

  root.innerHTML = `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Event</th>
            <th>Date</th>
            <th>Location</th>
            <th>Ticket Price</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${events.map(event => `
            <tr>
              <td><strong>${escapeHtml(event.title)}</strong></td>
              <td>${formatDate(event.eventDate)}</td>
              <td>${escapeHtml(event.location || '-')}</td>
              <td>${formatCurrency(event.ticketPrice || 0)}</td>
              <td>
                <button class="topbar-btn btn-primary" onclick="openPaymentModal(${event.eventId}, '${escapeJs(event.title)}', ${Number(event.ticketPrice || 0)})">
                  Register & Pay
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}

async function renderMyRegistrations(root) {
  const [registrations, events] = await Promise.all([API.RegistrationsAPI.getMine(), API.EventsAPI.getAll()]);
  const eventMap = Object.fromEntries(events.map(item => [item.eventId, item]));

  if (!registrations.length) {
    root.innerHTML = emptyState('You have not registered for any events yet.');
    return;
  }

  root.innerHTML = `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Event</th>
            <th>Date</th>
            <th>Ticket</th>
            <th>Payment Status</th>
            <th>Registered</th>
          </tr>
        </thead>
        <tbody>
          ${registrations.map(item => {
            const event = eventMap[item.eventId];
            return `
              <tr>
                <td><strong>${escapeHtml(event?.title || `Event #${item.eventId}`)}</strong></td>
                <td>${formatDate(event?.eventDate)}</td>
                <td>${escapeHtml(item.ticketType || 'Standard')}</td>
                <td>${paymentBadge(item.paymentStatus)}</td>
                <td>${formatDateTime(item.registeredAt)}</td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

async function renderMyPayments(root) {
  const [payments, events] = await Promise.all([API.PaymentsAPI.getMine(), API.EventsAPI.getAll()]);
  const eventMap = Object.fromEntries(events.map(item => [item.eventId, item]));

  if (!payments.length) {
    root.innerHTML = emptyState('You do not have any payments yet.');
    return;
  }

  root.innerHTML = `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Event</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          ${payments.map(item => `
            <tr>
              <td>#${item.paymentId}</td>
              <td>${escapeHtml(eventMap[item.eventId]?.title || `Event #${item.eventId}`)}</td>
              <td>${formatCurrency(item.amount || 0)}</td>
              <td>${paymentBadge(item.paymentStatus)}</td>
              <td>${formatDateTime(item.paymentDate)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}

function renderStaticPortal(root, id) {
  const copy = {
    'vendor-dashboard': 'Vendor dashboard data will appear here once vendor assignment feeds are connected.',
    'my-assignments': 'Vendor assignment history will appear here.',
    'vendor-profile': 'Vendor profile editing will appear here.',
    'provider-dashboard': 'Service provider dashboard data will appear here once provider feeds are connected.',
    'my-services': 'Assigned services will appear here.',
    'provider-profile': 'Service provider profile editing will appear here.'
  };

  root.innerHTML = emptyState(copy[id] || 'This view is not available yet.');
}

function statsGrid(items) {
  return `
    <div class="stats-grid">
      ${items.map(([label, value]) => `
        <div class="stat-card">
          <div class="stat-label">${label}</div>
          <div class="stat-value">${value}</div>
        </div>
      `).join('')}
    </div>`;
}

function plannerEventsTable(events) {
  if (!events.length) return emptyState('Create your first event to start working with vendors, providers, and attendees.');
  return `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Event</th>
            <th>Date</th>
            <th>Price</th>
            <th>Paid Attendees</th>
            <th>Vendors</th>
            <th>Providers</th>
          </tr>
        </thead>
        <tbody>
          ${events.map(event => `
            <tr>
              <td><strong>${escapeHtml(event.title)}</strong></td>
              <td>${formatDate(event.eventDate)}</td>
              <td>${formatCurrency(event.ticketPrice || 0)}</td>
              <td>${event.paidRegistrations}</td>
              <td>${event.vendorCount}</td>
              <td>${event.serviceProviderCount}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}

function adminOverviewTable(events) {
  if (!events.length) return emptyState('No events are available yet.');
  return `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Event</th>
            <th>Date</th>
            <th>Location</th>
            <th>Planner ID</th>
          </tr>
        </thead>
        <tbody>
          ${events.map(event => `
            <tr>
              <td><strong>${escapeHtml(event.title)}</strong></td>
              <td>${formatDate(event.eventDate)}</td>
              <td>${escapeHtml(event.location || '-')}</td>
              <td>${event.plannerId}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}

function paymentBadge(status) {
  const normalized = String(status || '').toLowerCase();
  const map = {
    completed: 'badge badge-green',
    paid: 'badge badge-green',
    pending: 'badge badge-gold',
    failed: 'badge badge-red'
  };
  const cls = map[normalized] || 'badge badge-gray';
  return `<span class="${cls}">${escapeHtml(status || 'Unknown')}</span>`;
}

function emptyState(message) {
  return `<div class="empty-state"><div class="empty-title">${escapeHtml(message)}</div></div>`;
}

function formatCurrency(value) {
  return `KES ${Number(value || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: '2-digit' });
}

function formatDateTime(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('en-KE', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeJs(value) {
  return String(value ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
