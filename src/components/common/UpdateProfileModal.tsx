// src/components/common/UpdateProfileModal.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import Modal from "./Modal";
import Button from "./Button";
import Input from "./Input";
import { useAppSelector } from "../../app/hooks";
import { userService } from "../../services/user.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Simplified schema - remove isActive and status since they're not in auth user
const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  mobileNo: z
    .string()
    .min(1, "Mobile number is required")
    .refine(
      (value) => {
        if (!value) return false;
        return /^\d{8}$/.test(value);
      },
      {
        message: "Mobile number must be exactly 8 digits",
      }
    ),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface UpdateProfileModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function UpdateProfileModal({
  open,
  onClose,
  onSuccess,
}: UpdateProfileModalProps) {
  const { t } = useTranslation();
  const user = useAppSelector((s) => s.auth.user);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      mobileNo: user?.mobileNo || "",
    },
  });

  // Use the existing update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      if (!user?.userId) throw new Error("User ID not found");
      
      // Use the existing update method with user ID
      // Add default values for required fields that might be missing from auth user
      return await userService.update({
        id: user.userId,
        ...data,
        isActive: true, // Default value
        status: "Active" as const, // Default value
      });
    },
    onSuccess: () => {
      // Invalidate user queries to refresh user data
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      
      if (onSuccess) onSuccess();
      onClose();
      reset();
    },
    onError: (error: Error) => {
      setError("root", {
        type: "manual",
        message: error.message || "Failed to update profile",
      });
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    await updateProfileMutation.mutateAsync(data);
  };

  const handleClose = () => {
    reset({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      mobileNo: user?.mobileNo || "",
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      title={t("auth.updateProfile") || "Update Profile"}
      onClose={handleClose}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label={t("admin.users.firstName") || "First Name"}
          error={errors.firstName?.message}
          {...register("firstName")}
          required
          placeholder={t("admin.users.EnterfirstName") || "Enter first name"}
          disabled={isSubmitting}
        />

        <Input
          label={t("admin.users.lastName") || "Last Name"}
          error={errors.lastName?.message}
          {...register("lastName")}
          required
          placeholder={t("admin.users.EnterlastName") || "Enter last name"}
          disabled={isSubmitting}
        />

        <Input
          label={t("admin.users.email") || "Email"}
          type="email"
          error={errors.email?.message}
          {...register("email")}
          required
          placeholder={t("admin.users.Enteremailaddress") || "Enter email address"}
          disabled={isSubmitting}
        />

        <Input
          label={t("admin.users.mobileNo") || "Mobile Number"}
          error={errors.mobileNo?.message}
          {...register("mobileNo")}
          required
          placeholder={t("admin.users.EntermobileNo") || "Mobile Number"}
          maxLength={8}
          disabled={isSubmitting}
        />

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
            className="flex-1 cursor-pointer"
            disabled={isSubmitting}
          >
            {t("common.cancel") || "Cancel"}
          </Button>
          <Button
            type="submit"
            variant="secondary"
            disabled={isSubmitting}
            className="flex-1 cursor-pointer"
          >
            {isSubmitting
              ? t("common.updating") || "Updating..."
              : t("common.update") || "Update"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}