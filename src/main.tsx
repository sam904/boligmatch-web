// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './app/router';
import CookieConsent from './components/common/CookieConsent';
import './styles/index.css';
import './lib/i18n';

import { Provider } from 'react-redux';
import { store } from './app/store';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Toaster } from 'sonner';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Toaster position="top-right" richColors />
        <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnHover />
        <AppRouter />
        <CookieConsent />
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);
