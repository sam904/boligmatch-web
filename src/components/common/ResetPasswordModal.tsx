// src/components/common/ResetPasswordModal.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import Modal from "./Modal";
import Button from "./Button";
import Input from "./Input";
import { useAppSelector } from "../../app/hooks"; // Add this back for profile context
import { userService } from "../../services/user.service";
import { useMutation } from "@tanstack/react-query";

// Password reset schema - simplified since we're using admin reset
const passwordResetSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordResetData = z.infer<typeof passwordResetSchema>;

interface ResetPasswordModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  // Make targetUser optional - if not provided, use logged-in user
  targetUser?: {
    email: string;
    firstName?: string;
    lastName?: string;
    businessName?: string;
  };
}

export default function ResetPasswordModal({
  open,
  onClose,
  onSuccess,
  targetUser, // Optional prop
}: ResetPasswordModalProps) {
  const { t } = useTranslation();
  const currentUser = useAppSelector((s) => s.auth.user); // Get logged-in user

  // Determine which user to reset password for
  const userToReset = targetUser || currentUser;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    watch,
  } = useForm<PasswordResetData>({
    resolver: zodResolver(passwordResetSchema),
  });

  const newPasswordValue = watch("newPassword");

  // Use the appropriate user email
  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { newPassword: string }) => {
      if (!userToReset?.email) throw new Error("User email not found");
      
      return await userService.resetUserPassword({
        email: userToReset.email,
        newPassword: data.newPassword,
      });
    },
    onSuccess: () => {
      if (onSuccess) onSuccess();
      onClose();
      reset();
    },
    onError: (error: Error) => {
      setError("root", {
        type: "manual",
        message: error.message || "Failed to reset password",
      });
    },
  });

  const onSubmit = async (data: PasswordResetData) => {
    await resetPasswordMutation.mutateAsync({
      newPassword: data.newPassword,
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // Determine display text based on context
  const getDisplayInfo = () => {
    if (targetUser) {
      // Admin resetting someone else's password
      return {
        title: "Reset password for:",
        email: targetUser.email,
        additionalInfo: targetUser.businessName 
          ? `Business Name: ${targetUser.businessName}`
          : `User Name: ${targetUser.firstName} ${targetUser.lastName}`,
        note: "This will reset the password immediately. They'll need to use the new password to login."
      };
    } else {
      // User resetting their own password
      return {
        title: "Reset your password:",
        email: userToReset?.email || "",
        additionalInfo: `User Name: ${userToReset?.firstName} ${userToReset?.lastName}`,
        note: "This will reset your password immediately. You'll need to use the new password to login."
      };
    }
  };

  const displayInfo = getDisplayInfo();

  return (
    <Modal
      open={open}
      title={t("auth.resetPassword") || "Reset Password"}
      onClose={handleClose}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            {displayInfo.title} <strong>{displayInfo.email}</strong>
          </p>
          {displayInfo.additionalInfo && (
            <p className="text-xs text-blue-600 mt-1">
              {displayInfo.additionalInfo}
            </p>
          )}
          <p className="text-xs text-blue-600 mt-1">
            {displayInfo.note}
          </p>
        </div>

        <Input
          label="New Password"
          type="password"
          error={errors.newPassword?.message}
          {...register("newPassword")}
          required
          placeholder="Enter new password"
          disabled={isSubmitting}
        />

        <Input
          label="Confirm New Password"
          type="password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
          required
          placeholder="Confirm new password"
          disabled={isSubmitting}
        />

        {newPasswordValue && (
          <div
            className={`text-xs p-2 rounded ${
              newPasswordValue.length >= 6
                ? "bg-green-50 text-green-700"
                : "bg-yellow-50 text-yellow-700"
            }`}
          >
            Password strength:{" "}
            {newPasswordValue.length >= 6 ? "Strong" : "Weak"}
            (min. 6 characters)
          </div>
        )}

        {errors.root && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-800 text-sm">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              {errors.root.message}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1"
            disabled={isSubmitting}
          >
            {t("common.cancel") || "Cancel"}
          </Button>
          <Button
            type="submit"
            variant="secondary"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting
              ? t("common.resetting") || "Resetting..."
              : t("auth.resetPassword") || "Reset Password"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}