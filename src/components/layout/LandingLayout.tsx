import { Outlet } from 'react-router-dom';

export default function LandingLayout() {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  );
}
