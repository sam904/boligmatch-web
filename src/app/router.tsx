// src/app/router.tsx
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import AdminLayout from '../components/layout/AdminLayout';
import HomePage from '../pages/HomePage';
import LoginPage from '../features/auth/LoginPage';
import UsersPage from '../features/users/UsersPage';
import AuthGuard from '../features/auth/AuthGuard';
import RoleGuard from '../features/auth/RoleGuard';
import NotFound from '../pages/NotFound';

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
          { path: 'users', element: <UsersPage /> },
          // Stub pages you can add later:
          { path: 'categories', element: <div>Categories Admin</div> },
          { path: 'conversations', element: <div>Conversations Admin</div> },
          { path: 'favourites', element: <div>Favourites Admin</div> },
          { path: 'files', element: <div>Files Admin</div> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
