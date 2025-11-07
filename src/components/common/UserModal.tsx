import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { loginThunk } from "../../features/auth/authSlice";
import ReactDOM from "react-dom";
import { useTranslation } from "react-i18next";
import loginModelLogo from "/src/assets/userImages/boligmatchLogo2.png";
import axios from "axios";
import { toast } from "react-toastify";

const schema = z.object({
  userName: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

interface UserModalProps {
  open: boolean;
  onClose: () => void;
  redirectTo?: string;
}

export default function UserModal({ open, onClose, redirectTo }: UserModalProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const status = useAppSelector((s) => s.auth.status);
  const token = useAppSelector((s) => s.auth.accessToken);
  const user = useAppSelector((s) => s.auth.user);
  const error = useAppSelector((s) => s.auth.error);
  const { t } = useTranslation();

  const [mode, setMode] = useState<"login" | "forgot-email" | "otp" | "reset">(
    "login"
  );
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  const [newPassword, setNewPassword] = useState("");
  const [fpLoading, setFpLoading] = useState(false);
  const [fpError, setFpError] = useState<string | null>(null);

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
    if (!open) return;
    if (hasHandledLoginRef.current) return;
    if (token && user) {
      hasHandledLoginRef.current = true;
      onClose();
      localStorage.setItem("bm_user", JSON.stringify(user));
      localStorage.setItem("bm_access", token);
      toast.success("Login successful!");

      const from = (location.state as any)?.from?.pathname;
      const target = redirectTo ?? from ?? "/profile";
      navigate(target, { replace: true });
    }
  }, [token, user, onClose, navigate, open, redirectTo]);

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

  const handleForgotClick = () => {
    setMode("forgot-email");
    setFpError(null);
  };

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFpLoading(true);
    setFpError(null);
    try {
      await axios.get(
        `https://boligmatch-api-mhqy4.ondigitalocean.app/api/Password/generateAndSendOTPToEmail/${encodeURIComponent(
          email
        )}`
      );
      setMode("otp");
      toast.success("OTP sent successfully to your email!");
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to send OTP";
      setFpError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setFpLoading(false);
    }
  };

  const onOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
    if (!value && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      setFpError("Enter 6-digit OTP");
      toast.error("Enter 6-digit OTP");
      return;
    }
    setFpLoading(true);
    setFpError(null);
    try {
      await axios.post(
        "https://boligmatch-api-mhqy4.ondigitalocean.app/api/User/emailOTPVerification",
        null,
        { params: { email, otp: Number(code) } }
      );
      setMode("reset");
      toast.success("OTP verified successfully!");
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Invalid OTP";
      setFpError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setFpLoading(false);
    }
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      setFpError("Enter new password");
      toast.error("Enter new password");
      return;
    }
    setFpLoading(true);
    setFpError(null);
    try {
      await axios.post(
        "https://boligmatch-api-mhqy4.ondigitalocean.app/api/Password/resetPassword",
        {
          email: email,
          otp: 0,
          newPassword: newPassword,
          hash: "",
          salt: "",
        }
      );
      toast.success("Password updated successfully!");
      onClose();
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message || "Failed to update password";
      setFpError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setFpLoading(false);
    }
  };

  if (!open) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[1000]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[370px]">
          <div className="relative rounded-[23px] bg-[#E6E7E9] shadow-2xl w-full">
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 rounded-full p-1.5 text-black/80 hover:bg-black/5 hover:text-black transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6"
              >
                <path
                  fillRule="evenodd"
                  d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 11-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                  clipRule="evenodd"
                />
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
                {mode === "login"
                  ? t("auth.login")
                  : mode === "forgot-email"
                  ? "Forgot Password"
                  : mode === "otp"
                  ? "Verify OTP"
                  : "Reset Password"}
              </h2>
            </div>

            {mode === "login" && error && (
              <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            <div className="px-6 pb-7">
              {mode === "login" && (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label
                      htmlFor="userName"
                      className="block text-sm font-medium text-black mb-2"
                    >
                      {t("auth.username")}
                    </label>
                    <input
                      id="userName"
                      type="text"
                      className="w-full rounded-md bg-white px-3 py-2 shadow-inner outline-none ring-1 ring-transparent focus:ring-2 focus:ring-[#0A7B49]"
                      {...register("userName")}
                    />
                    {errors.userName && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.userName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-black mb-2"
                    >
                      {t("auth.password")}
                    </label>
                    <input
                      id="password"
                      type="password"
                      className="w-full rounded-md bg-white px-3 py-2 shadow-inner outline-none ring-1 ring-transparent focus:ring-2 focus:ring-[#0A7B49]"
                      {...register("password")}
                    />
                    {errors.password && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="text-sm">
                    <button
                      type="button"
                      onClick={handleForgotClick}
                      className="text-black hover:text-gray-600 transition-colors font-normal cursor-pointer"
                    >
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
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          {t("auth.signingIn")}
                        </span>
                      ) : (
                        <>{t("auth.signIn")}</>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {mode === "forgot-email" && (
                <form onSubmit={sendOtp} className="space-y-4">
                  {fpError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                      {fpError}
                    </div>
                  )}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-black mb-2"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-md bg-white px-3 py-2 shadow-inner outline-none ring-1 ring-transparent focus:ring-2 focus:ring-[#0A7B49]"
                      required
                    />
                  </div>
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={fpLoading}
                      className="w-full rounded-lg bg-[#7CCB4A] py-3 px-4 font-medium text-white transition-colors hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {fpLoading ? "Sending..." : "Send OTP"}
                    </button>
                  </div>
                </form>
              )}

              {mode === "otp" && (
                <form onSubmit={verifyOtp} className="space-y-4">
                  {fpError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                      {fpError}
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    {otp.map((d, i) => (
                      <input
                        key={i}
                        ref={otpRefs[i]}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={d}
                        onChange={(e) => onOtpChange(i, e.target.value)}
                        className="w-10 h-12 text-center rounded-md bg-white px-2 py-2 shadow-inner outline-none ring-1 ring-transparent focus:ring-2 focus:ring-[#0A7B49]"
                      />
                    ))}
                  </div>
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={fpLoading}
                      className="w-full rounded-lg bg-[#7CCB4A] py-3 px-4 font-medium text-white transition-colors hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {fpLoading ? "Verifying..." : "Verify OTP"}
                    </button>
                  </div>
                </form>
              )}

              {mode === "reset" && (
                <form onSubmit={updatePassword} className="space-y-4">
                  {fpError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                      {fpError}
                    </div>
                  )}
                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-medium text-black mb-2"
                    >
                      New Password
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-md bg-white px-3 py-2 shadow-inner outline-none ring-1 ring-transparent focus:ring-2 focus:ring-[#0A7B49]"
                      required
                    />
                  </div>
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={fpLoading}
                      className="w-full rounded-lg bg-[#7CCB4A] py-3 px-4 font-medium text-white transition-colors hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {fpLoading ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
