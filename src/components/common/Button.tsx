import React from 'react';
import clsx from 'clsx';
import { type IconType } from 'react-icons';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: IconType;
  iconPosition?: 'left' | 'right';
  iconSize?: string;
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  icon: Icon,
  iconPosition = 'left',
  iconSize,
  children,
  ...props
}: Props) {
const base = 'inline-flex items-center justify-center font-semibold rounded-md transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizes = {
  sm: 'px-4 py-2 text-sm gap-1.5 rounded-md min-w-[100px] h-[36px]',
  md: 'px-5 py-2.5 text-sm gap-2 rounded-md min-w-[130px] h-[42px]',
  lg: 'px-6 py-3 text-base gap-2.5 rounded-md min-w-[150px] h-[46px]',
  };

  const variants = {
    primary: 'bg-[#043428] text-white shadow-md hover:bg-[#052c1f]',
    secondary: 'bg-[#165933] text-white shadow-md hover:bg-[#134c29]',
    danger: 'bg-gradient-to-r from-rose-600 to-rose-700 text-white hover:from-rose-700 hover:to-rose-800 focus:ring-rose-600/50 shadow-md hover:shadow-lg',
    ghost: 'text-gray-800 bg-white/80 backdrop-blur-sm hover:bg-gray-100/90 focus:ring-gray-400/50 border border-gray-200 shadow-sm hover:shadow-md',
    outline: 'border border-[#165933] text-[#165933] bg-transparent hover:bg-[#165933] hover:text-white shadow-sm', // New variant for export buttons
  };

  // Default icon sizes based on button size
  const defaultIconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  // Use custom iconSize if provided, otherwise use default
  const iconClassName = iconSize || defaultIconSizes[size];

  return (
    <button
      className={clsx(
        base,
        sizes[size],
        variants[variant],
        className,
        'relative group'
      )}
      {...props}
    >
      {/* Icon on left */}
      {Icon && iconPosition === 'left' && (
        <Icon className={clsx(iconClassName, 'flex-shrink-0')} />
      )}

      {/* Content with subtle animation */}
      <span className="relative transition-transform duration-300">
        {children}
      </span>

      {/* Icon on right */}
      {Icon && iconPosition === 'right' && (
        <Icon className={clsx(iconClassName, 'flex-shrink-0')} />
      )}

      {/* Subtle overlay effect on hover */}
      <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 rounded-xl transition-all duration-300" />
    </button>
  );
}