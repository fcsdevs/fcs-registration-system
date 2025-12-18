/**
 * FCS Nigeria Design Tokens v2.1
 * Enterprise Design System for National Faith-Based Organization
 * 
 * Primary Brand Color: #010030 (FCS Midnight Blue)
 * Authority • Depth • Stability • Spiritual Seriousness • Institutional Trust
 */

export const designTokens = {
  // PRIMARY BRAND IDENTITY
  brand: {
    name: "FCS Nigeria",
    primary: "#010030", // FCS Midnight Blue - Authority & Institutional Trust
    description: "National Christian Organization - Registration & Attendance System",
  },

  // COLOR SYSTEM v2.1
  colors: {
    // Primary Brand Color (Strict Usage)
    primary: "#010030",
    primary_foreground: "#FFFFFF",

    // Secondary & Supporting Colors (Harmonized)
    success: "#1F7A63", // Ministry Green - Completed, Confirmed, Positive indicators
    accent: "#3B4A9F", // Calm Indigo - Subtle highlights, Section dividers, Analytics

    // Participation Mode Colors (Rebalanced for accessibility)
    online: "#1D4ED8", // Digital Blue - Virtual participation
    on_site: "#F59E0B", // Warm Amber - Physical centers
    hybrid: "#6D28D9", // Royal Purple - Mixed participation

    // Status & Alert Colors (Adjusted for dark primary)
    warning: "#D97706", // Capacity warnings, alerts
    error: "#B91C1C", // Errors, validation failures
    info: "#2563EB", // Informational alerts
    
    // Neutral Palette (Critical with dark primary - soft & readable)
    gray: {
      950: "#020617", // Rare use: deep headers
      900: "#0F172A", // Primary text color
      700: "#334155", // Secondary text
      500: "#64748B", // Muted text
      300: "#CBD5E1", // Borders
      200: "#E2E8F0", // Dividers
      100: "#F1F5F9", // Card backgrounds
      50: "#F8FAFC",  // Page backgrounds
    },
  },

  // PARTICIPATION MODE DEFINITIONS
  participationModes: {
    ONLINE: {
      name: "Online",
      description: "Virtual participation via digital platform",
      color: "#1D4ED8",
      icon: "Wifi",
      badge_bg: "#EFF6FF",
      badge_text: "#1D4ED8",
    },
    ON_SITE: {
      name: "On-Site",
      description: "Physical attendance at designated center",
      color: "#F59E0B",
      icon: "MapPin",
      badge_bg: "#FFFBEB",
      badge_text: "#D97706",
    },
    HYBRID: {
      name: "Hybrid",
      description: "Choice of online or physical attendance",
      color: "#6D28D9",
      icon: "Layers",
      badge_bg: "#F3E8FF",
      badge_text: "#7C3AED",
    },
  },

  // TYPOGRAPHY SCALE
  typography: {
    fontFamily: {
      sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
      mono: ["var(--font-mono)", "monospace"],
    },
    fontSize: {
      xs: "0.75rem",     // 12px - Small labels, badges
      sm: "0.875rem",    // 14px - Secondary text, helper text
      base: "1rem",      // 16px - Body text
      lg: "1.125rem",    // 18px - Subheadings
      xl: "1.25rem",     // 20px - Card titles
      "2xl": "1.5rem",   // 24px - Section headers
      "3xl": "1.875rem", // 30px - Page titles
      "4xl": "2.25rem",  // 36px - Hero headlines
      "5xl": "3rem",     // 48px - Major announcements
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
  },

  // SPACING SCALE
  spacing: {
    xs: "0.5rem",   // 8px
    sm: "1rem",     // 16px
    md: "1.5rem",   // 24px
    lg: "2rem",     // 32px
    xl: "3rem",     // 48px
    "2xl": "4rem",  // 64px
    "3xl": "6rem",  // 96px
  },

  // BORDER RADIUS
  borderRadius: {
    none: "0",
    sm: "0.375rem",   // 6px
    md: "0.5rem",     // 8px
    lg: "0.75rem",    // 12px
    xl: "1rem",       // 16px
    "2xl": "1.5rem",  // 24px
    full: "9999px",   // Fully rounded
  },

  // SHADOWS (Enterprise-grade depth)
  shadows: {
    none: "none",
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
  },

  // TRANSITIONS & ANIMATIONS
  transitions: {
    fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    base: "200ms cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
    slower: "500ms cubic-bezier(0.4, 0, 0.2, 1)",
  },

  // Z-INDEX SCALE (Layering hierarchy)
  zIndex: {
    hide: -1,
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    backdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },

  // BUTTON VARIANTS
  buttons: {
    primary: {
      background: "#010030",
      text: "#FFFFFF",
      hover: "rgba(255, 255, 255, 0.08)",
      border: "none",
    },
    secondary: {
      background: "transparent",
      text: "#010030",
      hover: "#F8FAFC",
      border: "1px solid #010030",
    },
    success: {
      background: "#1F7A63",
      text: "#FFFFFF",
      hover: "rgba(255, 255, 255, 0.08)",
      border: "none",
    },
    error: {
      background: "#B91C1C",
      text: "#FFFFFF",
      hover: "rgba(255, 255, 255, 0.08)",
      border: "none",
    },
  },

  // COMPONENT SIZES
  components: {
    button: {
      height: {
        sm: "2rem",     // 32px
        md: "2.5rem",   // 40px
        lg: "3rem",     // 48px
      },
      padding: {
        sm: "0.5rem 1rem",
        md: "0.75rem 1.5rem",
        lg: "1rem 2rem",
      },
    },
    input: {
      height: "2.5rem", // 40px
      padding: "0.75rem 1rem",
      border_color: "#CBD5E1",
      focus_color: "#010030",
    },
    card: {
      padding: "1.5rem",
      border_radius: "0.75rem",
      border_color: "#E2E8F0",
      background: "#FFFFFF",
    },
  },
};

export type DesignTokens = typeof designTokens;
export type ParticipationMode = keyof typeof designTokens.participationModes;
