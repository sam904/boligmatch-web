// src/app/router.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import AdminLayout from '../components/layout/AdminLayout';
import HomePage from '../pages/HomePage';
import LoginPage from '../features/auth/LoginPage';
import AuthGuard from '../features/auth/AuthGuard';
import RoleGuard from '../features/auth/RoleGuard';
import NotFound from '../pages/NotFound';

import CategoriesPage from '../features/admin/categories/CategoriesPage';
import SubCategoriesPage from '../features/admin/subcategories/SubCategoriesPage';
import PartnersPage from '../features/admin/partners/PartnersPage';
import UsersListPage from '../features/admin/users/UsersListPage';
import PartnerSubCategoriesPage from '../features/admin/partner-subcategories/PartnerSubCategoriesPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      {
        path: 'admin',
        element: (
          <AuthGuard>
            <RoleGuard roles={['admin']}>
              <AdminLayout />
            </RoleGuard>
          </AuthGuard>
        ),
        children: [
          { index: true, element: <CategoriesPage /> },
          { path: 'categories', element: <CategoriesPage /> },
          { path: 'subcategories', element: <SubCategoriesPage /> },
          { path: 'partners', element: <PartnersPage /> },
          { path: 'users', element: <UsersListPage /> },
          { path: 'partner-subcategories', element: <PartnerSubCategoriesPage /> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
