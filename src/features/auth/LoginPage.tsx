// src/features/auth/LoginPage.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { loginThunk } from './authSlice';
import Input from '../../components/common/Input';
import { Navigate, useLocation } from 'react-router-dom';

const schema = z.object({
  userName: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const status = useAppSelector(s => s.auth.status);
  const token = useAppSelector(s => s.auth.accessToken);
  const user = useAppSelector(s => s.auth.user);
  const error = useAppSelector(s => s.auth.error);
  const loc = useLocation();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      userName: 'aarti.chavan@skylynxtech.com',
      password: '123456'
    }
  });

  if (token && user) {
    const redirectTo = user.roleName.toLowerCase() === 'admin' ? '/admin' : '/';
    return <Navigate to={(loc.state as any)?.from?.pathname ?? redirectTo} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        className="max-w-sm w-full mx-auto space-y-4 p-8 bg-white border rounded-lg shadow-md"
        onSubmit={handleSubmit(d => dispatch(loginThunk(d)))}
      >
        <h1 className="text-2xl font-semibold text-center">{t('auth.loginTitle')}</h1>
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}
        <Input label={t('auth.username')} error={errors.userName?.message} {...register('userName')} />
        <Input label={t('auth.password')} error={errors.password?.message} type="password" {...register('password')} />
        <button 
          disabled={status === 'loading'} 
          className="w-full py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          {status === 'loading' ? t('auth.signingIn') : t('auth.signIn')}
        </button>
      </form>
    </div>
  );
}
