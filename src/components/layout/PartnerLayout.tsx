import { Outlet } from 'react-router-dom';
import ScrollToTop from '../common/ScrollToTop';

export default function PartnerLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <ScrollToTop />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
