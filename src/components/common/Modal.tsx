// src/components/common/Modal.tsx
import type { ReactNode } from 'react';
// import Button from './Button';

type Props = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
  maxHeight?: string;
  maxWidth?: string;
};

export default function Modal({ 
  open, 
  onClose,
  children, 
  maxHeight = "85vh", 
  maxWidth = "max-w-4xl" 
}: Props) {
  if (!open) return null;
  
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
      onClick={onClose}
    >
      <div 
        className={`w-full ${maxWidth} rounded-lg shadow-xl p-6 mx-4`} 
        style={{ maxHeight: maxHeight }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none]" style={{ maxHeight: `calc(${maxHeight} - 100px)` }}>
          <div className="[-webkit-overflow-scrolling:touch]">
            {/* Hide scrollbar for Webkit browsers */}
            <style>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}