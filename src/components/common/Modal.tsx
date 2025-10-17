
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
    <div className="fixed inset-0 flex items-center justify-center bg-blackz-50">
      <div className="w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          {/* <Button variant="secondary" onClick={onClose}>✕</Button> */}
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
