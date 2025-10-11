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
        <div className="p-3 border-b border-gray-700 flex items-center gap-3">
          {!isCollapsed && <img src="/logo.png" alt="BoligMatch" className="h-8" />}
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
          <NavLink to="/admin/categories" className={navLinkClass} title={isCollapsed ? t('nav.categories') : ''}>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {!isCollapsed && <span>{t('nav.categories')}</span>}
          </NavLink>
          <NavLink to="/admin/subcategories" className={navLinkClass} title={isCollapsed ? t('nav.subcategories') : ''}>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {!isCollapsed && <span>{t('nav.subcategories')}</span>}
          </NavLink>
          <NavLink to="/admin/partners" className={navLinkClass} title={isCollapsed ? t('nav.partners') : ''}>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {!isCollapsed && <span>{t('nav.partners')}</span>}
          </NavLink>
          <NavLink to="/admin/users" className={navLinkClass} title={isCollapsed ? t('nav.users') : ''}>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {!isCollapsed && <span>{t('nav.users')}</span>}
          </NavLink>
          <NavLink to="/admin/partner-subcategories" className={navLinkClass} title={isCollapsed ? t('nav.partnerSubcategories') : ''}>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {!isCollapsed && <span>{t('nav.partnerSubcategories')}</span>}
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
            <img src="/logo.png" alt="BoligMatch" className="h-8" />
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
