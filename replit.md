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

### Latest Updates - Bug Fixes & Service Layer
- ✅ **Fixed API Response Handling**:
  - Updated categoryService.getAll() to transform `{output: {result}}` → array
  - Updated subCategoryService.getAll() and getByCategoryId() with proper transformation
  - Updated partnerService.getAll() with response normalization
  - Fixed partnerService.delete() to use correct http.del method
  - Resolved "categories.map is not a function" error in PartnerSubCategoriesPage
  - All getAll() methods now return arrays with fallback to []

### Admin Panel UI Improvements
- ✅ **Restructured AdminLayout**:
  - Logo positioned in top-left corner of sticky header (stays on top when scrolling)
  - Header at top (h-16) with user info and language switcher, z-index 50
  - Sidebar below header and attached to header bottom, z-index 40
  - Smaller navigation items (text-sm, py-2, w-4 h-4 icons)
  - Fixed scrolling behavior - content no longer goes under header
  
- ✅ **Consistent Sizing Across All Pages**:
  - Reduced titles: text-3xl → text-xl
  - Reduced buttons: px-6 py-3 → px-4 py-2 with text-sm
  - Updated DataTable: px-6 → px-4, py-4 → py-3, headers text-xs
  - Smaller status badges: text-xs, py-0.5
  - Smaller images: w-10 h-10
  - Smaller loading spinners: h-8 w-8
  
- ✅ **Reduced Spacing for Compact Layout**:
  - Main content padding: p-6 → p-3
  - Header cards: p-4 mb-4 → p-3 mb-3
  - More efficient use of screen space
  
- ✅ **SearchBar Component**:
  - Extracted search functionality into dedicated SearchBar component
  - Moved search input and page size selector above DataTable headers
  - Clean bordered section (`p-4 border-b border-gray-200`)
  - Simplified Pagination to only handle page navigation
  
- ✅ **Complete Localization**:
  - Added missing HomePage translations (easyManagement, secureAccess, multiLanguage)
  - Added subtitle translations for all admin pages
  - Full Danish translations for all new keys
  
- ✅ **Favicon Added**:
  - Custom SVG favicon with brand gradient (#043428 to #91C73D)
  - Updated page title to "BoligMatch"

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
- ✅ Fixed API response handling to correctly parse `{output: {result, rowCount}}` structure
- ✅ Services transform API response to normalized format for UI consumption
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
- ✅ Enhanced DataTable component with professional Tailwind styling
  - Gray header background with uppercase text
  - Hover effects and proper spacing
  - Clean visual separation between rows
- ✅ Consistent styling across all admin pages
- ✅ Modern card-based layouts with shadows and rounded corners
- ✅ Admin layout padding to prevent header overlap
