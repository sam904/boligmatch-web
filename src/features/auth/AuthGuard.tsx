// src/features/auth/AuthGuard.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const token = useAppSelector(s => s.auth.accessToken);
  const loc = useLocation();
  // Support authentication via localStorage bm_user / bm_partner as well as Redux token
  let bmUser: any = null;
  let bmPartner: any = null;
  try {
    const rawUser = typeof window !== 'undefined' ? localStorage.getItem('bm_user') : null;
    const rawPartner = typeof window !== 'undefined' ? localStorage.getItem('bm_partner') : null;
    if (rawUser) bmUser = JSON.parse(rawUser);
    if (rawPartner) bmPartner = JSON.parse(rawPartner);
  } catch {}
  const isAuthed = !!token || !!bmUser || !!bmPartner;
  if (!isAuthed) return <Navigate to="/login" state={{ from: loc }} replace />;
  return <>{children}</>;
}


