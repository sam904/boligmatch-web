import { Outlet } from 'react-router-dom';
import UserHeader from '../../features/users/UserPages/UserHeader';

export default function UserLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <UserHeader />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
