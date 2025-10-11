// src/components/layout/AdminLayout.tsx
import { Outlet, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import Button from '../common/Button';

export default function AdminLayout() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-2 rounded transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`;

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-900 text-white p-4 flex flex-col">
        <div className="mb-6 pb-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">{t('admin.title')}</h2>
          <p className="text-sm text-gray-400 mt-1">{user?.firstName} {user?.lastName}</p>
          <p className="text-xs text-gray-500">{user?.roleName}</p>
        </div>
        
        <nav className="flex-1 space-y-1">
          <NavLink to="/admin/categories" className={navLinkClass}>{t('nav.categories')}</NavLink>
          <NavLink to="/admin/subcategories" className={navLinkClass}>{t('nav.subcategories')}</NavLink>
          <NavLink to="/admin/partners" className={navLinkClass}>{t('nav.partners')}</NavLink>
          <NavLink to="/admin/users" className={navLinkClass}>{t('nav.users')}</NavLink>
          <NavLink to="/admin/partner-subcategories" className={navLinkClass}>{t('nav.partnerSubcategories')}</NavLink>
        </nav>

        <div className="mt-4 pt-4 border-t border-gray-700">
          <Button 
            variant="secondary" 
            onClick={() => dispatch(logout())}
            className="w-full"
          >
            {t('auth.logout')}
          </Button>
        </div>
      </aside>
      <main className="flex-1 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}
