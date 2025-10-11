// src/components/layout/Header.tsx
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import Button from '../common/Button';

export default function Header() {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(s => s.auth.user);
  const token = useAppSelector(s => s.auth.accessToken);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 text-white shadow-md" style={{ backgroundColor: 'var(--color-primary)' }}>
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold">BoligMatch</h1>
        {user && (
          <span className="text-sm opacity-90">
            {t('common.welcome')}, {user.firstName} {user.lastName} ({user.roleName})
          </span>
        )}
      </div>
      <div className="flex gap-2 items-center">
        <Button variant="secondary" onClick={() => i18n.changeLanguage('en')}>EN</Button>
        <Button variant="secondary" onClick={() => i18n.changeLanguage('da')}>DA</Button>
        {token && (
          <Button variant="danger" onClick={handleLogout}>{t('auth.logout')}</Button>
        )}
      </div>
    </header>
  );
}
