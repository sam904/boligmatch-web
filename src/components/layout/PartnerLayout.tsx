import { Outlet } from 'react-router-dom';

export default function PartnerLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
