// src/components/layout/AppLayout.tsx
import { Outlet } from 'react-router-dom';
import ScrollToTop from '../common/ScrollToTop';
// import Header from './Header';

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <ScrollToTop />
      {/* <Header /> */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
