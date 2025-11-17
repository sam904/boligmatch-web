// src/features/auth/RoleGuard.tsx
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';

export default function RoleGuard({ roles, children }: { roles: string[]; children: React.ReactNode }) {
  const storeUser = useAppSelector(s => s.auth.user);
  // Try to read user from localStorage when Redux is empty
  let bmUser: any = null;
  let bmPartner: any = null;
  try {
    const rawUser = typeof window !== 'undefined' ? localStorage.getItem('bm_user') : null;
    const rawPartner = typeof window !== 'undefined' ? localStorage.getItem('bm_partner') : null;
    if (rawUser) bmUser = JSON.parse(rawUser);
    if (rawPartner) bmPartner = JSON.parse(rawPartner);
  } catch {}
  const user = storeUser || bmUser || bmPartner;
  if (!user) return <Navigate to="/login" replace />;
  const hasRole = roles.some(r => r.toLowerCase() === (user.roleName?.toLowerCase?.() ?? ''));
  if (!hasRole) return <Navigate to="/" replace />;
  return <>{children}</>;
}