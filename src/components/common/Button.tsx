// src/components/common/Button.tsx
import React from 'react';
import clsx from 'clsx';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
};

export default function Button({ variant = 'primary', size = 'md', className, ...props }: Props) {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variants = {
    primary: 'bg-gradient-to-r from-[#043428] to-[#91C73D] text-white hover:from-[#043428]/90 hover:to-[#91C73D]/90 focus:ring-[#91C73D] shadow-sm',
    secondary: 'bg-gradient-to-r from-[#91C73D] to-[#043428] text-white hover:from-[#91C73D]/90 hover:to-[#043428]/90 focus:ring-[#043428] shadow-sm',
    danger: 'bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700 focus:ring-rose-500 shadow-sm',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 border border-gray-300'
  };
  
  return <button className={clsx(base, sizes[size], variants[variant], className)} {...props} />;
}