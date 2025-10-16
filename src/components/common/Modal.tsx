// src/components/common/Modal.tsx
import type { ReactNode } from 'react';
import Button from './Button';

type Props = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
};

export default function Modal({ open, title, onClose, children }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-4">
          {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="w-8 h-8 p-0 rounded-lg hover:bg-gray-100"
          >
            ✕
          </Button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}