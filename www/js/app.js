let currentRole = 'Attendee';
let currentView = null;
let toastTimerId = null;

window.getCurrentRole = () => currentRole;
window.getCurrentView = () => currentView;

window.switchAuthTab = function (tab, el) {
  document.querySelectorAll('.auth-tab').forEach(node => node.classList.remove('active'));
  if (el) el.classList.add('active');

  const login = document.getElementById('login-form');
  const register = document.getElementById('register-form');

  if (login) login.style.display = tab === 'login' ? 'block' : 'none';
  if (register) register.style.display = tab === 'register' ? 'block' : 'none';
};

window.selectRole = function (role) {
  if (!ROLE_CONFIG[role]) return;
  currentRole = role;
  const regRole = document.getElementById('register-role');
  if (regRole) regRole.value = role;
};

window.syncRegisterRole = function (role) {
  window.selectRole(role);
};

window.enterApp = function (role) {
  if (role && ROLE_CONFIG[role]) {
    currentRole = role;
  }

  const authPage = document.getElementById('auth-page');
  const appPage = document.getElementById('app-page');
  if (authPage) authPage.style.display = 'none';
  if (appPage) appPage.style.display = 'block';

  applyRoleChrome();

  const cfg = ROLE_CONFIG[currentRole];
  if (cfg) {
    window.showView(cfg.defaultView, null);
  }

  if (typeof window.updateAdminSettingsVisibility === 'function') {
    window.updateAdminSettingsVisibility(currentRole);
  }
};

window.handleGuestDemo = function () {
  currentRole = 'Admin';
  window.enterApp('Admin');
};

window.logout = function () {
  if (typeof closeModal === 'function') closeModal(null);
  if (typeof closePaymentModal === 'function') closePaymentModal(null);
  if (typeof closeDeleteModal === 'function') closeDeleteModal(null);
  if (typeof closeAdminPanel === 'function') closeAdminPanel(null);
  if (typeof AuthAPI !== 'undefined') AuthAPI.logout();

  const authPage = document.getElementById('auth-page');
  const appPage = document.getElementById('app-page');
  const gearBtn = document.getElementById('admin-settings-btn');

  if (gearBtn) gearBtn.style.display = 'none';
  if (appPage) appPage.style.display = 'none';
  if (authPage) authPage.style.display = 'flex';

  window.showToast('Signed out successfully');
};

function applyRoleChrome() {
  const cfg = ROLE_CONFIG[currentRole];
  if (!cfg) return;

  const badge = document.getElementById('sidebar-role-badge');
  const displayName = document.getElementById('user-display-name');
  const displayRole = document.getElementById('user-display-role');
  const avatar = document.getElementById('user-avatar-initials');
  const authUser = window.API?.Auth?.user;

  if (badge) {
    badge.className = `sidebar-role-badge ${cfg.badgeClass}`;
    badge.textContent = cfg.label;
  }

  if (displayName) displayName.textContent = authUser?.fullName || cfg.name || cfg.label;
  if (displayRole) displayRole.textContent = cfg.label;
  if (avatar) {
    const initials = (authUser?.fullName || cfg.initials || cfg.label)
      .split(' ')
      .map(word => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    avatar.textContent = initials;
  }

  buildSidebar(cfg);
}

function buildSidebar(cfg) {
  const nav = document.getElementById('sidebar-nav');
  if (!nav) return;

  nav.innerHTML = cfg.navSections.map(section => {
    const items = section.items.map(buildNavItem).join('');
    return `<div class="sidebar-section">${section.title}</div>${items}`;
  }).join('');
}

function buildNavItem(item) {
  return `
    <div class="nav-item" data-view="${item.id}" onclick="showView('${item.id}', this)">
      ${buildIcon(item.icon)}
      <span>${item.label}</span>
    </div>`;
}

function buildIcon(iconName) {
  const paths = ICONS[iconName] || '';
  return `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

window.showView = function (id, navEl) {
  const content = document.getElementById('main-content');
  const actionBtn = document.getElementById('topbar-action');
  const title = VIEW_TITLES[id] || 'Dashboard';
  const actionLabel = Object.prototype.hasOwnProperty.call(ACTION_LABELS, id) ? ACTION_LABELS[id] : '';

  currentView = id;

  if (content) {
    content.innerHTML = `
      <div class="view active" id="view-${id}">
        ${typeof getViewTemplate === 'function' ? getViewTemplate(id) : ''}
      </div>`;
  }

  document.querySelectorAll('.nav-item').forEach(node => node.classList.remove('active'));
  const activeNode = navEl || document.querySelector(`[data-view="${id}"]`);
  if (activeNode) activeNode.classList.add('active');

  const pageTitle = document.getElementById('page-title');
  const breadcrumb = document.getElementById('bc-cur');
  if (pageTitle) pageTitle.textContent = title;
  if (breadcrumb) breadcrumb.textContent = title;

  if (actionBtn) {
    actionBtn.textContent = actionLabel;
    actionBtn.style.display = actionLabel ? 'inline-flex' : 'none';
  }

  if (typeof window.loadViewData === 'function') {
    window.loadViewData(id);
  }
};

window.handleTopbarAction = function () {
  if (currentView === 'events' && typeof openCreateModal === 'function') {
    openCreateModal();
    return;
  }

  window.showToast('No quick action is available on this screen.');
};

window.showToast = function (message, duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  if (toastTimerId) clearTimeout(toastTimerId);
  toast.textContent = message;
  toast.classList.add('show');

  toastTimerId = setTimeout(() => {
    toast.classList.remove('show');
    toastTimerId = null;
  }, duration);
};

document.addEventListener('DOMContentLoaded', () => {
  const authPage = document.getElementById('auth-page');
  const appPage = document.getElementById('app-page');

  if (authPage) authPage.style.display = 'flex';
  if (appPage) appPage.style.display = 'none';
  window.selectRole('Attendee');
});
