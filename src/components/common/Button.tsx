// src/components/common/Button.tsx
import React from 'react';
import clsx from 'clsx';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger';
};

export default function Button({ variant = 'primary', className, ...props }: Props) {
  const base = 'px-4 py-2 rounded text-sm font-medium focus:outline-none disabled:opacity-50 transition-colors';
  const variants = {
    primary: 'text-white hover:opacity-90',
    secondary: 'text-white hover:opacity-90',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };
  
  const styles: React.CSSProperties = variant === 'primary' 
    ? { backgroundColor: 'var(--color-primary)' }
    : variant === 'secondary'
    ? { backgroundColor: 'var(--color-secondary)' }
    : {};
  
  return <button style={styles} className={clsx(base, variants[variant], className)} {...props} />;
}
