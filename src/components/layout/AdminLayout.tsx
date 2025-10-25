// src/components/layout/AdminLayout.tsx
import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';

export default function AdminLayout() {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
      isActive 
        ? 'bg-brand-gradient text-white shadow-md' 
        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
    } ${isCollapsed ? 'justify-center' : ''}`;

  const currentLang = i18n.language || 'en';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className={`flex-shrink-0 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} flex flex-col`}>
        <div className="p-3 border-b border-gray-700 flex items-center">
          {!isCollapsed && <img src="/logo.png" alt="BoligMatch" className="h-12" />}
          {!isCollapsed && <img src="/favIcon1.svg" alt="BoligMatch" className="h-7" />}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors ml-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isCollapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              )}
            </svg>
          </button>
        </div>
        
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {/* Dashboard */}
          <NavLink to="/admin/dashboard" className={navLinkClass} title={isCollapsed ? t('nav.dashboard') : ''}>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2zm0 8l2.5-1.5L8 15l3.5-4.5 5 6" />
            </svg>
            {!isCollapsed && <span>{t('nav.dashboard')}</span>}
          </NavLink>

          {/* Categories */}
          <NavLink to="/admin/categories" className={navLinkClass} title={isCollapsed ? t('nav.categories') : ''}>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            {!isCollapsed && <span>{t('nav.categories')}</span>}
          </NavLink>

          {/* Subcategories */}
          <NavLink to="/admin/subcategories" className={navLinkClass} title={isCollapsed ? t('nav.subcategories') : ''}>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7m14 6l-7 7-7-7" />
            </svg>
            {!isCollapsed && <span>{t('nav.subcategories')}</span>}
          </NavLink>

          {/* Partners */}
          <NavLink to="/admin/partners" className={navLinkClass} title={isCollapsed ? t('nav.partners') : ''}>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {!isCollapsed && <span>{t('nav.partners')}</span>}
          </NavLink>

          {/* Users */}
          <NavLink to="/admin/users" className={navLinkClass} title={isCollapsed ? t('nav.users') : ''}>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {!isCollapsed && <span>{t('nav.users')}</span>}
          </NavLink>
        </nav>

        <div className="p-3 border-t border-gray-700">
          <button
            onClick={() => dispatch(logout())}
            className={`w-full flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm ${isCollapsed ? 'justify-center' : 'justify-center'}`}
            title={isCollapsed ? t('auth.logout') : ''}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!isCollapsed && <span>{t('auth.logout')}</span>}
          </button>
        </div>
      </aside>

      {/* Right Side: Header + Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 h-16 bg-gradient-to-r from-[#043428] to-[#065945] text-white shadow-lg flex items-center px-6 justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold">{t('admin.title')}</h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded-lg transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                <span>{currentLang.toUpperCase()}</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            {/* User Info */}
            <div className="flex items-center gap-3 px-3 py-1.5 bg-white/10 rounded-lg">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-300">{user?.roleName}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 bg-gray-50 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}