# FCS Nigeria - Registration & Attendance System
## Frontend Application

**Digital registration, event management, and attendance tracking system for FCS Nigeria**

---

## 📋 Overview

The FCS Registration System is a comprehensive web application designed to streamline member registration, manage events, track attendance, and generate detailed reports for FCS (a national Christian organization in Nigeria).

### Key Features
- 🎯 **Member Management** - Register, track, and manage member profiles
- 📅 **Event Management** - Create, organize, and manage events across multiple centers
- ✅ **Attendance Tracking** - Real-time attendance recording with multiple check-in methods
- 📊 **Analytics & Reports** - Generate insights on participation, attendance rates, and member engagement
- 🏢 **Multi-Center Support** - Support for decentralized operations across multiple centers (Lagos, Abuja, Port Harcourt, Ibadan, Online)
- 🔐 **Secure Authentication** - Role-based access control with encrypted credentials
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- 🌐 **Offline Capability** - IndexedDB storage with background sync support

---

## 🛠️ Technology Stack

### Mandatory Frontend Stack
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.2.35 | App Router, Server/Client components, optimization |
| **TypeScript** | ^5 | Type-safe development |
| **Tailwind CSS** | v4 | Utility-first styling |
| **shadcn/ui** | Latest | Pre-built accessible components |
| **TanStack Query** | ^5.90 | Data fetching, caching, synchronization |
| **React Hook Form** | ^7.68 | Efficient form management |
| **Zod** | ^4.2 | Schema validation |
| **IndexedDB** | Native | Offline-first data storage |
| **Web Workers** | Native | Background sync operations |

### Additional Libraries
- **Lucide React** - Icon library
- **Next/Image** - Image optimization

---

## 🎨 Design System v2.1

### Brand Colors
| Element | Color | Hex Code |
|---------|-------|----------|
| Primary (FCS Midnight Blue) | Dark Navy | #010030 |
| Secondary (Ministry Green) | Green | #1F7A63 |
| Accent (Calm Indigo) | Indigo | #3B4A9F |
| Online Participation | Digital Blue | #1D4ED8 |
| On-Site Participation | Warm Amber | #F59E0B |
| Hybrid Participation | Royal Purple | #6D28D9 |
| Success | Ministry Green | #1F7A63 |
| Warning | Warm Amber | #D97706 |
| Error | Crimson Red | #B91C1C |
| Info | Digital Blue | #2563EB |

### Typography & Spacing
- **Font Family**: System fonts with optimization
- **Heading Sizes**: 6 levels (H1-H6) with proper hierarchy
- **Spacing Scale**: xs (0.5rem) to 2xl (4rem)
- **Border Radius**: sm to 2xl with full (rounded)

### Components
- StatCard - KPI display with trends
- EventCard - Event preview with capacity tracking
- MemberCard - Member profile cards
- AttendanceBadge - Attendance rate display
- EmptyState - Placeholder component
- SkeletonCard - Loading states

---

## 📂 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with providers
│   │   ├── globals.css             # Global styles & CSS variables
│   │   ├── page.tsx                # Home redirect
│   │   ├── landing/                # Public landing page
│   │   ├── auth/
│   │   │   ├── login/page.tsx      # Login page
│   │   │   └── signup/page.tsx     # Sign up page
│   │   ├── home/page.tsx           # Dashboard (protected)
│   │   ├── members/page.tsx        # Members listing
│   │   ├── events/page.tsx         # Events listing
│   │   ├── registrations/page.tsx  # Registrations page
│   │   ├── reports/page.tsx        # Reports & analytics
│   │   ├── admin/page.tsx          # Admin panel
│   │   ├── kiosk/page.tsx          # Kiosk interface
│   │   ├── command/page.tsx        # Command mode
│   │   ├── settings/page.tsx       # User settings
│   │   └── units/page.tsx          # Units management
│   ├── components/
│   │   ├── common/
│   │   │   └── route-guards.tsx    # Protected route wrapper
│   │   ├── layout/
│   │   │   ├── header.tsx          # Navigation header
│   │   │   └── providers.tsx       # Context providers
│   │   ├── ui/
│   │   │   └── professional-components.tsx
│   │   └── forms/
│   ├── context/
│   │   └── auth-context.tsx        # Authentication state
│   ├── hooks/
│   │   └── index.ts                # Custom hooks
│   ├── lib/
│   │   ├── api/
│   │   │   └── client.ts           # API client configuration
│   │   ├── db/
│   │   │   └── manager.ts          # IndexedDB manager
│   │   ├── validations/
│   │   │   └── schemas.ts          # Zod schemas
│   │   ├── workers/
│   │   │   └── manager.ts          # Web Worker manager
│   │   └── utils.ts                # Utility functions
│   ├── types/
│   │   └── index.ts                # TypeScript type definitions
│   └── utils/
├── public/
│   ├── fcs_logo.png                # FCS brand logo
│   ├── favicon.ico                 # Favicon
│   └── manifest.json               # PWA manifest
├── next.config.js                  # Next.js configuration
├── tailwind.config.ts              # Tailwind configuration
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # Dependencies
└── README.md                        # This file
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/fcsdevs/fcs-registration-system.git
cd fcs-registration-system/frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Update `.env.local` with your configuration:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=FCS Registration System
```

4. **Start the development server**
```bash
npm run dev
```

The application will be available at:
- **Local**: [http://localhost:3001](http://localhost:3001)
- **Network**: Check terminal output for network URL

---

## 📖 Available Routes

### Public Routes
| Route | Description |
|-------|-------------|
| `/` | Landing page redirect |
| `/landing` | Public homepage with features |
| `/auth/login` | User login |
| `/auth/signup` | New user registration |

### Protected Routes (Requires Authentication)
| Route | Description |
|-------|-------------|
| `/home` | Main dashboard with KPIs |
| `/members` | Member management |
| `/events` | Event management |
| `/registrations` | Registration tracking |
| `/reports` | Analytics & reports |
| `/admin` | Admin panel |
| `/kiosk` | Kiosk check-in interface |
| `/command` | Command mode interface |
| `/settings` | User settings |
| `/units` | Units management |

---

## 🔐 Authentication

The system uses context-based authentication with:
- Email/password credentials
- JWT token management
- Protected route wrapper
- Auto-logout on token expiration
- Session persistence

### Login Example
```tsx
const { login, isLoading } = useAuth();
await login(email, password);
```

---

## 💾 Offline Support

### IndexedDB Storage
- Member profiles
- Event data
- Registration records
- Attendance logs

### Web Workers
- Background synchronization
- Offline queue management
- Data sync on reconnection

---

## 🎯 Key Features Implementation

### 1. Dashboard (Home Page)
- 4 KPI cards with real-time metrics
- Trending indicators (up/down)
- Upcoming events list
- Attendance breakdown by center
- Quick action buttons

### 2. Members
- Member list with search/filter
- Member profiles with contact info
- Status tracking (Primary, Secondary, Tertiary, Associate)
- Member code generation
- Join date tracking

### 3. Events
- Event creation & management
- Participation mode tracking (Online/On-Site/Hybrid)
- Capacity management with visual indicators
- Registration status tracking
- Event status management

### 4. Attendance
- Real-time check-in
- Capacity warnings
- Attendance rate analytics
- Center-wise breakdown
- Historical tracking

---

## 📦 Build & Deployment

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run start
```

### Build Output
```
Route (app)                        Size
├ /                               138 B
├ /landing                        174 B
├ /home                          6.23 kB
├ /members                       3.31 kB
├ /events                        3.31 kB
├ /registrations                 3.31 kB
├ /reports                       3.31 kB
├ /admin                         3.31 kB
├ /kiosk                         3.31 kB
├ /command                       3.31 kB
├ /settings                      3.31 kB
├ /units                         3.31 kB
├ /auth/login                    3.31 kB
└ /auth/signup                   3.46 kB
```

---

## 🧪 Testing

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

---

## 📚 Code Standards

- **TypeScript**: Strict mode enabled
- **Tailwind CSS**: Utility-first approach with arbitrary colors
- **Component Architecture**: Functional components with hooks
- **State Management**: React Context + TanStack Query
- **Form Validation**: React Hook Form + Zod schemas
- **Error Handling**: Proper error boundaries and try-catch blocks

---

## 🎨 Styling Approach

All components use **Tailwind CSS** with FCS design system colors:

```tsx
// Primary button (FCS Midnight Blue)
<button className="bg-[#010030] text-white rounded-lg hover:opacity-90">
  Action
</button>

// Status badge (Ministry Green)
<span className="bg-[#E8F5F1] text-[#1F7A63] rounded-full px-3 py-1">
  Active
</span>

// Borders using neutral palette
<div className="border border-[#CBD5E1]">
  Content
</div>
```

---

## 📱 Responsive Design

- Mobile-first Tailwind approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly interactive elements (min 44px)
- Hamburger menu for mobile navigation

---

## 🔧 Configuration Files

### `next.config.js`
- Image optimization
- Font optimization
- Build configuration

### `tailwind.config.ts`
- Design system tokens
- Custom utilities
- Plugin configuration

### `tsconfig.json`
- Strict mode enabled
- Path aliases: `@/*` → `src/*`
- ES2020 target

---

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

---

## 📄 License

This project is proprietary software for FCS Nigeria. All rights reserved.

---

## 👥 Team

**FCS Development Team**
- Email: dev@fcsregistration.com
- Organization: FCS Nigeria

---

## 📞 Support

For issues, questions, or feature requests:
1. Check existing documentation
2. Review the design system audit: `DESIGN_SYSTEM_AUDIT.md`
3. Contact the development team

---

## 🚀 Performance

- **Next.js 14**: Automatic code splitting & optimization
- **Image Optimization**: Automatic responsive images
- **CSS**: Optimized Tailwind production build (~15KB gzipped)
- **Bundle Size**: ~87KB shared JS (first load)
- **Runtime**: Server-Side Rendering (SSR) ready

---

## ✅ Verification Checklist

- ✅ All 19 routes compile successfully
- ✅ FCS Design System v2.1 fully implemented
- ✅ Responsive design tested
- ✅ TypeScript strict mode enabled
- ✅ Authentication working
- ✅ Offline storage configured
- ✅ Web Workers integrated
- ✅ Logo branding applied across all pages
- ✅ Build optimized for production

---

**Last Updated**: December 18, 2025
**Status**: Production Ready 🟢
