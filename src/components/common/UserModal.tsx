import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { loginThunk } from "../../features/auth/authSlice";
import Modal from "./Modal";
import logo from "/src/assets/userImages/footerLogo.svg";
import { useTranslation } from "react-i18next";

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
  const status = useAppSelector((s) => s.auth.status);
  const token = useAppSelector((s) => s.auth.accessToken);
  const user = useAppSelector((s) => s.auth.user);
  const error = useAppSelector((s) => s.auth.error);
  const { t } = useTranslation();

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

  React.useEffect(() => {
    if (token && user) {
      onClose();
      if (user.roleName.toLowerCase() === "user") {
        // navigate("/userDashboard/dashboard");
      } else if (user.roleName.toLowerCase() === "partner") {
        // navigate("/partnerDashboard");
      } else {
        navigate("/");
      }
    }
  }, [token, user, onClose, navigate]);

  const onSubmit = (data: { userName: string; password: string }) => {
    dispatch(loginThunk(data));
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-md">
      <div className="bg-[#EFEFEF] rounded-lg shadow-lg w-full mx-auto">
        <div className="flex justify-center items-center p-6 pb-4 relative">
          <div className="flex items-center justify-center">
            <div className="text-2xl font-bold">
              <img
                src={logo}
                alt=""
                className="h-8 w-auto"
                style={{
                  filter:
                    "brightness(0) saturate(100%) invert(8%) sepia(100%) saturate(1000%) hue-rotate(120deg) brightness(0.3) contrast(1.2)",
                }}
              />
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute right-6 text-black hover:text-gray-600 transition-colors text-xl font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="px-6 pb-6">
          <h2 className="text-[20px] font-[800] text-[#000000] text-center">
            {t("auth.login")}
          </h2>
        </div>

        {error && (
          <div className="mx-6 mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
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

        <div className="px-6 pb-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="userName"
                className="block text-sm font-normal text-black mb-2"
              >
                {t("auth.username")}
              </label>
              <input
                id="userName"
                type="text"
                className="w-full bg-white border-0 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#075835]"
                {...register("userName")}
              />
              {errors.userName && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.userName.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-normal text-black mb-2"
              >
                {t("auth.password")}
              </label>
              <input
                id="password"
                type="password"
                className="w-full bg-white border-0 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#075835]"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-sm">
              <button
                type="button"
                className="text-black hover:text-gray-600 transition-colors font-normal cursor-pointer"
              >
                {t("auth.forgotPassword")}
              </button>
            </div>

            {/* Login Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-[#075835] hover:bg-[#064529] text-white font-normal py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>
      </div>
    </Modal>
  );
}
