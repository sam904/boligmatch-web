// src/pages/HomePage.tsx
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../app/hooks';

export default function HomePage() {
  const { t } = useTranslation();
  const user = useAppSelector(s => s.auth.user);
  const token = useAppSelector(s => s.auth.accessToken);

  if (!token) {
    return (
      <div className="max-w-4xl mx-auto mt-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('home.welcomeTo')}</h1>
        <p className="text-xl text-gray-600 mb-8">{t('auth.pleaseLogin')}</p>
        <Link 
          to="/login" 
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('home.goToLogin')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        {t('home.welcomeUser', { name: user?.firstName })}
      </h1>
      <p className="text-gray-600 mb-6">
        {t('home.loggedInAs', { role: user?.roleName })}
      </p>
      
      {user?.roleName.toLowerCase() === 'admin' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">{t('home.adminDashboard')}</h2>
          <p className="text-gray-700 mb-4">{t('home.adminDashboardDesc')}</p>
          <Link 
            to="/admin" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('home.goToAdmin')}
          </Link>
        </div>
      )}
      
      {user?.roleName.toLowerCase() !== 'admin' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">{t('home.partnerDashboard')}</h2>
          <p className="text-gray-700">{t('home.partnerDashboardDesc')}</p>
        </div>
      )}
    </div>
  );
}
