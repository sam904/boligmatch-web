import React from 'react';
import clsx from 'clsx';
import { type IconType } from 'react-icons';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: IconType;
  iconPosition?: 'left' | 'right';
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  icon: Icon,
  iconPosition = 'left',
  children,
  ...props
}: Props) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  const variants = {
    primary: 'bg-gradient-to-r from-[#1a3c34] to-[#4a7043] text-white hover:from-[#1a3c34]/95 hover:to-[#4a7043]/95 focus:ring-[#4a7043]/50 shadow-md hover:shadow-lg',
    secondary: 'bg-gradient-to-r from-[#4a7043] to-[#1a3c34] text-white hover:from-[#4a7043]/95 hover:to-[#1a3c34]/95 focus:ring-[#1a3c34]/50 shadow-md hover:shadow-lg',
    danger: 'bg-gradient-to-r from-rose-600 to-rose-700 text-white hover:from-rose-700 hover:to-rose-800 focus:ring-rose-600/50 shadow-md hover:shadow-lg',
    ghost: 'text-gray-800 bg-white/80 backdrop-blur-sm hover:bg-gray-100/90 focus:ring-gray-400/50 border border-gray-200 shadow-sm hover:shadow-md',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <button
      className={clsx(
        base,
        sizes[size],
        variants[variant],
        className,
        'relative group' // Added for hover effects
      )}
      {...props}
    >
      {/* Icon on left */}
      {Icon && iconPosition === 'left' && (
        <Icon className={clsx(iconSizes[size], 'flex-shrink-0')} />
      )}

      {/* Content with subtle animation */}
      <span className="relative transition-transform duration-300 group-hover:scale-102">
        {children}
      </span>

      {/* Icon on right */}
      {Icon && iconPosition === 'right' && (
        <Icon className={clsx(iconSizes[size], 'flex-shrink-0')} />
      )}

      {/* Subtle overlay effect on hover */}
      <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 rounded-xl transition-all duration-300" />
    </button>
  );
}








// import React from 'react';
// import clsx from 'clsx';

// type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
//   variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
//   size?: 'sm' | 'md' | 'lg';
// };

// export default function Button({ variant = 'primary', size = 'md', className, ...props }: Props) {
//   const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
//   const sizes = {
//     sm: 'px-3 py-1.5 text-xs',
//     md: 'px-4 py-2 text-sm',
//     lg: 'px-6 py-3 text-base'
//   };

//   const variants = {
//     primary: 'bg-gradient-to-r from-[#043428] to-[#91C73D] text-white hover:from-[#043428]/90 hover:to-[#91C73D]/90 focus:ring-[#91C73D] shadow-sm',
//     secondary: 'bg-gradient-to-r from-[#91C73D] to-[#043428] text-white hover:from-[#91C73D]/90 hover:to-[#043428]/90 focus:ring-[#043428] shadow-sm',
//     danger: 'bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700 focus:ring-rose-500 shadow-sm',
//     ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 border border-gray-300'
//   };
  
//   return <button className={clsx(base, sizes[size], variants[variant], className)} {...props} />;
// }