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
2. Enter credentials (default: aarti.chavan@skylynxtech.com / 123456)
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

## Recent Changes
- ✅ Implemented role-based authentication with real API
- ✅ Created comprehensive admin panel with CRUD operations
- ✅ Added i18n support for English and Danish
- ✅ Implemented session persistence
- ✅ Created responsive layouts for admin and app
- ✅ Added toast notifications for user feedback
