/* ═══════════════════════════════════════
   views.js — HTML Templates for each View
   Returns a template string for a given
   view id, or null if not found.
═══════════════════════════════════════ */

/**
 * Return the HTML template for the given view id.
 * @param {string} id - view key e.g. 'dashboard', 'vendors'
 * @returns {string|null}
 */
function getViewTemplate(id) {  // eslint-disable-line no-unused-vars
  const templates = {

    /* ══════════════ ADMIN PORTAL ══════════════ */

    dashboard: `
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-label">Total Events</div><div class="stat-value">48</div><div class="stat-sub">↑ 12% this month</div></div>
        <div class="stat-card"><div class="stat-label">Registrations</div><div class="stat-value">1,284</div><div class="stat-sub">↑ 8% vs last month</div></div>
        <div class="stat-card"><div class="stat-label">Active Vendors</div><div class="stat-value">37</div><div class="stat-sub">↑ 3 new this week</div></div>
        <div class="stat-card"><div class="stat-label">Revenue (KES)</div><div class="stat-value">2.4M</div><div class="stat-sub">↑ 18% vs last quarter</div></div>
      </div>
      <div class="section-header">
        <div class="section-title">Upcoming Events</div>
        <button class="topbar-btn btn-ghost" onclick="showView('events', null)">View All</button>
      </div>
      <div class="cards-grid">
        <div class="event-card"><div class="event-card-img"><div class="event-card-gradient g1"></div><div class="event-card-date">May 24, 2026</div></div><div class="event-card-body"><div class="event-card-name">Nairobi Tech Summit 2026</div><div class="event-card-meta">📍 KICC, Nairobi &nbsp;•&nbsp; 340 registered</div><div class="event-card-footer"><span class="badge badge-green">Published</span><button class="topbar-btn btn-ghost" style="padding:6px 14px;font-size:11px" onclick="showView('events',null)">Manage →</button></div></div></div>
        <div class="event-card"><div class="event-card-img"><div class="event-card-gradient g2"></div><div class="event-card-date">Jun 8, 2026</div></div><div class="event-card-body"><div class="event-card-name">Annual Gala Dinner</div><div class="event-card-meta">📍 Serena Hotel, Nairobi &nbsp;•&nbsp; 180 registered</div><div class="event-card-footer"><span class="badge badge-gold">Invite Only</span><button class="topbar-btn btn-ghost" style="padding:6px 14px;font-size:11px" onclick="showView('events',null)">Manage →</button></div></div></div>
        <div class="event-card"><div class="event-card-img"><div class="event-card-gradient g3"></div><div class="event-card-date">Jul 15, 2026</div></div><div class="event-card-body"><div class="event-card-name">East Africa Product Launch</div><div class="event-card-meta">📍 Radisson Blu, Nairobi &nbsp;•&nbsp; 92 registered</div><div class="event-card-footer"><span class="badge badge-blue">Draft</span><button class="topbar-btn btn-ghost" style="padding:6px 14px;font-size:11px" onclick="showView('events',null)">Manage →</button></div></div></div>
      </div>
      <div class="dash-two-col">
        <div>
          <div class="section-header"><div class="section-title">Recent Payments</div></div>
          <div class="table-wrap"><table class="data-table"><thead><tr><th>Event</th><th>Amount</th><th>Status</th></tr></thead><tbody>
            <tr><td>Tech Summit</td><td class="serif-num">KES 45,000</td><td><span class="badge badge-green">Paid</span></td></tr>
            <tr><td>Gala Dinner</td><td class="serif-num">KES 180,000</td><td><span class="badge badge-gold">Pending</span></td></tr>
            <tr><td>Product Launch</td><td class="serif-num">KES 22,500</td><td><span class="badge badge-green">Paid</span></td></tr>
          </tbody></table></div>
        </div>
        <div>
          <div class="section-header"><div class="section-title">Top Vendors</div></div>
          <div class="table-wrap"><table class="data-table"><thead><tr><th>Vendor</th><th>Category</th><th>Events</th></tr></thead><tbody>
            <tr><td>Bloom &amp; Co.</td><td><span class="badge badge-gray">Décor</span></td><td>12</td></tr>
            <tr><td>SoundWave Pro</td><td><span class="badge badge-gray">AV</span></td><td>9</td></tr>
            <tr><td>Cater Elite</td><td><span class="badge badge-gray">Catering</span></td><td>15</td></tr>
          </tbody></table></div>
        </div>
      </div>`,

    events: `
      <div class="section-header">
        <div class="section-title">All Events</div>
        <div style="display:flex;gap:10px">
          <select class="form-control" style="width:160px;padding:9px 14px;font-size:13px"><option>All Status</option><option>Published</option><option>Draft</option><option>Cancelled</option></select>
          <button class="topbar-btn btn-primary" onclick="openCreateModal()">+ New Event</button>
        </div>
      </div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Event Name</th><th>Date</th><th>Venue</th><th>Registrations</th><th>Status</th><th>Actions</th></tr></thead><tbody>
        <tr><td><strong>Nairobi Tech Summit 2026</strong></td><td>May 24, 2026</td><td>KICC, Nairobi</td><td>340 / 500</td><td><span class="badge badge-green">Published</span></td><td><button class="topbar-btn btn-ghost" style="padding:6px 14px;font-size:11px">Edit</button> <button class="btn-danger topbar-btn" onclick="confirmDelete('event')">Delete</button></td></tr>
        <tr><td><strong>Annual Gala Dinner</strong></td><td>Jun 8, 2026</td><td>Serena Hotel</td><td>180 / 200</td><td><span class="badge badge-gold">Invite Only</span></td><td><button class="topbar-btn btn-ghost" style="padding:6px 14px;font-size:11px">Edit</button> <button class="btn-danger topbar-btn" onclick="confirmDelete('event')">Delete</button></td></tr>
        <tr><td><strong>East Africa Product Launch</strong></td><td>Jul 15, 2026</td><td>Radisson Blu</td><td>92 / 300</td><td><span class="badge badge-blue">Draft</span></td><td><button class="topbar-btn btn-ghost" style="padding:6px 14px;font-size:11px">Edit</button> <button class="btn-danger topbar-btn" onclick="confirmDelete('event')">Delete</button></td></tr>
        <tr><td><strong>Wellness Retreat 2026</strong></td><td>Aug 3, 2026</td><td>Fairmont, Nakuru</td><td>55 / 120</td><td><span class="badge badge-blue">Draft</span></td><td><button class="topbar-btn btn-ghost" style="padding:6px 14px;font-size:11px">Edit</button> <button class="btn-danger topbar-btn" onclick="confirmDelete('event')">Delete</button></td></tr>
      </tbody></table></div>`,

    registrations: `
      <div class="section-header">
        <div class="section-title">Event Registrations</div>
        <button class="topbar-btn btn-primary" onclick="openCreateModal()">+ Register Attendee</button>
      </div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Attendee</th><th>Event</th><th>Registered On</th><th>Status</th><th>Actions</th></tr></thead><tbody>
        <tr><td>James Mwangi</td><td>Tech Summit 2026</td><td>Apr 10, 2026</td><td><span class="badge badge-green">Confirmed</span></td><td><button class="btn-danger topbar-btn" onclick="confirmDelete('registration')">Cancel</button></td></tr>
        <tr><td>Amina Ochieng</td><td>Annual Gala Dinner</td><td>Apr 12, 2026</td><td><span class="badge badge-green">Confirmed</span></td><td><button class="btn-danger topbar-btn" onclick="confirmDelete('registration')">Cancel</button></td></tr>
        <tr><td>Brian Kariuki</td><td>Tech Summit 2026</td><td>Apr 14, 2026</td><td><span class="badge badge-gold">Pending</span></td><td><button class="btn-danger topbar-btn" onclick="confirmDelete('registration')">Cancel</button></td></tr>
        <tr><td>Fatuma Hassan</td><td>Product Launch</td><td>Apr 15, 2026</td><td><span class="badge badge-green">Confirmed</span></td><td><button class="btn-danger topbar-btn" onclick="confirmDelete('registration')">Cancel</button></td></tr>
      </tbody></table></div>`,

    vendors: `
      <div class="vendor-category-header"><div class="vendor-cat-title">Vendor Directory</div><div class="vendor-cat-sub">Manage all registered vendors across your events</div></div>
      <div class="section-header">
        <div class="filter-pills">
          <span class="filter-pill active">All Categories</span><span class="filter-pill default">Catering</span><span class="filter-pill default">AV &amp; Tech</span><span class="filter-pill default">Décor</span><span class="filter-pill default">Photography</span>
        </div>
        <button class="topbar-btn btn-primary" onclick="openCreateModal()">+ Add Vendor</button>
      </div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Vendor Name</th><th>Category</th><th>Contact</th><th>Events</th><th>Status</th><th>Actions</th></tr></thead><tbody>
        <tr><td><strong>Bloom &amp; Co. Events</strong></td><td><span class="badge badge-gray">Décor</span></td><td>bloom@events.ke</td><td>12</td><td><span class="badge badge-green">Active</span></td><td><button class="topbar-btn btn-ghost" style="padding:6px 14px;font-size:11px">Edit</button> <button class="btn-danger topbar-btn" onclick="confirmDelete('vendor')">Delete</button></td></tr>
        <tr><td><strong>SoundWave Pro</strong></td><td><span class="badge badge-gray">AV &amp; Tech</span></td><td>info@soundwave.ke</td><td>9</td><td><span class="badge badge-green">Active</span></td><td><button class="topbar-btn btn-ghost" style="padding:6px 14px;font-size:11px">Edit</button> <button class="btn-danger topbar-btn" onclick="confirmDelete('vendor')">Delete</button></td></tr>
        <tr><td><strong>Cater Elite Kenya</strong></td><td><span class="badge badge-gray">Catering</span></td><td>cater@elite.ke</td><td>15</td><td><span class="badge badge-green">Active</span></td><td><button class="topbar-btn btn-ghost" style="padding:6px 14px;font-size:11px">Edit</button> <button class="btn-danger topbar-btn" onclick="confirmDelete('vendor')">Delete</button></td></tr>
        <tr><td><strong>Lensa Studios</strong></td><td><span class="badge badge-gray">Photography</span></td><td>lensa@studios.ke</td><td>6</td><td><span class="badge badge-gold">Review</span></td><td><button class="topbar-btn btn-ghost" style="padding:6px 14px;font-size:11px">Edit</button> <button class="btn-danger topbar-btn" onclick="confirmDelete('vendor')">Delete</button></td></tr>
      </tbody></table></div>`,

    'event-vendors': `
      <div class="vendor-category-header"><div class="vendor-cat-title">Event–Vendor Links</div><div class="vendor-cat-sub">Assign vendors to specific events</div></div>
      <div class="section-header"><div class="section-title">Active Assignments</div><button class="topbar-btn btn-primary" onclick="openCreateModal()">+ Link Vendor to Event</button></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Event</th><th>Vendor</th><th>Role</th><th>Confirmed</th><th>Actions</th></tr></thead><tbody>
        <tr><td>Tech Summit 2026</td><td>SoundWave Pro</td><td>Main AV</td><td><span class="badge badge-green">Yes</span></td><td><button class="btn-danger topbar-btn" onclick="confirmDelete('link')">Remove</button></td></tr>
        <tr><td>Annual Gala Dinner</td><td>Bloom &amp; Co.</td><td>Floral Décor</td><td><span class="badge badge-green">Yes</span></td><td><button class="btn-danger topbar-btn" onclick="confirmDelete('link')">Remove</button></td></tr>
        <tr><td>Annual Gala Dinner</td><td>Cater Elite</td><td>Catering</td><td><span class="badge badge-gold">Pending</span></td><td><button class="btn-danger topbar-btn" onclick="confirmDelete('link')">Remove</button></td></tr>
        <tr><td>Product Launch</td><td>Lensa Studios</td><td>Photography</td><td><span class="badge badge-blue">Invited</span></td><td><button class="btn-danger topbar-btn" onclick="confirmDelete('link')">Remove</button></td></tr>
      </tbody></table></div>`,

    'service-providers': `
      <div class="section-header"><div class="section-title">Service Providers</div><button class="topbar-btn btn-primary" onclick="openCreateModal()">+ Add Provider</button></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Provider</th><th>Service Type</th><th>Contact</th><th>Rating</th><th>Status</th><th>Actions</th></tr></thead><tbody>
        <tr><td><strong>EventGuard Security</strong></td><td>Security</td><td>guard@eventguard.ke</td><td>★★★★★</td><td><span class="badge badge-green">Active</span></td><td><button class="topbar-btn btn-ghost" style="padding:6px 14px;font-size:11px">Edit</button> <button class="btn-danger topbar-btn" onclick="confirmDelete('provider')">Delete</button></td></tr>
        <tr><td><strong>TransEA Logistics</strong></td><td>Transport</td><td>ops@transea.ke</td><td>★★★★☆</td><td><span class="badge badge-green">Active</span></td><td><button class="topbar-btn btn-ghost" style="padding:6px 14px;font-size:11px">Edit</button> <button class="btn-danger topbar-btn" onclick="confirmDelete('provider')">Delete</button></td></tr>
        <tr><td><strong>CleanPro Kenya</strong></td><td>Cleaning</td><td>clean@pro.ke</td><td>★★★☆☆</td><td><span class="badge badge-gold">Review</span></td><td><button class="topbar-btn btn-ghost" style="padding:6px 14px;font-size:11px">Edit</button> <button class="btn-danger topbar-btn" onclick="confirmDelete('provider')">Delete</button></td></tr>
        <tr><td><strong>Stellar Lighting</strong></td><td>Lighting</td><td>light@stellar.ke</td><td>★★★★☆</td><td><span class="badge badge-green">Active</span></td><td><button class="topbar-btn btn-ghost" style="padding:6px 14px;font-size:11px">Edit</button> <button class="btn-danger topbar-btn" onclick="confirmDelete('provider')">Delete</button></td></tr>
      </tbody></table></div>`,

    'event-services': `
      <div class="section-header"><div class="section-title">Event Service Assignments</div><button class="topbar-btn btn-primary" onclick="openCreateModal()">+ Link Service to Event</button></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Event</th><th>Service Provider</th><th>Service</th><th>Cost (KES)</th><th>Actions</th></tr></thead><tbody>
        <tr><td>Tech Summit 2026</td><td>EventGuard Security</td><td>Security</td><td class="serif-num">25,000</td><td><button class="btn-danger topbar-btn" onclick="confirmDelete('service')">Remove</button></td></tr>
        <tr><td>Annual Gala Dinner</td><td>TransEA Logistics</td><td>Transport</td><td class="serif-num">40,000</td><td><button class="btn-danger topbar-btn" onclick="confirmDelete('service')">Remove</button></td></tr>
        <tr><td>Product Launch</td><td>CleanPro Kenya</td><td>Cleaning</td><td class="serif-num">8,500</td><td><button class="btn-danger topbar-btn" onclick="confirmDelete('service')">Remove</button></td></tr>
        <tr><td>Wellness Retreat</td><td>Stellar Lighting</td><td>Lighting</td><td class="serif-num">32,000</td><td><button class="btn-danger topbar-btn" onclick="confirmDelete('service')">Remove</button></td></tr>
      </tbody></table></div>`,

    payments: `
      <div class="payment-summary">
        <div class="pay-label">Total Revenue — April 2026</div>
        <div class="pay-amount">KES 2,430,000</div>
        <div class="pay-stats">
          <div><div class="pay-stat-label">Paid</div><div class="pay-stat-paid">KES 1,980,000</div></div>
          <div><div class="pay-stat-label">Pending</div><div class="pay-stat-pending">KES 450,000</div></div>
        </div>
      </div>
      <div class="section-header"><div class="section-title">Payment Records</div><button class="topbar-btn btn-primary" onclick="openCreateModal()">+ Record Payment</button></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Payment ID</th><th>Event</th><th>Payer</th><th>Amount (KES)</th><th>Method</th><th>Status</th><th>Action</th></tr></thead><tbody>
        <tr><td class="mono">#PAY-0041</td><td>Tech Summit 2026</td><td>James Mwangi</td><td class="serif-num">45,000</td><td>M-Pesa</td><td><span class="badge badge-green">Paid</span></td><td>—</td></tr>
        <tr><td class="mono">#PAY-0042</td><td>Annual Gala Dinner</td><td>Amina Ochieng</td><td class="serif-num">180,000</td><td>Bank Transfer</td><td><span class="badge badge-gold">Pending</span></td><td><button class="topbar-btn btn-ghost" style="padding:5px 12px;font-size:11px" onclick="openPaymentModal('Annual Gala Dinner','KES 180,000')">Retry</button></td></tr>
        <tr><td class="mono">#PAY-0043</td><td>Product Launch</td><td>TechCorp Ltd.</td><td class="serif-num">22,500</td><td>Card</td><td><span class="badge badge-green">Paid</span></td><td>—</td></tr>
        <tr><td class="mono">#PAY-0044</td><td>Wellness Retreat</td><td>Brian Kariuki</td><td class="serif-num">12,000</td><td>M-Pesa</td><td><span class="badge badge-red">Failed</span></td><td><button class="topbar-btn btn-ghost" style="padding:5px 12px;font-size:11px" onclick="openPaymentModal('Wellness Retreat','KES 12,000')">Retry</button></td></tr>
      </tbody></table></div>`,

    users: `
      <div class="section-header"><div class="section-title">System Users</div><button class="topbar-btn btn-primary" onclick="openCreateModal()">+ Invite User</button></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>User</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead><tbody>
        <tr><td><div style="display:flex;align-items:center;gap:10px"><div class="user-avatar-sm avatar-gold">AR</div>Alexandra R.</div></td><td>a.r@eventara.ke</td><td><span class="badge badge-gold">Admin</span></td><td>Jan 2025</td><td><span class="badge badge-green">Active</span></td><td><button class="topbar-btn btn-ghost" style="padding:6px 14px;font-size:11px">Edit</button> <button class="btn-danger topbar-btn" onclick="confirmDelete('user')">Delete</button></td></tr>
        <tr><td><div style="display:flex;align-items:center;gap:10px"><div class="user-avatar-sm avatar-blue">JM</div>James Mwangi</div></td><td>j.mwangi@eventara.ke</td><td><span class="badge badge-blue">Organiser</span></td><td>Mar 2025</td><td><span class="badge badge-green">Active</span></td><td><button class="topbar-btn btn-ghost" style="padding:6px 14px;font-size:11px">Edit</button> <button class="btn-danger topbar-btn" onclick="confirmDelete('user')">Delete</button></td></tr>
        <tr><td><div style="display:flex;align-items:center;gap:10px"><div class="user-avatar-sm avatar-green">AO</div>Amina Ochieng</div></td><td>a.ochieng@bloom.ke</td><td><span class="badge badge-gray">Vendor</span></td><td>Feb 2026</td><td><span class="badge badge-green">Active</span></td><td><button class="topbar-btn btn-ghost" style="padding:6px 14px;font-size:11px">Edit</button> <button class="btn-danger topbar-btn" onclick="confirmDelete('user')">Delete</button></td></tr>
        <tr><td><div style="display:flex;align-items:center;gap:10px"><div class="user-avatar-sm avatar-pink">FH</div>Fatuma Hassan</div></td><td>f.hassan@transea.ke</td><td><span class="badge badge-gray">Provider</span></td><td>Apr 2026</td><td><span class="badge badge-gold">Invited</span></td><td><button class="topbar-btn btn-ghost" style="padding:6px 14px;font-size:11px">Edit</button> <button class="btn-danger topbar-btn" onclick="confirmDelete('user')">Delete</button></td></tr>
      </tbody></table></div>`,

    roles: `
      <div class="section-header"><div class="section-title">Roles &amp; Permissions</div><button class="topbar-btn btn-primary" onclick="openCreateModal()">+ Create Role</button></div>
      <div class="cards-grid">
        <div class="role-card"><div class="role-card-header"><span class="badge badge-gold" style="font-size:13px;padding:5px 14px">Administrator</span><button class="btn-danger topbar-btn" onclick="confirmDelete('role')">Delete</button></div><div class="role-card-perms">Full system access · Manage users · View all reports · Configure platform settings</div></div>
        <div class="role-card"><div class="role-card-header"><span class="badge badge-blue" style="font-size:13px;padding:5px 14px">Event Organiser</span><button class="btn-danger topbar-btn" onclick="confirmDelete('role')">Delete</button></div><div class="role-card-perms">Create &amp; manage events · View registrations · Assign vendors &amp; services</div></div>
        <div class="role-card"><div class="role-card-header"><span class="badge badge-gray" style="font-size:13px;padding:5px 14px">Vendor</span><button class="btn-danger topbar-btn" onclick="confirmDelete('role')">Delete</button></div><div class="role-card-perms">View assigned events · Update vendor profile · Submit invoices &amp; quotes</div></div>
        <div class="role-card"><div class="role-card-header"><span class="badge badge-green" style="font-size:13px;padding:5px 14px">Service Provider</span><button class="btn-danger topbar-btn" onclick="confirmDelete('role')">Delete</button></div><div class="role-card-perms">View assigned services · Update provider profile · Track service payments</div></div>
      </div>`,

    /* ══════════════ USER PORTAL ══════════════ */

    'user-dashboard': `
      <div class="portal-hero">
        <div class="portal-hero-text">
          <div class="hero-title">Welcome back, James 👋</div>
          <div class="hero-sub">You have 2 upcoming events and 1 pending payment.</div>
        </div>
        <div class="portal-hero-actions">
          <button class="topbar-btn btn-primary" onclick="showView('browse-events', null)">Browse Events</button>
          <button class="topbar-btn btn-ghost" onclick="openPaymentModal('Annual Gala Dinner','KES 15,000')">Pay Now</button>
        </div>
      </div>
      <div class="stats-grid" style="grid-template-columns:repeat(3,1fr)">
        <div class="stat-card"><div class="stat-label">Events Registered</div><div class="stat-value">4</div><div class="stat-sub">2 upcoming</div></div>
        <div class="stat-card"><div class="stat-label">Total Paid (KES)</div><div class="stat-value">57K</div><div class="stat-sub">↑ verified</div></div>
        <div class="stat-card"><div class="stat-label">Pending Payment</div><div class="stat-value">1</div><div class="stat-sub" style="color:var(--gold)">Action required</div></div>
      </div>
      <div class="section-header"><div class="section-title">My Upcoming Events</div><button class="topbar-btn btn-ghost" onclick="showView('my-registrations', null)">All Registrations</button></div>
      <div class="cards-grid">
        <div class="event-card"><div class="event-card-img"><div class="event-card-gradient g1"></div><div class="event-card-date">May 24, 2026</div></div><div class="event-card-body"><div class="event-card-name">Nairobi Tech Summit 2026</div><div class="event-card-meta">📍 KICC, Nairobi &nbsp;•&nbsp; General Admission</div><div class="event-card-footer"><span class="badge badge-green">Confirmed</span><button class="topbar-btn btn-ghost" style="padding:6px 14px;font-size:11px">Details →</button></div></div></div>
        <div class="event-card"><div class="event-card-img"><div class="event-card-gradient g2"></div><div class="event-card-date">Jun 8, 2026</div></div><div class="event-card-body"><div class="event-card-name">Annual Gala Dinner</div><div class="event-card-meta">📍 Serena Hotel &nbsp;•&nbsp; VIP Table</div><div class="event-card-footer"><span class="badge badge-gold">Payment Due</span><button class="topbar-btn btn-ghost" style="padding:6px 14px;font-size:11px" onclick="openPaymentModal('Annual Gala Dinner','KES 15,000')">Pay →</button></div></div></div>
      </div>`,

    'browse-events': `
      <div class="section-header">
        <div class="section-title">Available Events</div>
        <select class="form-control" style="width:160px;padding:9px 14px;font-size:13px"><option>All Events</option><option>Free</option><option>Paid</option></select>
      </div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Event</th><th>Date</th><th>Venue</th><th>Tickets Left</th><th>Price (KES)</th><th>Action</th></tr></thead><tbody>
        <tr><td><strong>Nairobi Tech Summit 2026</strong></td><td>May 24, 2026</td><td>KICC, Nairobi</td><td>160</td><td class="serif-num">4,500</td><td><button class="topbar-btn btn-primary" style="padding:6px 14px;font-size:11px" onclick="openPaymentModal('Nairobi Tech Summit 2026','KES 4,500')">Register &amp; Pay</button></td></tr>
        <tr><td><strong>Annual Gala Dinner</strong></td><td>Jun 8, 2026</td><td>Serena Hotel</td><td>20</td><td class="serif-num">15,000</td><td><button class="topbar-btn btn-primary" style="padding:6px 14px;font-size:11px" onclick="openPaymentModal('Annual Gala Dinner','KES 15,000')">Register &amp; Pay</button></td></tr>
        <tr><td><strong>East Africa Product Launch</strong></td><td>Jul 15, 2026</td><td>Radisson Blu</td><td>208</td><td class="serif-num">2,500</td><td><button class="topbar-btn btn-primary" style="padding:6px 14px;font-size:11px" onclick="openPaymentModal('East Africa Product Launch','KES 2,500')">Register &amp; Pay</button></td></tr>
        <tr><td><strong>Wellness Retreat 2026</strong></td><td>Aug 3, 2026</td><td>Fairmont, Nakuru</td><td>65</td><td class="serif-num">8,000</td><td><button class="topbar-btn btn-primary" style="padding:6px 14px;font-size:11px" onclick="openPaymentModal('Wellness Retreat 2026','KES 8,000')">Register &amp; Pay</button></td></tr>
      </tbody></table></div>`,

    'my-registrations': `
      <div class="section-header"><div class="section-title">My Registrations</div></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Event</th><th>Date</th><th>Ticket Type</th><th>Payment</th><th>Status</th><th>Action</th></tr></thead><tbody>
        <tr><td><strong>Nairobi Tech Summit 2026</strong></td><td>May 24, 2026</td><td>General</td><td class="serif-num">KES 4,500</td><td><span class="badge badge-green">Confirmed</span></td><td><button class="topbar-btn btn-ghost" style="padding:5px 12px;font-size:11px">Download Ticket</button></td></tr>
        <tr><td><strong>Annual Gala Dinner</strong></td><td>Jun 8, 2026</td><td>VIP</td><td class="serif-num">KES 15,000</td><td><span class="badge badge-gold">Payment Due</span></td><td><button class="topbar-btn btn-primary" style="padding:5px 12px;font-size:11px" onclick="openPaymentModal('Annual Gala Dinner','KES 15,000')">Pay Now</button></td></tr>
        <tr><td><strong>Wellness Summit 2025</strong></td><td>Nov 10, 2025</td><td>General</td><td class="serif-num">KES 3,500</td><td><span class="badge badge-gray">Attended</span></td><td>—</td></tr>
      </tbody></table></div>`,

    'my-payments': `
      <div class="payment-summary">
        <div class="pay-label">My Payment Activity</div>
        <div class="pay-amount">KES 57,000</div>
        <div class="pay-stats">
          <div><div class="pay-stat-label">Paid</div><div class="pay-stat-paid">KES 42,000</div></div>
          <div><div class="pay-stat-label">Pending</div><div class="pay-stat-pending">KES 15,000</div></div>
        </div>
      </div>
      <div class="section-header"><div class="section-title">Transaction History</div><button class="topbar-btn btn-primary" onclick="openPaymentModal('Annual Gala Dinner','KES 15,000')">+ Make Payment</button></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>ID</th><th>Event</th><th>Amount</th><th>Method</th><th>Date</th><th>Status</th></tr></thead><tbody>
        <tr><td class="mono">#PAY-0041</td><td>Tech Summit 2026</td><td class="serif-num">KES 4,500</td><td>M-Pesa</td><td>Apr 10, 2026</td><td><span class="badge badge-green">Paid</span></td></tr>
        <tr><td class="mono">#PAY-0042</td><td>Annual Gala Dinner</td><td class="serif-num">KES 15,000</td><td>—</td><td>—</td><td><span class="badge badge-gold">Pending</span></td></tr>
        <tr><td class="mono">#PAY-0039</td><td>Wellness Summit 2025</td><td class="serif-num">KES 3,500</td><td>Card</td><td>Oct 12, 2025</td><td><span class="badge badge-green">Paid</span></td></tr>
      </tbody></table></div>`,

    'make-payment': `
      <div style="max-width:520px;margin:0 auto">
        <div class="section-header"><div class="section-title">Make a Payment</div></div>
        <div class="auth-field">
          <label>Select Event</label>
          <select class="form-control" id="pay-event-select">
            <option value="Nairobi Tech Summit 2026|KES 4,500">Nairobi Tech Summit 2026 — KES 4,500</option>
            <option value="Annual Gala Dinner|KES 15,000">Annual Gala Dinner — KES 15,000</option>
            <option value="Wellness Retreat 2026|KES 8,000">Wellness Retreat 2026 — KES 8,000</option>
          </select>
        </div>
        <button class="pay-btn" onclick="(function(){const s=document.getElementById('pay-event-select').value.split('|');openPaymentModal(s[0],s[1])})()">Continue to Payment</button>
      </div>`,

    /* ══════════════ VENDOR PORTAL ══════════════ */

    'vendor-dashboard': `
      <div class="portal-hero">
        <div class="portal-hero-text">
          <div class="hero-title">Bloom &amp; Co. Events 🌸</div>
          <div class="hero-sub">You have 3 active event assignments and 1 pending invoice.</div>
        </div>
        <div class="portal-hero-actions">
          <button class="topbar-btn btn-primary" onclick="openCreateModal()">+ Submit Quote</button>
        </div>
      </div>
      <div class="stats-grid" style="grid-template-columns:repeat(3,1fr)">
        <div class="stat-card"><div class="stat-label">Active Assignments</div><div class="stat-value">3</div><div class="stat-sub">↑ 1 this week</div></div>
        <div class="stat-card"><div class="stat-label">Earned (KES)</div><div class="stat-value">180K</div><div class="stat-sub">This quarter</div></div>
        <div class="stat-card"><div class="stat-label">Pending Invoice</div><div class="stat-value">1</div><div class="stat-sub" style="color:var(--gold)">Awaiting approval</div></div>
      </div>
      <div class="section-header"><div class="section-title">Current Assignments</div></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Event</th><th>Role</th><th>Date</th><th>Fee (KES)</th><th>Status</th></tr></thead><tbody>
        <tr><td>Annual Gala Dinner</td><td>Floral Décor</td><td>Jun 8, 2026</td><td class="serif-num">85,000</td><td><span class="badge badge-green">Confirmed</span></td></tr>
        <tr><td>Tech Summit 2026</td><td>Stage Décor</td><td>May 24, 2026</td><td class="serif-num">42,000</td><td><span class="badge badge-green">Confirmed</span></td></tr>
        <tr><td>Wellness Retreat 2026</td><td>Themed Décor</td><td>Aug 3, 2026</td><td class="serif-num">55,000</td><td><span class="badge badge-gold">Pending</span></td></tr>
      </tbody></table></div>`,

    'my-assignments': `
      <div class="section-header"><div class="section-title">All Event Assignments</div></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Event</th><th>Organizer</th><th>Role</th><th>Date</th><th>Fee (KES)</th><th>Status</th></tr></thead><tbody>
        <tr><td><strong>Annual Gala Dinner</strong></td><td>Eventara</td><td>Floral Décor</td><td>Jun 8, 2026</td><td class="serif-num">85,000</td><td><span class="badge badge-green">Confirmed</span></td></tr>
        <tr><td><strong>Tech Summit 2026</strong></td><td>Eventara</td><td>Stage Décor</td><td>May 24, 2026</td><td class="serif-num">42,000</td><td><span class="badge badge-green">Confirmed</span></td></tr>
        <tr><td><strong>Wellness Retreat 2026</strong></td><td>Eventara</td><td>Themed Décor</td><td>Aug 3, 2026</td><td class="serif-num">55,000</td><td><span class="badge badge-gold">Pending</span></td></tr>
        <tr><td><strong>Wellness Summit 2025</strong></td><td>Eventara</td><td>Entrance Décor</td><td>Nov 10, 2025</td><td class="serif-num">28,000</td><td><span class="badge badge-gray">Completed</span></td></tr>
      </tbody></table></div>`,

    'vendor-profile': `
      <div class="section-header"><div class="section-title">Vendor Profile</div><button class="topbar-btn btn-primary">Save Changes</button></div>
      <div style="max-width:580px">
        <div class="info-card">
          <div class="info-card-title">Business Information</div>
          <div class="form-row"><div class="form-group"><label>Business Name</label><input class="form-control" value="Bloom &amp; Co. Events"></div><div class="form-group"><label>Category</label><select class="form-control"><option selected>Décor</option><option>Catering</option><option>AV &amp; Tech</option></select></div></div>
          <div class="form-row"><div class="form-group"><label>Email</label><input class="form-control" type="email" value="bloom@events.ke"></div><div class="form-group"><label>Phone</label><input class="form-control" value="+254 712 000 001"></div></div>
          <div class="form-row full"><div class="form-group"><label>Bio / Description</label><textarea class="form-control" rows="3">We provide premium floral and event décor services across Kenya.</textarea></div></div>
        </div>
      </div>`,

    'vendor-invoices': `
      <div class="section-header"><div class="section-title">Invoices &amp; Quotes</div><button class="topbar-btn btn-primary" onclick="openCreateModal()">+ New Invoice</button></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Invoice ID</th><th>Event</th><th>Amount (KES)</th><th>Issued</th><th>Due</th><th>Status</th></tr></thead><tbody>
        <tr><td class="mono">#INV-001</td><td>Annual Gala Dinner</td><td class="serif-num">85,000</td><td>Apr 20, 2026</td><td>May 20, 2026</td><td><span class="badge badge-gold">Pending</span></td></tr>
        <tr><td class="mono">#INV-002</td><td>Tech Summit 2026</td><td class="serif-num">42,000</td><td>Apr 15, 2026</td><td>May 15, 2026</td><td><span class="badge badge-green">Paid</span></td></tr>
        <tr><td class="mono">#INV-003</td><td>Wellness Summit 2025</td><td class="serif-num">28,000</td><td>Oct 20, 2025</td><td>Nov 20, 2025</td><td><span class="badge badge-green">Paid</span></td></tr>
      </tbody></table></div>`,

    'vendor-payments': `
      <div class="payment-summary">
        <div class="pay-label">Vendor Earnings — 2026</div>
        <div class="pay-amount">KES 182,000</div>
        <div class="pay-stats">
          <div><div class="pay-stat-label">Received</div><div class="pay-stat-paid">KES 97,000</div></div>
          <div><div class="pay-stat-label">Outstanding</div><div class="pay-stat-pending">KES 85,000</div></div>
        </div>
      </div>
      <div class="section-header"><div class="section-title">Payment History</div></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Invoice</th><th>Event</th><th>Amount (KES)</th><th>Paid On</th><th>Method</th><th>Status</th></tr></thead><tbody>
        <tr><td class="mono">#INV-002</td><td>Tech Summit 2026</td><td class="serif-num">42,000</td><td>Apr 30, 2026</td><td>Bank Transfer</td><td><span class="badge badge-green">Received</span></td></tr>
        <tr><td class="mono">#INV-003</td><td>Wellness Summit 2025</td><td class="serif-num">28,000</td><td>Nov 22, 2025</td><td>Bank Transfer</td><td><span class="badge badge-green">Received</span></td></tr>
        <tr><td class="mono">#INV-001</td><td>Annual Gala Dinner</td><td class="serif-num">85,000</td><td>—</td><td>—</td><td><span class="badge badge-gold">Pending</span></td></tr>
      </tbody></table></div>`,

    /* ══════════════ SERVICE PROVIDER PORTAL ══════════════ */

    'provider-dashboard': `
      <div class="portal-hero">
        <div class="portal-hero-text">
          <div class="hero-title">TransEA Logistics 🚚</div>
          <div class="hero-sub">You have 2 active service assignments this month.</div>
        </div>
        <div class="portal-hero-actions">
          <button class="topbar-btn btn-primary" onclick="showView('my-services', null)">View Services</button>
        </div>
      </div>
      <div class="stats-grid" style="grid-template-columns:repeat(3,1fr)">
        <div class="stat-card"><div class="stat-label">Active Services</div><div class="stat-value">2</div><div class="stat-sub">This month</div></div>
        <div class="stat-card"><div class="stat-label">Earned (KES)</div><div class="stat-value">95K</div><div class="stat-sub">This quarter</div></div>
        <div class="stat-card"><div class="stat-label">Rating</div><div class="stat-value">4.2</div><div class="stat-sub">★★★★☆</div></div>
      </div>
      <div class="section-header"><div class="section-title">Current Service Assignments</div></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Event</th><th>Service</th><th>Date</th><th>Fee (KES)</th><th>Status</th></tr></thead><tbody>
        <tr><td>Annual Gala Dinner</td><td>Transport</td><td>Jun 8, 2026</td><td class="serif-num">40,000</td><td><span class="badge badge-green">Confirmed</span></td></tr>
        <tr><td>Wellness Retreat 2026</td><td>Shuttle Service</td><td>Aug 3, 2026</td><td class="serif-num">55,000</td><td><span class="badge badge-gold">Pending</span></td></tr>
      </tbody></table></div>`,

    'my-services': `
      <div class="section-header"><div class="section-title">All Assigned Services</div></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Event</th><th>Organizer</th><th>Service</th><th>Date</th><th>Fee (KES)</th><th>Status</th></tr></thead><tbody>
        <tr><td><strong>Annual Gala Dinner</strong></td><td>Eventara</td><td>Transport &amp; Shuttle</td><td>Jun 8, 2026</td><td class="serif-num">40,000</td><td><span class="badge badge-green">Confirmed</span></td></tr>
        <tr><td><strong>Wellness Retreat 2026</strong></td><td>Eventara</td><td>Shuttle Service</td><td>Aug 3, 2026</td><td class="serif-num">55,000</td><td><span class="badge badge-gold">Pending</span></td></tr>
        <tr><td><strong>Tech Summit 2025</strong></td><td>Eventara</td><td>Delegate Transport</td><td>Nov 15, 2025</td><td class="serif-num">32,000</td><td><span class="badge badge-gray">Completed</span></td></tr>
      </tbody></table></div>`,

    'provider-profile': `
      <div class="section-header"><div class="section-title">Provider Profile</div><button class="topbar-btn btn-primary">Save Changes</button></div>
      <div style="max-width:580px">
        <div class="info-card">
          <div class="info-card-title">Business Information</div>
          <div class="form-row"><div class="form-group"><label>Business Name</label><input class="form-control" value="TransEA Logistics"></div><div class="form-group"><label>Service Type</label><select class="form-control"><option selected>Transport</option><option>Security</option><option>Cleaning</option><option>Lighting</option></select></div></div>
          <div class="form-row"><div class="form-group"><label>Email</label><input class="form-control" type="email" value="ops@transea.ke"></div><div class="form-group"><label>Phone</label><input class="form-control" value="+254 720 000 002"></div></div>
          <div class="form-row full"><div class="form-group"><label>Bio / Description</label><textarea class="form-control" rows="3">We offer premium event logistics, shuttle, and transport services across East Africa.</textarea></div></div>
        </div>
      </div>`,

    'service-payments': `
      <div class="payment-summary">
        <div class="pay-label">Provider Earnings — 2026</div>
        <div class="pay-amount">KES 127,000</div>
        <div class="pay-stats">
          <div><div class="pay-stat-label">Received</div><div class="pay-stat-paid">KES 72,000</div></div>
          <div><div class="pay-stat-label">Outstanding</div><div class="pay-stat-pending">KES 55,000</div></div>
        </div>
      </div>
      <div class="section-header"><div class="section-title">Payment Records</div></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Event</th><th>Service</th><th>Amount (KES)</th><th>Paid On</th><th>Status</th></tr></thead><tbody>
        <tr><td>Annual Gala Dinner</td><td>Transport</td><td class="serif-num">40,000</td><td>—</td><td><span class="badge badge-gold">Pending</span></td></tr>
        <tr><td>Tech Summit 2025</td><td>Delegate Transport</td><td class="serif-num">32,000</td><td>Nov 30, 2025</td><td><span class="badge badge-green">Paid</span></td></tr>
        <tr><td>Wellness Retreat 2026</td><td>Shuttle Service</td><td class="serif-num">55,000</td><td>—</td><td><span class="badge badge-gold">Pending</span></td></tr>
      </tbody></table></div>`,

  };

  return templates[id] || null;
}