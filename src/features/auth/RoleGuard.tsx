// src/features/auth/RoleGuard.tsx
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';

export default function RoleGuard({ roles, children }: { roles: string[]; children: React.ReactNode }) {
  const user = useAppSelector(s => s.auth.user);
  if (!user) return <Navigate to="/login" replace />;
  const hasRole = user.roles?.some(r => roles.includes(r));
  if (!hasRole) return <Navigate to="/" replace />;
  return <>{children}</>;
}