import React from "react";
import { toast } from "react-toastify";

export type ToastType = "success" | "error" | "info";

interface ToastBannerProps {
  type?: ToastType;
  message: string;
  onClose?: () => void;
  autoDismissMs?: number;
  className?: string;
  // If you ever want to place it inline, set fixed=false
  fixed?: boolean;
}

export default function ToastBanner({
  type = "info",
  message,
  onClose,
  autoDismissMs = 3000,
  className = "",
  fixed = true,
}: ToastBannerProps) {
  const [open, setOpen] = React.useState(true);

  React.useEffect(() => {
    if (!autoDismissMs) return;
    const id = setTimeout(() => setOpen(false), autoDismissMs);
    return () => clearTimeout(id);
  }, [autoDismissMs]);

  React.useEffect(() => {
    if (!open && onClose) onClose();
  }, [open, onClose]);

  if (!open) return null;

  const baseColors =
    type === "success"
      ? "bg-[#95C11F] text-white"
      : type === "error"
        ? "bg-[#9CA3AF] text-white"
        : "bg-[#165933] text-white";

  return (
    <div
      className={
        (fixed ? "fixed top-3 right-3 z-[1200] w-[300px] sm:w-[360px] " : "") +
        className
      }
      role="status"
      aria-live="assertive"
    >
      <div
        className={
          `pointer-events-auto flex items-center justify-between rounded-full px-5 py-3 shadow-lg ${baseColors}`
        }
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-transparent border-2 border-white">
            {type === "success" && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {type === "info" && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8h.01M11 12h1v4m0 6a10 10 0 110-20 10 10 0 010 20z" />
              </svg>
            )}
            {type === "error" && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M12 2a10 10 0 110 20 10 10 0 010-20z" />
              </svg>
            )}
          </span>
          <span className="font-bold text-base leading-none">{message}</span>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="cursor-pointer rounded-md p-1 transition-colors"
          aria-label="Close notification"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export const showRecommendationSuccessToast = (message: string = "Recommandation Sent Succesfully!!") =>
  toast(<ToastBanner type="success" message={message} fixed={false} />, {
    closeButton: false,
    hideProgressBar: true,
    className: "bg-transparent shadow-none p-0",
    style: { background: "transparent", boxShadow: "none" },
  });

export const showRecommendationErrorToast = (message: string = "Failed to Send Recommandation") =>
  toast(<ToastBanner type="error" message={message} fixed={false} />, {
    closeButton: false,
    hideProgressBar: true,
    className: "bg-transparent shadow-none p-0",
    style: { background: "transparent", boxShadow: "none" },
  });

export const showContactSuccessToast = (message: string = "Message sent successfully") =>
  toast(<ToastBanner type="success" message={message} fixed={false} />, {
    closeButton: false,
    hideProgressBar: true,
    className: "bg-transparent shadow-none p-0",
    style: { background: "transparent", boxShadow: "none" },
  });

export const showContactErrorToast = (message: string = "Failed to send message. Please try again.") =>
  toast(<ToastBanner type="error" message={message} fixed={false} />, {
    closeButton: false,
    hideProgressBar: true,
    className: "bg-transparent shadow-none p-0",
    style: { background: "transparent", boxShadow: "none" },
  });

export const showFavouriteSuccessToast = (message: string = "Added to favourites") =>
  toast(<ToastBanner type="success" message={message} fixed={false} />, {
    closeButton: false,
    hideProgressBar: true,
    className: "bg-transparent shadow-none p-0",
    style: { background: "transparent", boxShadow: "none" },
  });

export const showFavouriteErrorToast = (message: string = "Failed to add to favourites. Please try again.") =>
  toast(<ToastBanner type="error" message={message} fixed={false} />, {
    closeButton: false,
    hideProgressBar: true,
    className: "bg-transparent shadow-none p-0",
    style: { background: "transparent", boxShadow: "none" },
  });

export const showSignupSuccessToast = (message: string = "Registration successful! Welcome to Boligmatch+.") =>
  toast(<ToastBanner type="success" message={message} fixed={false} />, {
    closeButton: false,
    hideProgressBar: true,
    className: "bg-transparent shadow-none p-0",
    style: { background: "transparent", boxShadow: "none" },
  });

export const showSignupErrorToast = (message: string = "Registration failed") =>
  toast(<ToastBanner type="error" message={message} fixed={false} />, {
    closeButton: false,
    hideProgressBar: true,
    className: "bg-transparent shadow-none p-0",
    style: { background: "transparent", boxShadow: "none" },
  });
