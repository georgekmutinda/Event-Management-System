/* ═══════════════════════════════════════
   config.js — Role Config, Icon Map,
   View Title & Action Label Maps
═══════════════════════════════════════ */

/* ─────────────────────────────────────
   ROLE CONFIGURATION
   Each role defines the user persona,
   sidebar nav sections, and default view.
───────────────────────────────────── */
const ROLE_CONFIG = {
  admin: {
    label:      'Administrator',
    badgeClass: 'role-admin',
    name:       'Alexandra R.',
    initials:   'AR',
    navSections: [
      {
        title: 'Main',
        items: [
          { id: 'dashboard',      label: 'Dashboard',      icon: 'grid' },
          { id: 'events',         label: 'Events',          icon: 'calendar' },
          { id: 'registrations',  label: 'Registrations',   icon: 'users', badge: '12' },
        ]
      },
      {
        title: 'Vendors & Services',
        items: [
          { id: 'vendors',           label: 'Vendors',           icon: 'home', hasSubmenu: true },
          { id: 'service-providers', label: 'Service Providers',  icon: 'tool' },
          { id: 'event-services',    label: 'Event Services',     icon: 'clipboard' },
        ]
      },
      {
        title: 'Finance & Admin',
        items: [
          { id: 'payments', label: 'Payments', icon: 'credit-card' },
          { id: 'users',    label: 'Users',    icon: 'user' },
          { id: 'roles',    label: 'Roles',    icon: 'shield' },
        ]
      }
    ],
    defaultView: 'dashboard'
  },

  user: {
    label:      'Event User',
    badgeClass: 'role-user',
    name:       'James M.',
    initials:   'JM',
    navSections: [
      {
        title: 'My Account',
        items: [
          { id: 'user-dashboard',   label: 'My Dashboard',    icon: 'grid' },
          { id: 'browse-events',    label: 'Browse Events',    icon: 'calendar' },
          { id: 'my-registrations', label: 'My Registrations', icon: 'users' },
        ]
      },
      {
        title: 'Payments',
        items: [
          { id: 'my-payments',  label: 'Payment History', icon: 'credit-card' },
          { id: 'make-payment', label: 'Pay for Event',   icon: 'dollar-sign' },
        ]
      }
    ],
    defaultView: 'user-dashboard'
  },

  vendor: {
    label:      'Vendor',
    badgeClass: 'role-vendor',
    name:       'Amina O.',
    initials:   'AO',
    navSections: [
      {
        title: 'Vendor Portal',
        items: [
          { id: 'vendor-dashboard', label: 'My Dashboard',     icon: 'grid' },
          { id: 'my-assignments',   label: 'Event Assignments', icon: 'calendar', badge: '3' },
          { id: 'vendor-profile',   label: 'Vendor Profile',    icon: 'home' },
        ]
      },
      {
        title: 'Finance',
        items: [
          { id: 'vendor-invoices', label: 'Invoices & Quotes', icon: 'clipboard' },
          { id: 'vendor-payments', label: 'Payment Tracking',  icon: 'credit-card' },
        ]
      }
    ],
    defaultView: 'vendor-dashboard'
  },

  provider: {
    label:      'Service Provider',
    badgeClass: 'role-provider',
    name:       'Fatuma H.',
    initials:   'FH',
    navSections: [
      {
        title: 'Provider Portal',
        items: [
          { id: 'provider-dashboard', label: 'My Dashboard',     icon: 'grid' },
          { id: 'my-services',        label: 'Assigned Services', icon: 'tool', badge: '2' },
          { id: 'provider-profile',   label: 'Provider Profile',  icon: 'user' },
        ]
      },
      {
        title: 'Finance',
        items: [
          { id: 'service-payments', label: 'Service Payments', icon: 'credit-card' },
        ]
      }
    ],
    defaultView: 'provider-dashboard'
  }
};

/* ─────────────────────────────────────
   SVG ICON PATH DATA
   Referenced by sidebar nav builder.
───────────────────────────────────── */
const ICONS = {
  'grid':        `<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>`,
  'calendar':    `<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>`,
  'users':       `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>`,
  'home':        `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`,
  'tool':        `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>`,
  'clipboard':   `<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/>`,
  'credit-card': `<rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/>`,
  'user':        `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
  'shield':      `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`,
  'dollar-sign': `<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>`,
};

/* ─────────────────────────────────────
   VIEW TITLES  (topbar page-title)
───────────────────────────────────── */
const VIEW_TITLES = {
  dashboard:            'Dashboard',
  events:               'Events',
  registrations:        'Registrations',
  vendors:              'Vendors',
  'event-vendors':      'Event Vendors',
  'service-providers':  'Service Providers',
  'event-services':     'Event Services',
  payments:             'Payments',
  users:                'Users',
  roles:                'Roles',
  'user-dashboard':     'My Dashboard',
  'browse-events':      'Browse Events',
  'my-registrations':   'My Registrations',
  'my-payments':        'Payment History',
  'make-payment':       'Make a Payment',
  'vendor-dashboard':   'Vendor Dashboard',
  'my-assignments':     'Event Assignments',
  'vendor-profile':     'Vendor Profile',
  'vendor-invoices':    'Invoices & Quotes',
  'vendor-payments':    'Payment Tracking',
  'provider-dashboard': 'Provider Dashboard',
  'my-services':        'Assigned Services',
  'provider-profile':   'Provider Profile',
  'service-payments':   'Service Payments',
};

/* ─────────────────────────────────────
   ACTION LABELS  (topbar primary button)
   Empty string = hide the button.
───────────────────────────────────── */
const ACTION_LABELS = {
  dashboard:            '+ Create Event',
  events:               '+ New Event',
  registrations:        '+ Register Attendee',
  vendors:              '+ Add Vendor',
  'event-vendors':      '+ Link Vendor',
  'service-providers':  '+ Add Provider',
  'event-services':     '+ Link Service',
  payments:             '+ Record Payment',
  users:                '+ Invite User',
  roles:                '+ Create Role',
  'user-dashboard':     '🎟 Browse Events',
  'browse-events':      '🎟 Register Now',
  'my-registrations':   'View Details',
  'my-payments':        '+ Make Payment',
  'make-payment':       '',
  'vendor-dashboard':   '+ Submit Quote',
  'my-assignments':     'View All',
  'vendor-profile':     'Edit Profile',
  'vendor-invoices':    '+ New Invoice',
  'vendor-payments':    'View Details',
  'provider-dashboard': '+ View Services',
  'my-services':        'View All',
  'provider-profile':   'Edit Profile',
  'service-payments':   'View Details',
};

/* ─────────────────────────────────────
   MODAL TITLES  (create/edit modal header)
───────────────────────────────────── */
const MODAL_TITLES_MAP = {
  dashboard:            'Create New Event',
  events:               'Create New Event',
  registrations:        'Register Attendee',
  vendors:              'Add Vendor',
  'event-vendors':      'Link Vendor to Event',
  'service-providers':  'Add Service Provider',
  'event-services':     'Link Service to Event',
  payments:             'Record Payment',
  users:                'Invite User',
  roles:                'Create Role',
  'browse-events':      'Register for Event',
  'vendor-dashboard':   'Submit Quote',
  'vendor-invoices':    'New Invoice',
  'my-registrations':   'Registration Details',
};