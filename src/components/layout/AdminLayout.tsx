// src/components/layout/AdminLayout.tsx
import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-900 text-white p-4 space-y-2">
        <NavLink to="/admin/categories" className="block px-2 py-1 rounded hover:bg-gray-700">Categories</NavLink>
        <NavLink to="/admin/conversations" className="block px-2 py-1 rounded hover:bg-gray-700">Conversations</NavLink>
        <NavLink to="/admin/favourites" className="block px-2 py-1 rounded hover:bg-gray-700">Favourites</NavLink>
        <NavLink to="/admin/users" className="block px-2 py-1 rounded hover:bg-gray-700">Users</NavLink>
        <NavLink to="/admin/files" className="block px-2 py-1 rounded hover:bg-gray-700">Files</NavLink>
      </aside>
      <main className="flex-1 p-6 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}
