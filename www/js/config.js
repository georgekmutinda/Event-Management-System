const API_BASE_URL = 'http://localhost:5100/api';

const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
const NAME_CLAIM = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';
const EMAIL_CLAIM = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress';

const ROLE_CONFIG = {
  Admin: {
    label: 'Admin',
    badgeClass: 'role-admin',
    name: 'Admin',
    initials: 'AD',
    defaultView: 'dashboard',
    navSections: [
      {
        title: 'Platform',
        items: [
          { id: 'dashboard', label: 'Overview', icon: 'grid' },
          { id: 'events', label: 'Events', icon: 'calendar' },
          { id: 'vendors', label: 'Vendors', icon: 'home' },
          { id: 'service-providers', label: 'Service Providers', icon: 'tool' },
          { id: 'payments', label: 'Payments', icon: 'credit-card' }
        ]
      }
    ]
  },
  Planner: {
    label: 'Planner',
    badgeClass: 'role-planner',
    name: 'Planner',
    initials: 'PL',
    defaultView: 'dashboard',
    navSections: [
      {
        title: 'Planning',
        items: [
          { id: 'dashboard', label: 'Overview', icon: 'grid' },
          { id: 'events', label: 'My Events', icon: 'calendar' },
          { id: 'registrations', label: 'Paid Attendees', icon: 'users' },
          { id: 'vendors', label: 'Vendors', icon: 'home' },
          { id: 'service-providers', label: 'Service Providers', icon: 'tool' },
          { id: 'uploads', label: 'Uploads', icon: 'clipboard' }
        ]
      }
    ]
  },
  Vendor: {
    label: 'Vendor',
    badgeClass: 'role-vendor',
    name: 'Vendor',
    initials: 'VD',
    defaultView: 'vendor-dashboard',
    navSections: [
      {
        title: 'Vendor Portal',
        items: [
          { id: 'vendor-dashboard', label: 'My Dashboard', icon: 'grid' },
          { id: 'browse-events', label: 'Browse Events', icon: 'calendar' },
          { id: 'my-assignments', label: 'Event Assignments', icon: 'calendar' },
          { id: 'vendor-profile', label: 'Vendor Profile', icon: 'home' }
        ]
      }
    ]
  },
  ServiceProvider: {
    label: 'Service Provider',
    badgeClass: 'role-provider',
    name: 'Service Provider',
    initials: 'SP',
    defaultView: 'provider-dashboard',
    navSections: [
      {
        title: 'Provider Portal',
        items: [
          { id: 'provider-dashboard', label: 'My Dashboard', icon: 'grid' },
          { id: 'browse-events', label: 'Browse Events', icon: 'calendar' },
          { id: 'my-services', label: 'Assigned Services', icon: 'tool' },
          { id: 'provider-profile', label: 'Provider Profile', icon: 'user' }
        ]
      }
    ]
  },
  Attendee: {
    label: 'Attendee',
    badgeClass: 'role-user',
    name: 'Attendee',
    initials: 'AT',
    defaultView: 'browse-events',
    navSections: [
      {
        title: 'My Account',
        items: [
          { id: 'browse-events', label: 'Browse Events', icon: 'calendar' },
          { id: 'my-registrations', label: 'My Registrations', icon: 'users' },
          { id: 'my-payments', label: 'My Payments', icon: 'credit-card' }
        ]
      }
    ]
  }
};

const ICONS = {
  'grid': `<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>`,
  'calendar': `<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>`,
  'users': `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>`,
  'home': `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`,
  'tool': `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>`,
  'clipboard': `<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/>`,
  'credit-card': `<rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/>`,
  'user': `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
  'shield': `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`,
  'dollar-sign': `<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>`,
  'settings': `<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>`
};

const VIEW_TITLES = {
  dashboard: 'Dashboard',
  events: 'Events',
  registrations: 'Paid Attendees',
  vendors: 'Vendors',
  'service-providers': 'Service Providers',
  payments: 'Payments',
  'browse-events': 'Browse Events',
  'my-registrations': 'My Registrations',
  'my-payments': 'My Payments',
  'vendor-dashboard': 'Vendor Dashboard',
  'my-assignments': 'Event Assignments',
  'vendor-profile': 'Vendor Profile',
  'provider-dashboard': 'Provider Dashboard',
  'my-services': 'Assigned Services',
  'provider-profile': 'Provider Profile',
  uploads: 'Uploads'
};

const ACTION_LABELS = {
  dashboard: '',
  events: '+ New Event',
  registrations: '',
  vendors: '',
  'service-providers': '',
  payments: '',
  'browse-events': '',
  'my-registrations': '',
  'my-payments': '',
  'vendor-dashboard': '',
  'my-assignments': '',
  'vendor-profile': '',
  'provider-dashboard': '',
  'my-services': '',
  'provider-profile': '',
  uploads: '+ Upload File'
};

const MODAL_TITLES_MAP = {
  events: 'Create Event'
};
