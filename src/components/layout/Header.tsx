// src/components/layout/Header.tsx
import { useState } from 'react';
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
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const currentLang = i18n.language || 'en';

  return (
    <header className="flex items-center justify-between px-6 py-3 text-white shadow-md" style={{ backgroundColor: 'var(--color-primary)' }}>
      <div className="flex items-center gap-4">
        <img src="/logo.png" alt="BoligMatch" className="h-10" />
        {user && (
          <span className="text-sm opacity-90">
            {t('common.welcome')}, {user.firstName} {user.lastName} ({user.roleName})
          </span>
        )}
      </div>
      <div className="flex gap-3 items-center">
        <div className="relative">
          <button
            onClick={() => setShowLangDropdown(!showLangDropdown)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <span className="text-sm font-medium">{currentLang.toUpperCase()}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showLangDropdown && (
            <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-lg shadow-xl overflow-hidden z-50">
              <button
                onClick={() => { i18n.changeLanguage('en'); setShowLangDropdown(false); }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                English (EN)
              </button>
              <button
                onClick={() => { i18n.changeLanguage('da'); setShowLangDropdown(false); }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Dansk (DA)
              </button>
            </div>
          )}
        </div>
        {token && (
          <Button variant="danger" onClick={handleLogout}>{t('auth.logout')}</Button>
        )}
      </div>
    </header>
  );
}
