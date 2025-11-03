// components/ForgotPasswordModal.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { userService } from "../../services/user.service";

// Step 1: Email Schema
const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

// Step 2: OTP Schema
const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

// Step 3: Password Schema
const passwordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ForgotPasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

type Step = "email" | "otp" | "reset" | "success";

export default function ForgotPasswordModal({
  isOpen,
  onClose,
  onSuccess,
}: ForgotPasswordModalProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Email Form
  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
  } = useForm({
    resolver: zodResolver(emailSchema),
  });

  // OTP Form
  const {
    register: registerOtp,
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
  } = useForm({
    resolver: zodResolver(otpSchema),
  });

  // Password Form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const sendOtp = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    setError("");
    try {
      const response = await userService.generateAndSendOTPToEmail(email);
      
      if (response.message.isSuccess) {
        return true;
      } else {
        setError(response.message.output || "Failed to send OTP. Please try again.");
        return false;
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message?.output || 
        err.message ||
        "Failed to send OTP. Please check your email and try again."
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (otp: string): Promise<boolean> => {
    setIsLoading(true);
    setError("");
    try {
      const response = await userService.verifyOTP({ email, otp });
      
      if (response.isSuccess) {
        return true;
      } else {
        setError(response.errorMessage || "Invalid OTP. Please try again.");
        return false;
      }
    } catch (err: any) {
      if (err.response?.data?.errors?.email) {
        setError("Email is required for OTP verification.");
      } else if (err.response?.data?.errors?.otp) {
        setError("OTP is required for verification.");
      } else {
        setError(
          err.response?.data?.title || 
          err.message ||
          "Invalid OTP. Please try again."
        );
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    setError("");
    try {
      const response = await userService.resetUserPassword({
        email,
        newPassword
      });
      
      if (response) {
        return true;
      } else {
        setError("Failed to reset password. Please try again.");
        return false;
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message?.output || 
        err.message ||
        "Failed to reset password. Please try again."
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailStep = async (data: any) => {
    const success = await sendOtp(data.email);
    if (success) {
      setEmail(data.email);
      setStep("otp");
    }
  };

  const handleOtpStep = async (data: any) => {
    const success = await verifyOtp(data.otp);
    if (success) {
      setStep("reset");
    }
  };

  const handleResetStep = async (data: any) => {
    const success = await resetPassword(data.newPassword);
    if (success) {
      setStep("success");
      setTimeout(() => {
        onSuccess();
        onClose();
        resetModal();
      }, 2000);
    }
  };

  const resetModal = () => {
    setStep("email");
    setEmail("");
    setError("");
    setIsLoading(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  const getStepTitle = () => {
    switch (step) {
      case "email":
        return "Forgot Password";
      case "otp":
        return "Verify OTP";
      case "reset":
        return "Reset Password";
      case "success":
        return "Success!";
      default:
        return "Forgot Password";
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="w-full max-w-lg bg-white rounded-4xl shadow-xl p-8 mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            {getStepTitle()}
          </h2>
          <button
            onClick={handleClose}
            className="text-[#171717] border border-[#171717] hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* Content Area with Scroll */}
        <div 
          className="overflow-y-auto flex-1 [scrollbar-width:none] [-ms-overflow-style:none]"
          style={{ maxHeight: 'calc(90vh - 120px)' }}
        >
          <div className="min-h-full [-webkit-overflow-scrolling:touch]">
            {/* Hide scrollbar for Webkit browsers */}
            <style>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {["email", "otp", "reset", "success"].map((stepName, index) => (
                  <div key={stepName} className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-medium ${
                        step === stepName
                          ? "bg-[#004E34] text-white"
                          : index < ["email", "otp", "reset", "success"].indexOf(step)
                          ? "bg-[#004E34] text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {index + 1}
                    </div>
                    {index < 3 && (
                      <div
                        className={`w-16 h-1.5 mx-3 ${
                          index < ["email", "otp", "reset", "success"].indexOf(step)
                            ? "bg-[#004E34]"
                            : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded text-base">
                {error}
              </div>
            )}

            {/* Form Container - Added padding and width constraints */}
            <div className="px-1"> {/* Added small horizontal padding */}
              {step === "email" && (
                <form
                  onSubmit={handleEmailSubmit(handleEmailStep)}
                  className="space-y-6"
                >
                  <p className="text-gray-600 text-base leading-relaxed">
                    Enter your email address and we'll send you a verification code
                    to reset your password.
                  </p>

                  <div>
                    <label className="block text-gray-700 font-medium mb-3 text-base">
                      Email Address
                    </label>
                    <input
                      type="email"
                      {...registerEmail("email")}
                      className={`w-full border rounded-xl px-4 py-4 text-base focus:ring-2 focus:ring-[#004E34] focus:outline-none transition-colors ${
                        emailErrors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your email address"
                    />
                    {emailErrors.email && (
                      <p className="text-red-500 text-base mt-2">
                        {emailErrors.email.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#004E34] text-white py-4 rounded-xl font-bold hover:bg-[#003b27] transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-base"
                  >
                    {isLoading ? "Sending..." : "Send Verification Code"}
                  </button>
                </form>
              )}

              {step === "otp" && (
                <form
                  onSubmit={handleOtpSubmit(handleOtpStep)}
                  className="space-y-6"
                >
                  <p className="text-gray-600 text-base leading-relaxed">
                    We've sent a 6-digit verification code to{" "}
                    <strong className="text-[#004E34]">{email}</strong>. Please enter it below.
                  </p>

                  <div>
                    <label className="block text-gray-700 font-medium mb-3 text-base">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      {...registerOtp("otp")}
                      className={`w-full border rounded-xl px-4 py-4 text-center text-xl font-mono focus:ring-2 focus:ring-[#004E34] focus:outline-none transition-colors ${
                        otpErrors.otp ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="000000"
                    />
                    {otpErrors.otp && (
                      <p className="text-red-500 text-base mt-2">
                        {otpErrors.otp.message}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep("email")}
                      className="flex-1 border border-gray-300 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all duration-200 text-base"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-[#004E34] text-white py-4 rounded-xl font-bold hover:bg-[#003b27] transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-base"
                    >
                      {isLoading ? "Verifying..." : "Verify Code"}
                    </button>
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => sendOtp(email)}
                      disabled={isLoading}
                      className="text-[#0C2A92] hover:underline font-medium text-base"
                    >
                      Resend Code
                    </button>
                  </div>
                </form>
              )}

              {step === "reset" && (
                <form
                  onSubmit={handlePasswordSubmit(handleResetStep)}
                  className="space-y-6"
                >
                  <p className="text-gray-600 text-base leading-relaxed">
                    Please enter your new password below.
                  </p>

                  <div>
                    <label className="block text-gray-700 font-medium mb-3 text-base">
                      New Password
                    </label>
                    <input
                      type="password"
                      {...registerPassword("newPassword")}
                      className={`w-full border rounded-xl px-4 py-4 text-base focus:ring-2 focus:ring-[#004E34] focus:outline-none transition-colors ${
                        passwordErrors.newPassword
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter new password"
                    />
                    {passwordErrors.newPassword && (
                      <p className="text-red-500 text-base mt-2">
                        {passwordErrors.newPassword.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-3 text-base">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      {...registerPassword("confirmPassword")}
                      className={`w-full border rounded-xl px-4 py-4 text-base focus:ring-2 focus:ring-[#004E34] focus:outline-none transition-colors ${
                        passwordErrors.confirmPassword
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Confirm new password"
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-red-500 text-base mt-2">
                        {passwordErrors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep("otp")}
                      className="flex-1 border border-gray-300 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all duration-200 text-base"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-[#004E34] text-white py-4 rounded-xl font-bold hover:bg-[#003b27] transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-base"
                    >
                      {isLoading ? "Resetting..." : "Reset Password"}
                    </button>
                  </div>
                </form>
              )}

              {step === "success" && (
                <div className="text-center space-y-6 py-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <svg
                      className="w-10 h-10 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Password Reset Successful!
                  </h3>
                  <p className="text-gray-600 text-base leading-relaxed">
                    Your password has been reset successfully. You can now login
                    with your new password.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}