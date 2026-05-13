const ADMIN_PANEL_PASSWORD = 'Eventara@2024';
let _adminUnlocked = false;

window.openAdminPanel = function () {
  const modal = document.getElementById('admin-panel-modal');
  if (!modal) return;
  modal.style.display = 'flex';

  if (_adminUnlocked) {
    renderAdminPanel();
  } else {
    renderAdminPasswordGate();
  }
};

function renderAdminPasswordGate() {
  const body = document.getElementById('admin-panel-body');
  if (!body) return;

  body.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;flex:1;padding:40px 20px">
      <div style="width:100%;max-width:360px;text-align:center">
        <div style="width:56px;height:56px;border-radius:50%;border:1.5px solid #c9a84c;
                    display:flex;align-items:center;justify-content:center;margin:0 auto 22px;
                    background:rgba(201,168,76,0.08)">
          <svg viewBox="0 0 24 24" fill="none" stroke="#c9a84c" stroke-width="1.7"
               style="width:24px;height:24px">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:22px;color:#e8dfc8;
                    font-weight:500;margin-bottom:8px">Admin Access Required</div>
        <div style="font-size:12px;color:var(--muted);margin-bottom:28px;letter-spacing:0.3px">
          Enter the administration password to continue
        </div>
        <div style="text-align:left;margin-bottom:16px">
          <label style="font-size:11px;letter-spacing:0.8px;text-transform:uppercase;
                        color:var(--muted);display:block;margin-bottom:8px">Password</label>
          <input id="admin-gate-password" type="password"
                 class="form-control"
                 placeholder="••••••••••••"
                 onkeydown="if(event.key==='Enter') verifyAdminPassword()"
                 style="height:46px;font-size:14px;letter-spacing:1px">
        </div>
        <div id="admin-gate-error"
             style="color:#e74c3c;font-size:12px;min-height:18px;margin-bottom:14px;text-align:left"></div>
        <button class="pay-btn" style="width:100%" onclick="verifyAdminPassword()">
          Unlock Administration
        </button>
      </div>
    </div>`;

  setTimeout(() => {
    const input = document.getElementById('admin-gate-password');
    if (input) input.focus();
  }, 80);
}

window.verifyAdminPassword = function () {
  const input = document.getElementById('admin-gate-password');
  const errorEl = document.getElementById('admin-gate-error');
  if (!input) return;

  if (input.value === ADMIN_PANEL_PASSWORD) {
    _adminUnlocked = true;
    renderAdminPanel();
  } else {
    if (errorEl) errorEl.textContent = 'Incorrect password. Please try again.';
    input.value = '';
    input.focus();
  }
};

window.closeAdminPanel = function (e) {
  const modal = document.getElementById('admin-panel-modal');
  if (!modal) return;
  if (!e || e.target === modal) {
    modal.style.display = 'none';
    _adminUnlocked = false;
  }
};

window.updateAdminSettingsVisibility = function (role) {
  const button = document.getElementById('admin-settings-btn');
  if (!button) return;
  button.style.display = role === 'Admin' ? 'inline-flex' : 'none';
};

function renderAdminPanel() {
  const body = document.getElementById('admin-panel-body');
  if (!body) return;

  body.innerHTML = `
    <div class="ap-tab-bar">
      <button class="ap-tab active" id="ap-tab-sessions" onclick="switchAdminTab('sessions')">Active Sessions</button>
      <button class="ap-tab" id="ap-tab-messages" onclick="switchAdminTab('messages')">Notifications</button>
      <button class="ap-tab" id="ap-tab-onboarding" onclick="switchAdminTab('onboarding')">Register Accounts</button>
    </div>

    <div class="ap-panel" id="ap-panel-sessions">
      <div class="ap-panel-header">
        <div class="ap-panel-title">Everyone currently logged in</div>
        <button class="topbar-btn btn-ghost" style="padding:7px 16px;font-size:12px" onclick="loadSessions()">Refresh</button>
      </div>
      <div id="ap-sessions-body" class="ap-loading">Loading sessions...</div>
    </div>

    <div class="ap-panel" id="ap-panel-messages" style="display:none">
      <div class="ap-panel-header">
        <div class="ap-panel-title">Injection and system notifications</div>
      </div>
      <div class="auth-field" style="margin-bottom:12px">
        <label>Notification Type</label>
        <select id="ap-msg-type" class="form-control" style="height:42px">
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="danger">Critical</option>
        </select>
      </div>
      <div class="auth-field" style="margin-bottom:12px">
        <label>Message</label>
        <textarea id="ap-msg-text" class="form-control ap-textarea" rows="3" placeholder="Describe the alert or notice you want to send."></textarea>
      </div>
      <button class="pay-btn" style="margin-bottom:24px" onclick="sendBroadcast()">Send Notification</button>
      <div class="ap-panel-title" style="margin-bottom:10px">Message History</div>
      <div id="ap-messages-body" class="ap-loading">Loading messages...</div>
    </div>

    <div class="ap-panel" id="ap-panel-onboarding" style="display:none">
      <div class="ap-panel-header">
        <div class="ap-panel-title">Register vendors and service providers</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
        <div class="info-card">
          <div class="info-card-title">New Vendor</div>
          <div class="auth-field"><label>Full Name</label><input id="admin-vendor-name" class="form-control" placeholder="Vendor owner"></div>
          <div class="auth-field"><label>Email</label><input id="admin-vendor-email" class="form-control" type="email" placeholder="vendor@example.com"></div>
          <div class="auth-field"><label>Password</label><input id="admin-vendor-password" class="form-control" type="password" placeholder="Minimum 8 characters"></div>
          <div class="auth-field"><label>Business Name</label><input id="admin-vendor-business" class="form-control" placeholder="Business name"></div>
          <div class="auth-field"><label>Product Type</label><input id="admin-vendor-type" class="form-control" placeholder="Catering, Decor, Photography"></div>
          <div class="auth-field"><label>Description</label><textarea id="admin-vendor-description" class="form-control" rows="3"></textarea></div>
          <button class="pay-btn" onclick="registerVendorAccount()">Register Vendor</button>
        </div>
        <div class="info-card">
          <div class="info-card-title">New Service Provider</div>
          <div class="auth-field"><label>Full Name</label><input id="admin-provider-name" class="form-control" placeholder="Provider owner"></div>
          <div class="auth-field"><label>Email</label><input id="admin-provider-email" class="form-control" type="email" placeholder="provider@example.com"></div>
          <div class="auth-field"><label>Password</label><input id="admin-provider-password" class="form-control" type="password" placeholder="Minimum 8 characters"></div>
          <div class="auth-field"><label>Company Name</label><input id="admin-provider-company" class="form-control" placeholder="Company name"></div>
          <div class="auth-field"><label>Service Type</label><input id="admin-provider-type" class="form-control" placeholder="Security, Transport, Lighting"></div>
          <div class="auth-field"><label>Description</label><textarea id="admin-provider-description" class="form-control" rows="3"></textarea></div>
          <button class="pay-btn" onclick="registerServiceProviderAccount()">Register Provider</button>
        </div>
      </div>
    </div>`;

  loadSessions();
}

window.switchAdminTab = function (tab) {
  document.querySelectorAll('.ap-tab').forEach(node => node.classList.remove('active'));
  document.querySelectorAll('.ap-panel').forEach(node => { node.style.display = 'none'; });

  const activeTab = document.getElementById(`ap-tab-${tab}`);
  const activePanel = document.getElementById(`ap-panel-${tab}`);
  if (activeTab) activeTab.classList.add('active');
  if (activePanel) activePanel.style.display = 'block';

  if (tab === 'sessions') loadSessions();
  if (tab === 'messages') loadMessages();
};

async function loadSessions() {
  const body = document.getElementById('ap-sessions-body');
  if (!body) return;
  body.innerHTML = '<div class="ap-loading">Loading sessions...</div>';

  const sessions = await API.AdminAPI.getSessions();
  if (!sessions.length) {
    body.innerHTML = '<div class="ap-empty">No active sessions found.</div>';
    return;
  }

  body.innerHTML = `
    <div class="table-wrap" style="margin:0">
      <table class="data-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>IP</th>
            <th>Login Time</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${sessions.map(item => `
            <tr>
              <td><strong>${escapeAdmin(item.userName)}</strong><div style="font-size:11px;color:var(--muted)">${escapeAdmin(item.email)}</div></td>
              <td><span class="badge badge-gray">${escapeAdmin(item.role)}</span></td>
              <td style="font-family:monospace;font-size:12px;color:var(--muted)">${escapeAdmin(item.ip)}</td>
              <td>${new Date(item.loginTime).toLocaleString('en-KE')}</td>
              <td><button class="topbar-btn ap-kick-btn" onclick="kickSession('${item.sessionId}', '${escapeAdmin(item.userName)}')">Kick Out</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}

window.kickSession = async function (sessionId, userName) {
  if (!confirm(`Terminate ${userName}'s active session?`)) return;
  await API.AdminAPI.kickUser(sessionId);
  showToast(`${userName} has been removed from the system.`);
  loadSessions();
};

async function loadMessages() {
  const body = document.getElementById('ap-messages-body');
  if (!body) return;
  body.innerHTML = '<div class="ap-loading">Loading messages...</div>';

  const messages = await API.AdminAPI.getMessages();
  if (!messages.length) {
    body.innerHTML = '<div class="ap-empty">No notifications have been sent yet.</div>';
    return;
  }

  body.innerHTML = `
    <div class="ap-msg-list">
      ${messages.map(item => `
        <div class="ap-msg-item ap-msg-${escapeAdmin(item.type)}">
          <div class="ap-msg-top">
            <span class="badge ${messageBadge(item.type)}">${escapeAdmin(item.type)}</span>
            <span style="font-size:11px;color:var(--muted);margin-left:auto">${new Date(item.sentAt).toLocaleString('en-KE')} · ${escapeAdmin(item.sentBy)}</span>
          </div>
          <div class="ap-msg-text">${escapeAdmin(item.text)}</div>
        </div>
      `).join('')}
    </div>`;
}

window.sendBroadcast = async function () {
  const type = document.getElementById('ap-msg-type')?.value || 'info';
  const text = document.getElementById('ap-msg-text')?.value?.trim();
  if (!text) {
    showToast('Please enter a message before sending.');
    return;
  }

  await API.AdminAPI.broadcast({ type, text });
  document.getElementById('ap-msg-text').value = '';
  showToast('Notification sent successfully.');
  loadMessages();
};

window.registerVendorAccount = async function () {
  const payload = {
    fullName: document.getElementById('admin-vendor-name')?.value?.trim(),
    email: document.getElementById('admin-vendor-email')?.value?.trim(),
    password: document.getElementById('admin-vendor-password')?.value,
    businessName: document.getElementById('admin-vendor-business')?.value?.trim(),
    productType: document.getElementById('admin-vendor-type')?.value?.trim(),
    description: document.getElementById('admin-vendor-description')?.value?.trim()
  };

  await API.AdminAPI.registerVendor(payload);
  showToast('Vendor account registered successfully.');
  clearAdminVendorForm();
};

window.registerServiceProviderAccount = async function () {
  const payload = {
    fullName: document.getElementById('admin-provider-name')?.value?.trim(),
    email: document.getElementById('admin-provider-email')?.value?.trim(),
    password: document.getElementById('admin-provider-password')?.value,
    companyName: document.getElementById('admin-provider-company')?.value?.trim(),
    serviceType: document.getElementById('admin-provider-type')?.value?.trim(),
    description: document.getElementById('admin-provider-description')?.value?.trim()
  };

  await API.AdminAPI.registerServiceProvider(payload);
  showToast('Service provider account registered successfully.');
  clearAdminProviderForm();
};

function clearAdminVendorForm() {
  ['admin-vendor-name', 'admin-vendor-email', 'admin-vendor-password', 'admin-vendor-business', 'admin-vendor-type', 'admin-vendor-description']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
}

function clearAdminProviderForm() {
  ['admin-provider-name', 'admin-provider-email', 'admin-provider-password', 'admin-provider-company', 'admin-provider-type', 'admin-provider-description']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
}

function messageBadge(type) {
  const normalized = String(type || '').toLowerCase();
  if (normalized === 'danger') return 'badge-red';
  if (normalized === 'warning') return 'badge badge-gold';
  return 'badge badge-blue';
}

function escapeAdmin(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}