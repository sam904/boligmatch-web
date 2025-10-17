// // src/components/common/Select.tsx
// import { forwardRef } from 'react';
// import type { SelectHTMLAttributes } from 'react';
// import { clsx } from 'clsx';

// interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
//   label?: string;
//   error?: string;
// }

// const Select = forwardRef<HTMLSelectElement, SelectProps>(
//   ({ label, error, className, children, ...props }, ref) => {
//     return (
//       <div className="w-full">
//         {label && (
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             {label}
//           </label>
//         )}
//         <select
//           ref={ref}
//           className={clsx(
//             'w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900',
//             'focus:outline-none focus:ring-2 focus:ring-[#91C73D]/20 focus:border-[#91C73D]',
//             'transition-colors duration-200',
//             'disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed',
//             error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
//             className
//           )}
//           {...props}
//         >
//           {children}
//         </select>
//         {error && (
//           <p className="mt-2 text-sm text-rose-600">{error}</p>
//         )}
//       </div>
//     );
//   }
// );

// Select.displayName = 'Select';

// export default Select;





// src/components/common/Select.tsx
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: React.ReactNode;
}

export default function Select({ label, error, className = '', children, ...props }: SelectProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}