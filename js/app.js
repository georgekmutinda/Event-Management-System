/* Main application controller for the Eventara demo frontend. */

const VENDOR_SUBMENU_ITEMS = [
  { id: 'vendors', label: 'All Vendors' },
  { id: 'event-vendors', label: 'Event Vendors' },
];

let currentRole = 'admin';
let currentView = ROLE_CONFIG[currentRole].defaultView;
let toastTimerId = null;
const TOPBAR_ACTION_HANDLERS = {
  'user-dashboard': () => showView('browse-events', document.querySelector('[data-view="browse-events"]')),
  'my-payments': () => openPaymentModal('Annual Gala Dinner', 'KES 15,000'),
  'vendor-profile': () => showToast('Profile edits are entered directly in this view.'),
  'provider-dashboard': () => showView('my-services', document.querySelector('[data-view="my-services"]')),
  'provider-profile': () => showToast('Profile edits are entered directly in this view.'),
};

function switchAuthTab(tab, el) {
  document.querySelectorAll('.auth-tab').forEach((node) => node.classList.remove('active'));
  if (el) {
    el.classList.add('active');
  }

  document.getElementById('login-form').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';
}

function selectRole(role, el) {
  if (!ROLE_CONFIG[role]) {
    return;
  }

  currentRole = role;
  document.querySelectorAll('.role-option').forEach((node) => node.classList.remove('selected'));
  if (el) {
    el.classList.add('selected');
  } else {
    const roleOption = document.getElementById(`role-${role}`);
    if (roleOption) {
      roleOption.classList.add('selected');
    }
  }

  const registerRole = document.getElementById('register-role');
  if (registerRole && registerRole.value !== role) {
    registerRole.value = role;
  }

  if (document.getElementById('app-page').style.display === 'block') {
    applyRoleChrome();
  }
}

function syncRegisterRole(role) {
  selectRole(role, null);
}

function enterApp() {
  document.getElementById('auth-page').style.display = 'none';
  document.getElementById('app-page').style.display = 'block';

  applyRoleChrome();
  showView(ROLE_CONFIG[currentRole].defaultView, null);
  showToast(`Welcome back, ${ROLE_CONFIG[currentRole].name}`);
}

function logout() {
  closeModal(null);
  closeDeleteModal(null);
  closePaymentModal(null);

  document.getElementById('app-page').style.display = 'none';
  document.getElementById('auth-page').style.display = 'flex';
  showToast('Signed out successfully');
}

function applyRoleChrome() {
  const roleConfig = ROLE_CONFIG[currentRole];
  const roleBadge = document.getElementById('sidebar-role-badge');
  const displayName = document.getElementById('user-display-name');
  const displayRole = document.getElementById('user-display-role');
  const avatar = document.getElementById('user-avatar-initials');

  roleBadge.className = `sidebar-role-badge ${roleConfig.badgeClass}`;
  roleBadge.textContent = roleConfig.label;
  displayName.textContent = roleConfig.name;
  displayRole.textContent = roleConfig.label;
  avatar.textContent = roleConfig.initials;

  buildSidebar(roleConfig);
}

function buildSidebar(roleConfig) {
  const sidebarNav = document.getElementById('sidebar-nav');
  const sectionsHtml = roleConfig.navSections.map((section) => {
    const itemsHtml = section.items.map((item) => buildNavItem(item)).join('');
    return `
      <div class="sidebar-section">${section.title}</div>
      ${itemsHtml}
    `;
  }).join('');

  sidebarNav.innerHTML = sectionsHtml;
}

function buildNavItem(item) {
  const badgeHtml = item.badge ? `<span class="nav-badge">${item.badge}</span>` : '';
  const iconHtml = buildIcon(item.icon);

  if (item.hasSubmenu) {
    const submenuHtml = VENDOR_SUBMENU_ITEMS.map((subItem) => `
      <div class="nav-sub-item" data-view="${subItem.id}" onclick="showView('${subItem.id}', this)">
        ${subItem.label}
      </div>
    `).join('');

    return `
      <div class="nav-item" data-view="${item.id}" onclick="toggleVendorMenu(this)">
        ${iconHtml}
        <span>${item.label}</span>
        ${badgeHtml}
        <span id="vendor-arrow" style="margin-left:auto;transition:transform 0.2s">+</span>
      </div>
      <div class="vendor-nav-sub" id="vendor-sub">
        ${submenuHtml}
      </div>
    `;
  }

  return `
    <div class="nav-item" data-view="${item.id}" onclick="showView('${item.id}', this)">
      ${iconHtml}
      <span>${item.label}</span>
      ${badgeHtml}
    </div>
  `;
}

function buildIcon(iconName) {
  const paths = ICONS[iconName] || '';
  return `
    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      ${paths}
    </svg>
  `;
}

function showView(id, navEl) {
  const template = getViewTemplate(id);
  const content = document.getElementById('main-content');
  const title = VIEW_TITLES[id] || 'Dashboard';
  const actionLabel = ACTION_LABELS[id] ?? '+ Create';
  const actionButton = document.getElementById('topbar-action');

  currentView = id;

  content.innerHTML = `
    <div class="view active" id="view-${id}">
      ${template || '<div class="empty-state"><div class="empty-title">Coming soon</div></div>'}
    </div>
  `;

  document.querySelectorAll('.nav-item, .nav-sub-item').forEach((node) => node.classList.remove('active'));
  const activeNode = navEl || document.querySelector(`[data-view="${id}"]`);
  if (activeNode) {
    activeNode.classList.add('active');
  }

  document.getElementById('page-title').textContent = title;
  document.getElementById('bc-cur').textContent = title;

  actionButton.textContent = actionLabel;
  actionButton.style.display = actionLabel ? 'inline-flex' : 'none';

  if (id === 'vendors' || id === 'event-vendors') {
    openVendorMenu();
  } else {
    closeVendorMenu();
  }
}

function handleTopbarAction() {
  const modalFormAvailable = typeof MODAL_FORMS !== 'undefined' && Boolean(MODAL_FORMS[currentView]);
  const handler = TOPBAR_ACTION_HANDLERS[currentView];

  if (typeof handler === 'function') {
    handler();
    return;
  }

  if (modalFormAvailable) {
    openCreateModal();
    return;
  }

  showToast('This screen uses the inline actions shown in the content area.');
}

function toggleVendorMenu() {
  const vendorSub = document.getElementById('vendor-sub');
  if (!vendorSub) {
    return;
  }

  if (vendorSub.classList.contains('open')) {
    closeVendorMenu();
    return;
  }

  openVendorMenu();
  if (currentView !== 'vendors' && currentView !== 'event-vendors') {
    showView('vendors', document.querySelector('[data-view="vendors"]'));
  }
}

function openVendorMenu() {
  const vendorSub = document.getElementById('vendor-sub');
  const vendorArrow = document.getElementById('vendor-arrow');

  if (vendorSub) {
    vendorSub.classList.add('open');
  }

  if (vendorArrow) {
    vendorArrow.textContent = '-';
  }
}

function closeVendorMenu() {
  const vendorSub = document.getElementById('vendor-sub');
  const vendorArrow = document.getElementById('vendor-arrow');

  if (vendorSub) {
    vendorSub.classList.remove('open');
  }

  if (vendorArrow) {
    vendorArrow.textContent = '+';
  }
}

function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) {
    return;
  }

  if (toastTimerId) {
    clearTimeout(toastTimerId);
  }

  toast.textContent = message;
  toast.classList.add('show');
  toastTimerId = setTimeout(() => {
    toast.classList.remove('show');
    toastTimerId = null;
  }, duration);
}

(function init() {
  selectRole(currentRole, document.getElementById(`role-${currentRole}`));
  document.getElementById('auth-page').style.display = 'flex';
  document.getElementById('app-page').style.display = 'none';
})();
