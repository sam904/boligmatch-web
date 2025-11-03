import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { loginThunk } from "../../features/auth/authSlice";
import ReactDOM from "react-dom";
import { useTranslation } from "react-i18next";
import loginModelLogo from "/src/assets/userImages/boligmatchLogo2.png"
import ToastBanner from "./ToastBanner";

const schema = z.object({
  userName: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

interface UserModalProps {
  open: boolean;
  onClose: () => void;
}

export default function UserModal({ open, onClose }: UserModalProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const status = useAppSelector((s) => s.auth.status);
  const token = useAppSelector((s) => s.auth.accessToken);
  const user = useAppSelector((s) => s.auth.user);
  const error = useAppSelector((s) => s.auth.error);
  const { t } = useTranslation();

  // Local toast notification state
  const [toast, setToast] = React.useState<
    | { type: "success" | "error" | "info"; message: string; id: number }
    | null
  >(null);
  const hideToast = () => setToast(null);
  // Auto-dismiss toasts after a short delay
  React.useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      userName: "",
      password: "",
    },
  });

  const hasHandledLoginRef = React.useRef(false);
  React.useEffect(() => {
    if (hasHandledLoginRef.current) return;
    if (token && user) {
      hasHandledLoginRef.current = true;
      // Show success toast before closing
      setToast({ type: "success", message: "Login successfully", id: Date.now() });
      // Persist user data
      localStorage.setItem("bm_user", JSON.stringify(user));
      localStorage.setItem("bm_access", token);
      // Navigate after a brief delay so the toast is visible
      const from = (location.state as any)?.from?.pathname;
      const to = from ?? "/profile";
      setTimeout(() => {
        onClose();
        navigate(to, { replace: true });
      }, 1000);
    }
  }, [token, user, onClose, navigate, location.state, t]);

  // Lock body scroll when the modal is open
  React.useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  const onSubmit = (data: { userName: string; password: string }) => {
    dispatch(loginThunk(data));
  };

  // Surface backend auth errors as toast notifications
  React.useEffect(() => {
    if (!error) return;
    // Try to normalize common error shapes
    let msg: string = "";
    try {
      if (typeof error === "string") msg = error;
      else if (typeof (error as any).failureReason === "string") msg = (error as any).failureReason;
      else if (typeof (error as any).errorMessage === "string") msg = (error as any).errorMessage;
      else if (typeof (error as any).message === "string") msg = (error as any).message;
      else msg = JSON.stringify(error);
    } catch {
      msg = "Login failed";
    }
    setToast({ type: "error", message: msg, id: Date.now() });
  }, [error, setToast]);

  if (!open) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[1000]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[370px] h-[444px]">
          <div className="relative rounded-[23px] bg-[#E6E7E9] shadow-2xl w-full h-full">
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 rounded-full p-1.5 text-black/80 hover:bg-black/5 hover:text-black transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 11-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
              </svg>
            </button>

            <div className="flex justify-center items-center p-6 pb-2">
              <img
                src={loginModelLogo}
                alt="Boligmatch+"
                width={144}
                height={36}
                className="select-none"
                style={{ opacity: 1, transform: "rotate(0deg)" }}
                draggable={false}
              />
            </div>

            <div className="px-6 pb-6">
              <h2 className="text-[20px] font-[800] text-[#000000] text-center">
                {t("auth.login")}
              </h2>
            </div>

            {/* Toast notifications */}
            {toast && (
              <ToastBanner
                type={toast.type}
                message={toast.message}
                onClose={hideToast}
                autoDismissMs={3000}
                fixed
              />
            )}

            <div className="px-6 pb-7">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="userName" className="block text-sm font-medium text-black mb-2">
                    {t("auth.username")}
                  </label>
                  <input
                    id="userName"
                    type="text"
                    className="w-full rounded-md bg-white px-3 py-2 shadow-inner outline-none ring-1 ring-transparent focus:ring-2 focus:ring-[#0A7B49]"
                    {...register("userName")}
                  />
                  {errors.userName && (
                    <p className="text-xs text-red-600 mt-1">{errors.userName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
                    {t("auth.password")}
                  </label>
                  <input
                    id="password"
                    type="password"
                    className="w-full rounded-md bg-white px-3 py-2 shadow-inner outline-none ring-1 ring-transparent focus:ring-2 focus:ring-[#0A7B49]"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
                  )}
                </div>

                <div className="text-sm">
                  <button type="button" className="text-black hover:text-gray-600 transition-colors font-normal cursor-pointer">
                    {t("auth.forgotPassword")}
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full rounded-lg bg-[#7CCB4A] py-3 px-4 font-medium text-white transition-colors hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === "loading" ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t("auth.signingIn")}
                      </span>
                    ) : (
                      <>{t("auth.signIn")}</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
