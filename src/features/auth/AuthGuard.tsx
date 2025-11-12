// src/features/auth/AuthGuard.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const token = useAppSelector(s => s.auth.accessToken);
  const loc = useLocation();
  // Support authentication via localStorage bm_user as well as Redux token
  let bmUser: any = null;
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('bm_user') : null;
    if (raw) bmUser = JSON.parse(raw);
  } catch {}
  const isAuthed = !!token || !!bmUser;
  if (!isAuthed) return <Navigate to="/login" state={{ from: loc }} replace />;
  return <>{children}</>;
}


