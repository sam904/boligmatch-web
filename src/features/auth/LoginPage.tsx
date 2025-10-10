// src/features/auth/LoginPage.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { loginThunk } from './authSlice';
import Input from '../../components/common/Input';
import { Navigate, useLocation } from 'react-router-dom';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(s => s.auth.status);
  const token = useAppSelector(s => s.auth.accessToken);
  const loc = useLocation();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  if (token) return <Navigate to={ (loc.state as any)?.from?.pathname ?? '/' } replace />;

  return (
    <form
      className="max-w-sm mx-auto space-y-4 p-6 border rounded"
      onSubmit={handleSubmit(d => dispatch(loginThunk(d as any)))}
    >
      <h1 className="text-xl font-semibold">Login</h1>
      <Input label="Email" error={errors.email?.message} {...register('email')} />
      <Input label="Password" error={errors.password?.message} type="password" {...register('password')} />
      <button disabled={status === 'loading'} className="w-full py-2 rounded bg-blue-600 text-white">
        {status === 'loading' ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}
