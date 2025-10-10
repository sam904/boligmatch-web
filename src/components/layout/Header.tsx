// src/components/layout/Header.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../common/Button';

export default function Header() {
  const { t, i18n } = useTranslation();
  return (
    <header className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b">
      <h1 className="font-semibold">{t('welcome')}</h1>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => i18n.changeLanguage('en')}>EN</Button>
        <Button variant="secondary" onClick={() => i18n.changeLanguage('da')}>DA</Button>
      </div>
    </header>
  );
}
