// src/features/auth/AuthGuard.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const token = useAppSelector(s => s.auth.accessToken);
  const loc = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: loc }} replace />;
  return <>{children}</>;
}


