// src/features/auth/RoleGuard.tsx
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';

export default function RoleGuard({ roles, children }: { roles: string[]; children: React.ReactNode }) {
  const storeUser = useAppSelector(s => s.auth.user);
  // Try to read user from localStorage when Redux is empty
  let bmUser: any = null;
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('bm_user') : null;
    if (raw) bmUser = JSON.parse(raw);
  } catch {}
  const user = storeUser || bmUser;
  if (!user) return <Navigate to="/login" replace />;
  const hasRole = roles.some(r => r.toLowerCase() === (user.roleName?.toLowerCase?.() ?? ''));
  if (!hasRole) return <Navigate to="/" replace />;
  return <>{children}</>;
}