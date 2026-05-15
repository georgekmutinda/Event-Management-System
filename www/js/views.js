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
      case 'uploads':
        await renderUploads(root);
        break;
      case 'vendor-dashboard':
      case 'my-assignments':
      case 'vendor-profile':
      case 'provider-dashboard':
      case 'my-services':
      case 'provider-profile':
        await renderStaticPortal(root, id);
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

async function renderUploads(root) {
  window.uploadedFiles = window.uploadedFiles || [];
  const uploadedFiles = window.uploadedFiles;
  root.innerHTML = `
    <div class="section-header">
      <div class="section-title">Upload Event Assets</div>
    </div>
    <div class="form-row full">
      <div class="form-group" style="width:100%">
        <label>Choose a file</label>
        <input id="upload-file-input" class="form-control" type="file">
      </div>
    </div>
    <div class="form-actions" style="margin-top:20px">
      <button id="upload-file-button" class="topbar-btn btn-primary" onclick="handleUploadFile()">Upload File</button>
    </div>
    <div id="upload-feedback" style="margin-top:18px;display:none"></div>
    <div class="uploaded-files" style="margin-top:28px">
      ${uploadedFiles.length ? `<div class="section-subtitle">Recent uploads</div>` : '<div class="empty-state"><div class="empty-title">No uploads yet. Use the button above to send files to the API.</div></div>'}
      ${uploadedFiles.length ? `<div class="upload-list">${uploadedFiles.map(item => `
          <div class="upload-item">
            <a href="${item.url}" target="_blank" rel="noopener">${escapeHtml(item.fileName)}</a>
          </div>
        `).join('')}</div>` : ''}
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
  const [vendors, events] = await Promise.all([
    role === 'Planner' ? API.PlannerAPI.getVendors() : API.VendorsAPI.getAll(),
    ['Planner', 'Admin'].includes(role)
      ? (role === 'Planner' ? API.PlannerAPI.getEvents() : API.EventsAPI.getAll())
      : Promise.resolve([])
  ]);

  if (!vendors.length) {
    root.innerHTML = emptyState('No vendors are available yet.');
    return;
  }

  root.innerHTML = `
    <div class="vendor-card-grid">
      ${vendors.map(item => vendorCard(item, role, events)).join('')}
    </div>`;
}

async function renderServiceProviders(root) {
  const role = window.getCurrentRole();
  const [providers, events] = await Promise.all([
    role === 'Planner' ? API.PlannerAPI.getServiceProviders() : API.ServiceProvidersAPI.getAll(),
    ['Planner', 'Admin'].includes(role)
      ? (role === 'Planner' ? API.PlannerAPI.getEvents() : API.EventsAPI.getAll())
      : Promise.resolve([])
  ]);

  if (!providers.length) {
    root.innerHTML = emptyState('No service providers are available yet.');
    return;
  }

  root.innerHTML = `
    <div class="vendor-card-grid">
      ${providers.map(item => serviceProviderCard(item, role, events)).join('')}
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
  const role = window.getCurrentRole();
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
            <th>${['Vendor', 'ServiceProvider'].includes(role) ? 'Bid' : 'Action'}</th>
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
                ${eventActionButton(event, role)}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}

function eventActionButton(event, role) {
  if (role === 'Vendor') {
    return `<button class="topbar-btn btn-primary" onclick="handleVendorBid(${event.eventId}, '${escapeJs(event.title)}')">Bid</button>`;
  }

  if (role === 'ServiceProvider') {
    return `<button class="topbar-btn btn-primary" onclick="handleProviderBid(${event.eventId}, '${escapeJs(event.title)}')">Bid</button>`;
  }

  return `
    <button class="topbar-btn btn-primary" onclick="openPaymentModal(${event.eventId}, '${escapeJs(event.title)}', ${Number(event.ticketPrice || 0)})">
      Register & Pay
    </button>`;
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

async function renderStaticPortal(root, id) {
  switch (id) {
    case 'vendor-dashboard':
      await renderVendorDashboard(root);
      return;
    case 'my-assignments':
      await renderVendorAssignments(root);
      return;
    case 'vendor-profile':
      await renderVendorProfile(root);
      return;
    case 'provider-dashboard':
      await renderProviderDashboard(root);
      return;
    case 'my-services':
      await renderProviderServices(root);
      return;
    case 'provider-profile':
      await renderProviderProfile(root);
      return;
    default:
      root.innerHTML = emptyState('This view is not available yet.');
  }
}

async function renderVendorDashboard(root) {
  try {
    const data = await API.VendorPortalAPI.getDashboard();
    root.innerHTML = vendorDashboardLayout(data);
  } catch (error) {
    root.innerHTML = vendorDashboardLayout(defaultVendorDashboard(), error);
  }
}

async function renderVendorAssignments(root) {
  try {
    const assignments = await API.VendorPortalAPI.getAssignments();
    if (!assignments.length) {
      root.innerHTML = emptyState('No vendor assignments found.');
      return;
    }
    root.innerHTML = assignmentTable(assignments, 'vendor');
  } catch (error) {
    root.innerHTML = portalFallbackPanel('Event Assignments', 'No vendor assignments are available yet.', error);
  }
}

async function renderVendorProfile(root) {
  try {
    const profile = await API.VendorPortalAPI.getProfile();
    root.innerHTML = vendorAccountProfile(profile);
  } catch (error) {
    root.innerHTML = vendorProfileFallback(error);
  }
}

async function renderProviderDashboard(root) {
  try {
    const data = await API.ProviderPortalAPI.getDashboard();
    root.innerHTML = providerDashboardLayout(data);
  } catch (error) {
    root.innerHTML = providerDashboardLayout(defaultProviderDashboard(), error);
  }
}

async function renderProviderServices(root) {
  try {
    const services = await API.ProviderPortalAPI.getServices();
    if (!services.length) {
      root.innerHTML = emptyState('No assigned services found.');
      return;
    }
    root.innerHTML = assignmentTable(services, 'provider');
  } catch (error) {
    root.innerHTML = portalFallbackPanel('Assigned Services', 'No assigned services are available yet.', error);
  }
}

async function renderProviderProfile(root) {
  try {
    const profile = await API.ProviderPortalAPI.getProfile();
    root.innerHTML = providerAccountProfile(profile);
  } catch (error) {
    root.innerHTML = providerProfileFallback(error);
  }
}

function vendorDashboardLayout(data, error) {
  const assignments = data.recentAssignments || [];
  return `
    ${portalHero('Vendor Workspace', 'Track event assignments, planner requests, ratings, and recommendations.', error)}
    ${statsGrid([
      ['Assigned Events', data.assignedEvents || 0],
      ['Unique Events', data.uniqueEvents || 0],
      ['Approved', data.approvedAssignments || 0],
      ['Pending', data.pendingAssignments || 0]
    ])}
    <div class="section-header">
      <div class="section-title">Recent Vendor Assignments</div>
    </div>
    ${assignments.length ? assignmentTable(assignments, 'vendor') : portalFallbackPanel('No Assignments Yet', 'New event assignments will appear here as planners add you to events.')}`;
}

function providerDashboardLayout(data, error) {
  const services = data.recentServices || [];
  return `
    ${portalHero('Provider Workspace', 'Manage assigned services, planner requests, and upcoming event support.', error)}
    ${statsGrid([
      ['Assigned Services', data.assignedServices || 0],
      ['Unique Events', data.uniqueEvents || 0],
      ['Approved', data.approvedServices || 0],
      ['Pending', data.pendingServices || 0]
    ])}
    <div class="section-header">
      <div class="section-title">Recent Service Requests</div>
    </div>
    ${services.length ? assignmentTable(services, 'provider') : portalFallbackPanel('No Service Requests Yet', 'Assigned service requests will appear here as planners connect you to events.')}`;
}

function defaultVendorDashboard() {
  return {
    assignedEvents: 0,
    uniqueEvents: 0,
    approvedAssignments: 0,
    pendingAssignments: 0,
    recentAssignments: []
  };
}

function defaultProviderDashboard() {
  return {
    assignedServices: 0,
    uniqueEvents: 0,
    approvedServices: 0,
    pendingServices: 0,
    recentServices: []
  };
}

function portalHero(title, subtitle, error) {
  const notice = error ? `<div class="portal-note">${escapeHtml(portalErrorMessage(error))}</div>` : '';
  return `
    <div class="portal-hero">
      <div class="portal-hero-text">
        <div class="hero-title">${escapeHtml(title)}</div>
        <div class="hero-sub">${escapeHtml(subtitle)}</div>
        ${notice}
      </div>
    </div>`;
}

function portalFallbackPanel(title, message, error) {
  const detail = error ? `<div class="portal-note">${escapeHtml(portalErrorMessage(error))}</div>` : '';
  return `
    <div class="portal-empty-panel">
      <div class="section-title">${escapeHtml(title)}</div>
      <p>${escapeHtml(message)}</p>
      ${detail}
    </div>`;
}

function vendorProfileFallback(error) {
  const profile = {
    businessName: API.Auth.user?.fullName || 'Vendor Workspace',
    fullName: API.Auth.user?.fullName || 'Vendor Workspace',
    productType: 'General',
    email: API.Auth.user?.email || '-',
    assignedEventCount: 0,
    description: 'Vendor profile pending setup.',
    averageRating: 0,
    totalReviews: 0,
    recommendations: ''
  };

  return `${portalHero('Vendor Profile', 'Your profile is linked to your account details.', error)}${vendorAccountProfile(profile)}`;
}

function providerProfileFallback(error) {
  const profile = {
    companyName: API.Auth.user?.fullName || 'Service Provider Workspace',
    fullName: API.Auth.user?.fullName || 'Service Provider Workspace',
    serviceType: 'General',
    email: API.Auth.user?.email || '-',
    assignedServiceCount: 0,
    description: 'Service provider profile pending setup.'
  };

  return `${portalHero('Provider Profile', 'Your profile is linked to your account details.', error)}${providerAccountProfile(profile)}`;
}

function profileGrid(items) {
  return `
    <div class="profile-grid">
      ${items.map(([label, value]) => `
        <div class="profile-card">
          <div class="field-label">${escapeHtml(label)}</div>
          <div class="field-value">${escapeHtml(value)}</div>
        </div>
      `).join('')}
    </div>`;
}

function vendorAccountProfile(profile) {
  const displayName = profile.fullName || profile.businessName || API.Auth.user?.fullName || 'Vendor';
  return accountProfileLayout({
    role: 'vendor',
    title: 'Vendor Profile',
    displayName,
    subtitle: profile.email || 'No email on account',
    photoItem: { ...profile, businessName: displayName },
    photoInputId: 'vendor-profile-upload',
    metrics: [
      ['Account Name', displayName],
      ['Email Address', profile.email || '-'],
      ['Vendor Name', profile.businessName || displayName],
      ['Assigned Events', profile.assignedEventCount || 0]
    ],
    aside: `
      <div class="profile-side-card">
        <div class="field-label">Ratings</div>
        ${ratingSummary(profile)}
      </div>
      <div class="profile-side-card">
        <div class="field-label">Recommendations</div>
        ${recommendationsBlock(profile.recommendations)}
      </div>`
  });
}

function providerAccountProfile(profile) {
  const displayName = profile.fullName || profile.companyName || API.Auth.user?.fullName || 'Service Provider';
  return accountProfileLayout({
    role: 'provider',
    title: 'Provider Profile',
    displayName,
    subtitle: profile.email || 'No email on account',
    photoItem: { ...profile, businessName: displayName },
    photoInputId: 'provider-profile-upload',
    metrics: [
      ['Account Name', displayName],
      ['Email Address', profile.email || '-'],
      ['Provider Name', profile.companyName || displayName],
      ['Assigned Services', profile.assignedServiceCount || 0]
    ],
    aside: `
      <div class="profile-side-card">
        <div class="field-label">Service Type</div>
        <div class="field-value">${escapeHtml(profile.serviceType || 'General')}</div>
      </div>
      <div class="profile-side-card">
        <div class="field-label">About</div>
        <p>${escapeHtml(profile.description || 'No description available.')}</p>
      </div>`
  });
}

function accountProfileLayout({ role, title, displayName, subtitle, photoItem, photoInputId, metrics, aside }) {
  return `
    <div class="section-header">
      <div class="section-title">${escapeHtml(title)}</div>
    </div>
    <div class="account-profile-shell">
      <div class="account-profile-main">
        <div class="account-profile-hero">
          ${vendorPhoto(photoItem, 'vendor-profile-photo')}
          <div class="account-profile-copy">
            <div class="vendor-profile-name">${escapeHtml(displayName)}</div>
            <div class="vendor-profile-meta">${escapeHtml(subtitle)}</div>
          </div>
        </div>
        ${profileGrid(metrics)}
      </div>
      <div class="account-profile-side">
        <div class="profile-side-card">
          <div class="field-label">Profile Photo</div>
          <p>Upload a clear image for planners to recognize your account.</p>
          <input id="${photoInputId}" class="form-control" type="file" accept="image/*">
          <button id="${photoInputId}-button" class="topbar-btn btn-primary profile-upload-btn" onclick="handlePortalPhotoUpload('${role}', '${photoInputId}')">Upload Image</button>
        </div>
        ${aside}
      </div>
    </div>`;
}

function portalErrorMessage(error) {
  if (error?.status === 404 || String(error?.message || '').includes('404')) {
    return 'Portal API is not available in the running backend yet, so this workspace is showing an empty dashboard.';
  }

  return error?.message || 'Portal data is temporarily unavailable.';
}

function assignmentTable(items, type) {
  const isProvider = type === 'provider';
  return `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>${isProvider ? 'Service Request' : 'Event'}</th>
            <th>Date</th>
            <th>Location</th>
            <th>Status</th>
            <th>Planner</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td><strong>${escapeHtml(item.eventTitle)}</strong></td>
              <td>${formatDate(item.eventDate)}</td>
              <td>${escapeHtml(item.location || (item.serviceDetails || '-'))}</td>
              <td>${escapeHtml(item.status)}</td>
              <td>${escapeHtml(item.plannerName)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
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

function vendorCard(item, role, events = []) {
  const canContract = ['Planner', 'Admin'].includes(role);
  return `
    <div class="vendor-card">
      ${vendorPhoto(item, 'vendor-card-photo')}
      <div class="vendor-card-body">
        <div class="vendor-card-top">
          <div>
            <div class="vendor-card-title">${escapeHtml(item.businessName)}</div>
            <div class="vendor-card-meta">${escapeHtml(item.productType || 'General')}</div>
          </div>
          <span class="badge badge-gold">${role === 'Planner' ? `${item.eventCount || 0} events` : `User #${item.userId}`}</span>
        </div>
        ${ratingSummary(item)}
        <p class="vendor-card-description">${escapeHtml(item.description || 'No description available.')}</p>
        ${recommendationsBlock(item.recommendations)}
        <div class="vendor-card-actions">
          ${canContract ? marketplaceContractControls('vendor', item.vendorId, item.businessName, events) : ''}
          <button class="topbar-btn btn-ghost" onclick="handleRateVendor(${item.vendorId}, '${escapeJs(item.businessName)}')">Rate</button>
        </div>
      </div>
    </div>`;
}

function serviceProviderCard(item, role, events = []) {
  const canContract = ['Planner', 'Admin'].includes(role);
  const displayName = item.companyName || item.fullName || 'Service Provider';
  return `
    <div class="vendor-card">
      ${vendorPhoto({ ...item, businessName: displayName }, 'vendor-card-photo')}
      <div class="vendor-card-body">
        <div class="vendor-card-top">
          <div>
            <div class="vendor-card-title">${escapeHtml(displayName)}</div>
            <div class="vendor-card-meta">${escapeHtml(item.serviceType || 'General')}</div>
          </div>
          <span class="badge badge-gold">${role === 'Planner' ? `${item.eventCount || 0} events` : `User #${item.userId}`}</span>
        </div>
        <p class="vendor-card-description">${escapeHtml(item.description || 'No description available.')}</p>
        ${item.email ? `<div class="vendor-card-meta">${escapeHtml(item.email)}</div>` : ''}
        <div class="vendor-card-actions">
          ${canContract ? marketplaceContractControls('provider', item.providerId, displayName, events) : ''}
        </div>
      </div>
    </div>`;
}

function marketplaceContractControls(type, id, name, events) {
  if (!events.length) {
    return `<span class="vendor-card-meta">Create an event before contracting.</span>`;
  }

  const selectId = `${type}-contract-event-${id}`;
  return `
    <select id="${selectId}" class="marketplace-event-select" aria-label="Select event for ${escapeHtml(name)}">
      <option value="">Select event</option>
      ${events.map(event => `<option value="${event.eventId}">${escapeHtml(event.title)} - ${formatDate(event.eventDate)}</option>`).join('')}
    </select>
    <button class="topbar-btn btn-primary" onclick="handleContract${type === 'provider' ? 'Provider' : 'Vendor'}(${id}, '${escapeJs(name)}', '${selectId}')">Contract</button>`;
}

function vendorPhoto(item, className) {
  const src = item.photoUrl || item.photoURL || '';
  if (src) {
    return `<img class="${className}" src="${escapeHtml(src)}" alt="${escapeHtml(item.businessName || 'Vendor photo')}" loading="lazy">`;
  }

  const initials = String(item.businessName || 'Vendor')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || 'VD';

  return `<div class="${className} vendor-photo-fallback">${escapeHtml(initials)}</div>`;
}

function ratingSummary(item) {
  const rating = Number(item.averageRating || 0);
  const rounded = Math.round(rating);
  const stars = Array.from({ length: 5 }, (_, index) => index < rounded ? '&#9733;' : '&#9734;').join('');
  const count = Number(item.totalReviews || 0);
  return `<div class="vendor-rating"><span>${stars}</span><strong>${rating.toFixed(1)}</strong><em>${count} review${count === 1 ? '' : 's'}</em></div>`;
}

function recommendationsBlock(value) {
  const items = String(value || '')
    .split(/\n+/)
    .map(item => item.trim())
    .filter(Boolean)
    .slice(-3);

  if (!items.length) {
    return `<div class="vendor-recommendations muted">No recommendations yet.</div>`;
  }

  return `
    <div class="vendor-recommendations">
      ${items.map(item => `<div class="vendor-recommendation">${escapeHtml(item)}</div>`).join('')}
    </div>`;
}

window.handlePortalPhotoUpload = async function (role, inputId) {
  const input = document.getElementById(inputId);
  const button = document.getElementById(`${inputId}-button`);
  const file = input?.files?.[0];

  if (!file) {
    showToast('Choose an image first.');
    return;
  }

  try {
    if (button) {
      button.disabled = true;
      button.textContent = 'Uploading...';
    }

    const upload = await API.FilesAPI.upload(file);

    if (role === 'provider') {
      await API.ProviderPortalAPI.updatePhoto(upload.url);
      await window.loadViewData('provider-profile');
    } else {
      await API.VendorPortalAPI.updatePhoto(upload.url);
      await window.loadViewData('vendor-profile');
    }

    showToast('Profile photo updated.');
  } catch (err) {
    showToast(err.message || 'Unable to update profile photo.');
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = 'Upload Image';
    }
  }
};

window.handleContractVendor = async function (vendorId, vendorName, selectId) {
  const eventId = Number(document.getElementById(selectId)?.value || 0);
  if (!eventId) {
    showToast('Choose an event first.');
    return;
  }

  try {
    await API.EventVendorsAPI.create({ eventId, vendorId });
    showToast(`${vendorName} has been added to the event.`);
    refreshCurrentView();
  } catch (err) {
    showToast(err.message || 'Unable to contract vendor.');
  }
};

window.handleContractProvider = async function (providerId, providerName, selectId) {
  const eventId = Number(document.getElementById(selectId)?.value || 0);
  if (!eventId) {
    showToast('Choose an event first.');
    return;
  }

  try {
    await API.EventServicesAPI.create({
      eventId,
      providerId,
      serviceDetails: `Service request for ${providerName}`
    });
    showToast(`${providerName} has been added to the event.`);
    refreshCurrentView();
  } catch (err) {
    showToast(err.message || 'Unable to contract service provider.');
  }
};

window.handleVendorBid = async function (eventId, eventTitle) {
  try {
    await API.VendorPortalAPI.bid(eventId);
    showToast(`Bid submitted for ${eventTitle}.`);
    refreshCurrentView();
  } catch (err) {
    showToast(err.message || 'Unable to submit bid.');
  }
};

window.handleProviderBid = async function (eventId, eventTitle) {
  try {
    await API.ProviderPortalAPI.bid(eventId, `Bid for ${eventTitle}`);
    showToast(`Bid submitted for ${eventTitle}.`);
    refreshCurrentView();
  } catch (err) {
    showToast(err.message || 'Unable to submit bid.');
  }
};

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
