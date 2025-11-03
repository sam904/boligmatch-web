import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { loginThunk } from "./authSlice";
import { Navigate, useLocation } from "react-router-dom";
import login_cover from "../../../public/login_cover.png";
import logo_2 from "../../../public/logo_2.svg";
import { CustomCheckbox } from "../../components/common/CheckBox";
import { useState } from "react";
// import Vector from "../../../public/Vector.png";

const schema = z.object({
  userName: z.string().min(1, "Username/Email is required"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const [rememberMe, setRememberMe] = useState(false);
  const status = useAppSelector((s) => s.auth.status);
  const token = useAppSelector((s) => s.auth.accessToken);
  const user = useAppSelector((s) => s.auth.user);
  const error = useAppSelector((s) => s.auth.error);
  const loc = useLocation();

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

  if (token && user) {
    const redirectTo =
      user.roleName.toLowerCase() === "admin"
        ? "/admin"
        : user.roleName.toLowerCase() === "user"
        ? "/userProfile/profile"
        : user.roleName.toLowerCase() === "partner"
        ? "/partnerDashboard"
        : "/";
    return (
      <Navigate to={(loc.state as any)?.from?.pathname ?? redirectTo} replace />
    );
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Login Form */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 px-10 sm:px-14 md:px-24">
        {/* Centered Logo */}
        <div className="flex justify-center mb-9">
          <img
            src={logo_2}
            alt="boligmatch logo"
            className="h-16 object-contain"
          />
        </div>

        {/* Login Header - Centered */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Login</h2>
          <p className="text-gray-600 text-lg">
            Enter your Credentials to access your account
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit((data) => dispatch(loginThunk(data)))}
          className="space-y-6 max-w-md mx-auto w-full"
        >
          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm">
              Username/Email
            </label>
            <input
              type="text"
              {...register("userName")}
              className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#004E34] focus:outline-none transition-colors ${
                errors.userName ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your username or email"
            />
            {errors.userName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.userName.message}
              </p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-gray-700 font-medium mb-2 text-sm">
                Password
              </label>
              <a
                href="#"
                className="text-[#0C2A92] hover:underline font-medium text-sm"
              >
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              {...register("password")}
              className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#004E34] focus:outline-none transition-colors ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Remember + Forgot */}
          <div className="flex justify-between items-center text-sm text-gray-600">
            <label className="flex items-center">
              <CustomCheckbox
                checked={rememberMe}
                onChange={setRememberMe}
                label="Remember for 30 days"
              />
            </label>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-[#004E34] text-white py-3 rounded-lg font-bold hover:bg-[#003b27] transition-all duration-200 shadow-md"
          >
            {status === "loading" ? "Signing In..." : "Login"}
          </button>

          {/* OR Divider */}
          {/* <div className="flex items-center my-5">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500 text-sm">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div> */}

          {/* Social Login Buttons */}
          {/* <div className="flex justify-center gap-4">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Sign in with Google
            </button>
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              <img src={Vector} alt="Apple" className="w-5 h-5" />
              Sign in with Apple
            </button>
          </div> */}
        </form>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2">
        <img
          src={login_cover}
          alt="Login cover"
          className="w-full rounded-l-4xl h-screen object-cover"
        />
      </div>
    </div>
  );
}
