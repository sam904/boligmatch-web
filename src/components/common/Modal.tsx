// src/components/common/Modal.tsx
import type { ReactNode } from "react";

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
  title,
  onClose,
  children,
  maxHeight = "85vh",
  maxWidth = "max-w-4xl",
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div
        className={`w-full ${maxWidth} bg-white rounded-4xl shadow-xl p-7 mx-4`}
        style={{ maxHeight: maxHeight }}
      >
        <div className="flex justify-between items-center mb-4">
          {title && <h2 className="text-xl font-semibold">{title}</h2>}
          <button
            onClick={onClose}
            className="text-[#171717] border border-[#171717] hover:bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
        <div
          className="overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none]"
          style={{ maxHeight: `calc(${maxHeight} - 100px)` }}
        >
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
