// src/components/layout/AppLayout.tsx
import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
