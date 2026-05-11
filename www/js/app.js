/* Main application controller for the Eventara demo frontend. */

const VENDOR_SUBMENU_ITEMS = [
  { id: 'vendors', label: 'All Vendors' },
  { id: 'event-vendors', label: 'Event Vendors' },
];

let currentRole = 'Admin';
let currentView = null; // Will be set in init
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
  if (el) el.classList.add('active');

  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  
  if (loginForm) loginForm.style.display = tab === 'login' ? 'block' : 'none';
  if (registerForm) registerForm.style.display = tab === 'register' ? 'block' : 'none';
}

function selectRole(role, el) {
  // Safety check: Ensure config exists
  if (typeof ROLE_CONFIG === 'undefined' || !ROLE_CONFIG[role]) {
    console.error(`Role configuration for "${role}" is missing!`);
    return;
  }

  currentRole = role;
  document.querySelectorAll('.role-option').forEach((node) => node.classList.remove('selected'));
  
  if (el) {
    el.classList.add('selected');
  } else {
    const roleOption = document.getElementById(`role-${role}`);
    if (roleOption) roleOption.classList.add('selected');
  }

  const registerRole = document.getElementById('register-role');
  if (registerRole) registerRole.value = role;

  const appPage = document.getElementById('app-page');
  if (appPage && appPage.style.display === 'block') {
    applyRoleChrome();
  }
}

function syncRegisterRole(role) {
  selectRole(role, null);
}

function enterApp() {
  const authPage = document.getElementById('auth-page');
  const appPage = document.getElementById('app-page');
  
  if (authPage) authPage.style.display = 'none';
  if (appPage) appPage.style.display = 'block';

  applyRoleChrome();
  
  if (typeof ROLE_CONFIG !== 'undefined' && ROLE_CONFIG[currentRole]) {
    showView(ROLE_CONFIG[currentRole].defaultView, null);
    showToast(`Welcome back, ${ROLE_CONFIG[currentRole].name}`);
  }
}

function logout() {
  // Safety check for optional modal functions
  if (typeof closeModal === 'function') closeModal(null);
  if (typeof closeDeleteModal === 'function') closeDeleteModal(null);
  if (typeof closePaymentModal === 'function') closePaymentModal(null);

  if (typeof AuthAPI !== 'undefined') AuthAPI.logout();

  const appPage = document.getElementById('app-page');
  const authPage = document.getElementById('auth-page');
  
  if (appPage) appPage.style.display = 'none';
  if (authPage) authPage.style.display = 'flex';
  showToast('Signed out successfully');
}

function applyRoleChrome() {
  if (typeof ROLE_CONFIG === 'undefined') return;
  
  const roleConfig = ROLE_CONFIG[currentRole];
  const roleBadge = document.getElementById('sidebar-role-badge');
  const displayName = document.getElementById('user-display-name');
  const displayRole = document.getElementById('user-display-role');
  const avatar = document.getElementById('user-avatar-initials');

  if (roleBadge) {
    roleBadge.className = `sidebar-role-badge ${roleConfig.badgeClass}`;
    roleBadge.textContent = roleConfig.label;
  }
  if (displayName) displayName.textContent = roleConfig.name;
  if (displayRole) displayRole.textContent = roleConfig.label;
  if (avatar) avatar.textContent = roleConfig.initials;

  buildSidebar(roleConfig);
}

function buildSidebar(roleConfig) {
  const sidebarNav = document.getElementById('sidebar-nav');
  if (!sidebarNav) return;

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
  const paths = (typeof ICONS !== 'undefined' ? ICONS[iconName] : '') || '';
  return `
    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      ${paths}
    </svg>
  `;
}

function showView(id, navEl) {
  const template = typeof getViewTemplate === 'function' ? getViewTemplate(id) : null;
  const content = document.getElementById('main-content');
  const title = (typeof VIEW_TITLES !== 'undefined' ? VIEW_TITLES[id] : null) || 'Dashboard';
  const actionLabel = (typeof ACTION_LABELS !== 'undefined' ? ACTION_LABELS[id] : null) ?? '+ Create';
  const actionButton = document.getElementById('topbar-action');

  currentView = id;

  if (content) {
    content.innerHTML = `
      <div class="view active" id="view-${id}">
        ${template || '<div class="empty-state"><div class="empty-title">Coming soon</div></div>'}
      </div>
    `;
  }

  document.querySelectorAll('.nav-item, .nav-sub-item').forEach((node) => node.classList.remove('active'));
  const activeNode = navEl || document.querySelector(`[data-view="${id}"]`);
  if (activeNode) activeNode.classList.add('active');

  const pageTitle = document.getElementById('page-title');
  const breadcrumb = document.getElementById('bc-cur');
  if (pageTitle) pageTitle.textContent = title;
  if (breadcrumb) breadcrumb.textContent = title;

  if (actionButton) {
    actionButton.textContent = actionLabel;
    actionButton.style.display = actionLabel ? 'inline-flex' : 'none';
  }

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

  if (modalFormAvailable && typeof openCreateModal === 'function') {
    openCreateModal();
    return;
  }

  showToast('This screen uses the inline actions shown in the content area.');
}

function toggleVendorMenu() {
  const vendorSub = document.getElementById('vendor-sub');
  if (!vendorSub) return;

  if (vendorSub.classList.contains('open')) {
    closeVendorMenu();
  } else {
    openVendorMenu();
    if (currentView !== 'vendors' && currentView !== 'event-vendors') {
      showView('vendors', document.querySelector('[data-view="vendors"]'));
    }
  }
}

function openVendorMenu() {
  const vendorSub = document.getElementById('vendor-sub');
  const vendorArrow = document.getElementById('vendor-arrow');
  if (vendorSub) vendorSub.classList.add('open');
  if (vendorArrow) vendorArrow.textContent = '-';
}

function closeVendorMenu() {
  const vendorSub = document.getElementById('vendor-sub');
  const vendorArrow = document.getElementById('vendor-arrow');
  if (vendorSub) vendorSub.classList.remove('open');
  if (vendorArrow) vendorArrow.textContent = '+';
}

function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  if (toastTimerId) clearTimeout(toastTimerId);

  toast.textContent = message;
  toast.classList.add('show');
  toastTimerId = setTimeout(() => {
    toast.classList.remove('show');
    toastTimerId = null;
  }, duration);
}

// Fixed Init: Runs only when the browser is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log("App Initializing with role:", currentRole);
  
  // 1. Verify ROLE_CONFIG exists
  if (typeof ROLE_CONFIG !== 'undefined' && ROLE_CONFIG[currentRole]) {
      currentView = ROLE_CONFIG[currentRole].defaultView;
      
      // 2. Select the role in the UI (if the button exists)
      const roleBtn = document.getElementById(`role-${currentRole}`);
      selectRole(currentRole, roleBtn);
      
      console.log("Successfully loaded config for:", currentRole);
  } else {
      console.error("CRITICAL: ROLE_CONFIG is missing or Role name is mismatched.");
      console.log("Current ROLE_CONFIG keys:", Object.keys(window.ROLE_CONFIG || {}));
  }

  // 3. Set initial page visibility
  const authPage = document.getElementById('auth-page');
  const appPage = document.getElementById('app-page');
  
  if (authPage) authPage.style.display = 'flex';
  if (appPage) appPage.style.display = 'none';
});
