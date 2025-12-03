import React from "react";
import { toast } from "react-toastify";

export type ToastType = "success" | "error" | "info";

interface ToastBannerProps {
  type?: ToastType;
  message: string;
  onClose?: () => void;
  autoDismissMs?: number;
  className?: string;
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
        (fixed ? "fixed top-3 right-3 z-[1200] w-[322px] " : "") +
        className
      }
      role="status"
      aria-live="assertive"
      style={fixed ? { height: "54px" } : {}}
    >
      <div
        className={`pointer-events-auto flex items-center justify-between rounded-2xl px-4 h-[54px] w-[322px] shadow-lg ${baseColors}`}
      >
        <div className="flex items-center gap-3 w-full">
          <span className="inline-flex items-center justify-center bg-transparent flex-shrink-0">
            {type === "success" && (
              <svg
                width="35"
                height="35"
                viewBox="0 0 42 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_405_4112)">
                  <path
                    d="M15.8308 25.81C12.2008 22.65 8.99084 18.6 5.35084 15.39C4.85545 14.9059 4.56755 14.2483 4.54795 13.5559C4.52834 12.8636 4.77856 12.1907 5.24577 11.6793C5.71298 11.168 6.36061 10.8582 7.05193 10.8154C7.74325 10.7727 8.42414 11.0002 8.95084 11.45L18.3508 20.68L36.9508 2.11001C37.4529 1.64321 38.1163 1.38913 38.8017 1.40113C39.4872 1.41314 40.1413 1.6903 40.6266 2.1744C41.112 2.65849 41.3909 3.31185 41.4048 3.99724C41.4186 4.68264 41.1663 5.34672 40.7008 5.85001L20.1508 26.4C18.2308 27.79 17.3508 27.11 15.8308 25.81Z"
                    fill="white"
                  />
                  <path
                    d="M17.54 34.58C26.9509 34.58 34.58 26.9509 34.58 17.54C34.58 8.12907 26.9509 0.5 17.54 0.5C8.12907 0.5 0.5 8.12907 0.5 17.54C0.5 26.9509 8.12907 34.58 17.54 34.58Z"
                    stroke="white"
                    strokeMiterlimit="10"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_405_4112">
                    <rect width="41.33" height="35.07" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            )}
            {type === "info" && (
              <svg
                width="35"
                height="35"
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_405_4138)">
                  <path
                    d="M17.54 34.58C26.9509 34.58 34.58 26.9509 34.58 17.54C34.58 8.12907 26.9509 0.5 17.54 0.5C8.12907 0.5 0.5 8.12907 0.5 17.54C0.5 26.9509 8.12907 34.58 17.54 34.58Z"
                    stroke="white"
                    strokeMiterlimit="10"
                  />
                  <path
                    d="M17.5402 11.04C16.7532 11.0269 16.0029 10.705 15.4511 10.1438C14.8993 9.58264 14.5901 8.82705 14.5902 8.03999C14.5843 7.64878 14.6604 7.26067 14.8137 6.90068C14.967 6.5407 15.194 6.21684 15.4802 5.94999C16.0291 5.40467 16.7714 5.09862 17.5452 5.09862C18.3189 5.09862 19.0612 5.40467 19.6102 5.94999C19.9882 6.371 20.2395 6.89034 20.335 7.44805C20.4305 8.00577 20.3663 8.57912 20.1499 9.10192C19.9334 9.62472 19.5736 10.0757 19.1118 10.4027C18.65 10.7297 18.1052 10.9194 17.5402 10.95V11.04ZM14.9302 29.93V13.18H20.1502V29.93H14.9302Z"
                    fill="white"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_405_4138">
                    <rect width="35.07" height="35.07" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            )}
            {type === "error" && (
              <svg
                width="35"
                height="35"
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_405_4142)">
                  <path
                    d="M17.54 34.58C26.9509 34.58 34.58 26.9509 34.58 17.54C34.58 8.12907 26.9509 0.5 17.54 0.5C8.12907 0.5 0.5 8.12907 0.5 17.54C0.5 26.9509 8.12907 34.58 17.54 34.58Z"
                    stroke="white"
                    strokeMiterlimit="10"
                  />
                  <path
                    d="M17.5493 29.52C17.1392 29.5252 16.7323 29.4462 16.3539 29.288C15.9755 29.1297 15.6336 28.8956 15.3493 28.6C15.0622 28.3186 14.8346 27.9824 14.68 27.6114C14.5254 27.2403 14.4469 26.842 14.4493 26.44C14.457 25.6273 14.7827 24.8499 15.3565 24.2742C15.9302 23.6986 16.7066 23.3704 17.5193 23.36C17.9215 23.3581 18.3199 23.4388 18.6897 23.597C19.0595 23.7553 19.3929 23.9877 19.6693 24.28C19.9563 24.5614 20.1839 24.8976 20.3386 25.2686C20.4932 25.6397 20.5716 26.038 20.5693 26.44C20.5716 26.842 20.4932 27.2403 20.3386 27.6114C20.1839 27.9824 19.9563 28.3186 19.6693 28.6C19.3964 28.8886 19.0678 29.1189 18.7035 29.277C18.3391 29.4352 17.9465 29.5178 17.5493 29.52ZM15.0393 20.98L14.6393 5.55H20.4293L20.0293 20.98H15.0393Z"
                    fill="white"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_405_4142">
                    <rect width="35.07" height="35.07" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            )}
          </span>
          <span className="font-medium text-sm leading-tight flex-1 pr-2">
            {message}
          </span>
          <button
            onClick={() => setOpen(false)}
            className="cursor-pointer rounded-md p-1 hover:bg-white/10 transition-colors flex-shrink-0"
            aria-label="Close notification"
          >
            <svg
              width="15"
              height="17"
              viewBox="0 0 15 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_405_4119)">
                <path
                  d="M0 17L6.6524 7.66018L12.0719 0.0254448H14.9486L8.42465 8.93263L2.92808 17.0254L0 17ZM12.0719 17L6.57534 8.90719L0.051371 0H2.92808L8.37328 7.63473L15 16.9745L12.0719 17Z"
                  fill="white"
                />
              </g>
              <defs>
                <clipPath id="clip0_405_4119">
                  <rect width="15" height="17" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Keep all your existing toast helper functions
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