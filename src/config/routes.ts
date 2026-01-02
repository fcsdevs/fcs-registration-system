/**
 * Application Routes Map
 * All available pages and their authentication status
 */

export const routes = {
  // Public Routes
  landing: {
    path: "/landing",
    label: "Landing",
    public: true,
    description: "Public homepage"
  },
  login: {
    path: "/auth/login",
    label: "Login",
    public: true,
    description: "User login"
  },
  signup: {
    path: "/auth/signup",
    label: "Sign Up",
    public: true,
    description: "User registration"
  },

  // Protected Routes - User
  home: {
    path: "/home",
    label: "Dashboard",
    public: false,
    description: "Main dashboard (authenticated users only)"
  },
  members: {
    path: "/members",
    label: "Members",
    public: false,
    description: "Member management"
  },
  registrations: {
    path: "/registrations",
    label: "Registrations",
    public: false,
    description: "Event registrations"
  },

  // Protected Routes - Events
  events: {
    path: "/events",
    label: "Events",
    public: false,
    description: "Event management"
  },

  // Protected Routes - Organization
  units: {
    path: "/units",
    label: "Units",
    public: false,
    description: "Organizational units"
  },

  // Protected Routes - Admin/Leadership
  admin: {
    path: "/admin",
    label: "Admin",
    public: false,
    description: "Admin panel"
  },
  reports: {
    path: "/reports",
    label: "Reports",
    public: false,
    description: "Analytics & reports"
  },
  command: {
    path: "/command",
    label: "Command",
    public: false,
    description: "Command center"
  },

  // Protected Routes - Operational
  kiosk: {
    path: "/kiosk",
    label: "Kiosk",
    public: false,
    description: "Check-in kiosk interface"
  },
  settings: {
    path: "/settings",
    label: "Settings",
    public: false,
    description: "User settings"
  },
};

// Helper functions
export function getPublicRoutes() {
  return Object.values(routes).filter(r => r.public);
}

export function getProtectedRoutes() {
  return Object.values(routes).filter(r => !r.public);
}

export function getAllRoutes() {
  return Object.values(routes);
}
