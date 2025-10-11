# BoligMatch Web Application

## Overview
BoligMatch is a comprehensive web application for managing categories, subcategories, partners, and their relationships. The application features role-based authentication with separate layouts for Admin, Partner, and User roles.

## Tech Stack
- **Frontend**: React 19 + TypeScript + Vite
- **State Management**: Redux Toolkit
- **Data Fetching**: TanStack React Query
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v4
- **Forms**: React Hook Form + Zod
- **i18n**: react-i18next (English & Danish)
- **Notifications**: Sonner

## Project Structure
```
src/
├── app/                    # App configuration (store, router, hooks)
├── components/
│   ├── common/            # Reusable components (Button, Input, Modal, DataTable)
│   └── layout/            # Layout components (Header, AppLayout, AdminLayout)
├── features/
│   ├── auth/              # Authentication (login, guards, auth slice)
│   └── admin/             # Admin pages (categories, subcategories, partners, users)
├── lib/                   # Utilities (axios, i18n, query client, storage)
├── locales/               # Translation files (en.json, da.json)
├── pages/                 # Public pages (HomePage, NotFound)
├── services/              # API services
└── types/                 # TypeScript type definitions
```

## Features

### Authentication
- Role-based authentication using JWT tokens
- API Endpoint: `/api/User/authenticate`
- Credentials stored in localStorage
- Role-based routing (Admin → /admin, Partner/User → /)
- Session persistence across page refreshes

### Admin Panel (Admin Role Only)
1. **Categories Management**
   - CRUD operations for categories
   - Fields: name, imageUrl, iconUrl, isActive
   
2. **SubCategories Management**
   - CRUD operations linked to categories
   - Fields: categoryId, name, imageUrl, iconUrl, isActive
   
3. **Partners Management**
   - Partner creation and management
   - Fields: name, email, phone, address, city, zipCode, imageUrl, isActive
   
4. **Users List**
   - Display users with their roles
   - View user information
   
5. **Partner SubCategories**
   - Manage partner-subcategory relationships
   - Cascading selection (Category → SubCategory)

### Internationalization (i18n)
- Full English and Danish language support
- Language switcher in header (EN/DA buttons)
- All UI text, labels, and messages are translated
- Uses react-i18next with browser language detection

### API Configuration
- Base URL: `https://boligmatchapi-production.up.railway.app`
- Configured in `.env` file as `VITE_API_URL`
- Axios client with automatic token attachment

## Available Scripts
- `npm run dev` - Start development server (port 5000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Setup
Create a `.env` file with:
```
VITE_API_URL=https://boligmatchapi-production.up.railway.app
```

## User Roles
1. **Admin** - Full access to admin panel (/admin)
2. **Partner** - Access to app layout (/)
3. **User** - Access to app layout (/)

## Authentication Flow
1. Navigate to `/login`
2. Enter credentials (Admin: boligadmin@gmail.com / 123456)
3. System validates and returns user info with role
4. Admin users → redirected to `/admin`
5. Other users → redirected to `/`
6. Session persists via localStorage

## API Integration
All services follow the pattern:
- GET requests for fetching data
- POST requests for creating and pagination
- PUT requests for updates
- DELETE requests for deletion

## Deployment
The application is configured to run on Replit:
- Host: 0.0.0.0
- Port: 5000
- HMR enabled for development

## Recent Changes (October 2025)

### Authentication & API
- ✅ Fixed all API endpoints to include /api prefix (auth, categories, subcategories)
- ✅ Removed dummy login fallback - now uses only real API authentication
- ✅ Updated admin credentials: boligadmin@gmail.com / 123456
- ✅ Fixed admin sidebar positioning to stick to top-left with fixed layout

### Image Upload & Storage
- ✅ Integrated DigitalOcean Spaces for image uploads using AWS SDK
- ✅ Created upload server running on port 3001 (proxied via Vite at /api/upload)
- ✅ Configured with endpoint: https://boligmatch.blr1.digitaloceanspaces.com
- ✅ Secure API keys stored in Replit secrets (DO_SPACES_ACCESS_KEY, DO_SPACES_SECRET_KEY)

### UI/UX Enhancements
- ✅ Added BoligMatch logo to Header and AdminLayout
- ✅ Implemented collapsible sidebar with smooth animations
  - Icon-only mode when collapsed
  - Full labels and user card when expanded
  - Toggle button with state persistence
- ✅ Converted language switchers from buttons to dropdowns (EN/DA)
- ✅ Enhanced Pagination component with:
  - Search input with icon
  - Page size selector (10, 25, 50, 100)
  - Smart page number display with ellipsis
  - "Showing X to Y of Z items" indicator
  - Proper zero-items handling
  - Full internationalization

### Language Localization
- ✅ Implemented database field translations for Categories and SubCategories
- ✅ Created translation mapping system (dbTranslations.ts)
- ✅ Built useDbTranslation hook for dynamic content localization
- ✅ Categories and SubCategories now display in English or Danish based on user preference
- ✅ All admin pages fully internationalized

### Data Fetching & Pagination
- ✅ Created useDebounce hook with 500ms delay for optimized search performance
- ✅ Refactored Categories page to use @tanstack/react-query with getPaginated
- ✅ Refactored SubCategories page to use @tanstack/react-query with getPaginated
- ✅ Implemented server-side pagination with debounced search functionality
- ✅ Added search input with icon, page size selector (10/25/50/100)
- ✅ Fixed query invalidation with `exact: false` for proper data refresh after mutations
- ✅ Implemented proper pagination boundary handling (minimum 1 page)
- ✅ Auto-reset to page 1 when search term changes
- ✅ All search inputs now use debouncing to reduce API calls

### Design & Branding
- ✅ Custom color scheme applied throughout:
  - Primary: #043428 (dark green)
  - Secondary: #91C73D (lime green)
  - Brand gradient backgrounds on CTAs
- ✅ Consistent styling across all admin pages
- ✅ Modern card-based layouts with shadows and rounded corners
