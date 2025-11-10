import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { testimonialService } from "../../../services/testimonial.service";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import AdminToast from "../../../components/common/AdminToast";
import type { AdminToastType } from "../../../components/common/AdminToast";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { IconPlus,} from "../../../components/common/Icons/Index";
import { useParams } from "react-router-dom"; // Add useParams
import ToggleSwitch from "../../../components/common/ToggleSwitch";
import type { TestimonialDto } from "../../../types/testimonial";

// Form data type
type TestimonialFormData = {
  partnerId: number;
  rating: number;
  test: string;
  customerName: string;
  note: string;
  isDisplayed: boolean;
  isActive: boolean;
};

// Toast state interface
interface ToastState {
  id: string;
  type: AdminToastType;
  message: string;
  title?: string;
  subtitle?: string;
  open: boolean;
}

export default function TestimonialFormPage() {
  const { t } = useTranslation();
  const { partnerId } = useParams(); // Get partnerId from URL parameters
  const queryClient = useQueryClient();
  const [toasts, setToasts] = useState<ToastState[]>([]);

  // Toast management functions
  const showToast = (
    type: AdminToastType,
    message: string,
    title?: string,
    subtitle?: string
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastState = {
      id,
      type,
      message,
      title,
      subtitle,
      open: true,
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  };

  const hideToast = (id: string) => {
    setToasts((prev) =>
      prev.map((toast) => (toast.id === id ? { ...toast, open: false } : toast))
    );

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 300);
  };

  const toast = {
    success: (message: string, title?: string, subtitle?: string) =>
      showToast("success", message, title, subtitle),
    error: (message: string, title?: string, subtitle?: string) =>
      showToast("error", message, title, subtitle),
    info: (message: string, title?: string, subtitle?: string) =>
      showToast("info", message, title, subtitle),
  };

  // Helper function to extract error message
  const getErrorMessage = (error: unknown, defaultMessage: string): string => {
    if (typeof error === "string") return error;
    if (error instanceof Error) return error.message;
    if (typeof error === "object" && error !== null) {
      const apiError = error as any;
      return (
        apiError?.message || apiError?.response?.data?.message || defaultMessage
      );
    }
    return defaultMessage;
  };

  // Form setup without Zod
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
    reset,
    watch,
    setError,
    clearErrors,
    trigger,
  } = useForm<TestimonialFormData>({
    mode: "onChange",
    defaultValues: {
      partnerId: 0,
      rating: 5,
      test: "",
      customerName: "",
      note: "",
      isDisplayed: true,
      isActive: true,
    },
  });

  const isDisplayedValue = watch("isDisplayed");
  const isActiveValue = watch("isActive");
  const ratingValue = watch("rating");
  const customerNameValue = watch("customerName");
  const testValue = watch("test");
  const partnerIdValue = watch("partnerId");

  // Set partnerId from URL parameter when component mounts
  useEffect(() => {
    if (partnerId) {
      const parsedPartnerId = parseInt(partnerId, 10);
      if (!isNaN(parsedPartnerId)){
        setValue("partnerId", parsedPartnerId, { shouldValidate: true });
      }
    }
  }, [partnerId, setValue]);

  // Manual validation
  const validateForm = (data: TestimonialFormData): boolean => {
    const newErrors: Partial<Record<keyof TestimonialFormData, string>> = {};

    if (!data.customerName || data.customerName.trim() === "") {
      newErrors.customerName = "Customer name is required";
    }

    if (!data.partnerId || data.partnerId <= 0) {
      newErrors.partnerId = "Partner Name is required";
    }

    if (!data.rating || data.rating < 1 || data.rating > 5) {
      newErrors.rating = "Rating must be between 1 and 5";
    }

    if (!data.test || data.test.trim() === "") {
      newErrors.test = "Testimonial text is required";
    }

    // Clear existing errors
    clearErrors();
    
    // Set new errors
    Object.keys(newErrors).forEach((key) => {
      setError(key as keyof TestimonialFormData, {
        type: "manual",
        message: newErrors[key as keyof TestimonialFormData],
      });
    });

    return Object.keys(newErrors).length === 0;
  };

  // Create testimonial mutation
  const createMutation = useMutation({
    mutationFn: async (data: TestimonialFormData) => {
      try {
        const submissionData: TestimonialDto = {
          partnerId: data.partnerId,
          rating: data.rating,
          test: data.test,
          customerName: data.customerName,
          note: data.note,
          isDisplayed: data.isDisplayed,
          isActive: data.isActive,
        };
        
        return await testimonialService.add(submissionData);
      } catch (error) {
        const errorMessage = getErrorMessage(error, "Failed to create testimonial");
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"], exact: false });
      toast.success(
        t("admin.testimonials.createSuccess") || "Testimonial created successfully"
      );
      reset();
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(error, "Failed to create testimonial");
      toast.error(errorMessage);
    },
  });

  // Form submission handler
  const onSubmit: SubmitHandler<TestimonialFormData> = async (data) => {
    if (!validateForm(data)) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    try {
      await createMutation.mutateAsync(data);
    } catch (error) {
      // Error handling is done in the mutation onError
      console.error("Form submission error:", error);
    }
  };

 

  const handleReset = () => {
    reset();
    clearErrors();
    // Re-set the partnerId after reset if it exists
    if (partnerId) {
      const parsedPartnerId = parseInt(partnerId, 10);
      if (!isNaN(parsedPartnerId)) {
        setValue("partnerId", parsedPartnerId, { shouldValidate: true });
      }
    }
  };

  // Update validation when fields change
  useEffect(() => {
    trigger();
  }, [customerNameValue, partnerIdValue, ratingValue, testValue, trigger]);

  return (
    <div className="p-6">
      {/* Render Toast Banners */}
      {toasts.map((toastItem) => (
        <AdminToast
          key={toastItem.id}
          type={toastItem.type}
          message={toastItem.message}
          onClose={() => hideToast(toastItem.id)}
          autoDismissMs={5000}
        />
      ))}

      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
        
          <h1 className="text-2xl font-bold text-gray-900">
            {t("admin.testimonials.addTestimonial") || "Add New Testimonial"}
          </h1>
        </div>
      </div>

      {/* Testimonial Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Name */}
            <Input
              label={t("admin.testimonials.customerName") || "Customer Name"}
              error={errors.customerName?.message}
              {...register("customerName", { 
                required: "Customer name is required",
                minLength: { value: 1, message: "Customer name is required" }
              })}
              required
              placeholder="Enter customer name"
              disabled={createMutation.isPending}
            />

            {/* Partner ID - Make it read-only when auto-populated */}
            <Input
              label={t("admin.testimonials.partnerId") || "Partner Name"}
              type="number"
              error={errors.partnerId?.message}
              {...register("partnerId", { 
                required: "Partner Name is required",
                min: { value: 1, message: "Partner ID must be greater than 0" },
                valueAsNumber: true 
              })}
              required
              placeholder="Enter partner ID"
              disabled={createMutation.isPending || !!partnerId} // Disable if partnerId from URL
              readOnly={!!partnerId} // Make read-only if partnerId from URL
            />

            {/* Rating */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("admin.testimonials.rating") || "Rating"} *
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setValue("rating", star, { shouldValidate: true })}
                    className={`p-1 rounded transition-colors ${
                      ratingValue >= star
                        ? "text-yellow-400 hover:text-yellow-500"
                        : "text-gray-300 hover:text-gray-400"
                    }`}
                    disabled={createMutation.isPending}
                  >
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {ratingValue} {ratingValue === 1 ? "star" : "stars"}
                </span>
              </div>
              {errors.rating && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.rating.message}
                </p>
              )}
            </div>

            {/* Testimonial Text */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("admin.testimonials.testimonialText") || "Testimonial Text"} *
              </label>
              <textarea
                {...register("test", { 
                  required: "Testimonial text is required",
                  minLength: { value: 1, message: "Testimonial text is required" }
                })}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#91C73D]/20 focus:border-[#91C73D] transition-colors duration-200 resize-none"
                placeholder="Enter testimonial text..."
                disabled={createMutation.isPending}
              />
              {errors.test && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.test.message}
                </p>
              )}
            </div>

            {/* Note */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("admin.testimonials.note") || "Note"} (Optional)
              </label>
              <textarea
                {...register("note")}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#91C73D]/20 focus:border-[#91C73D] transition-colors duration-200 resize-none"
                placeholder="Enter any additional notes..."
                disabled={createMutation.isPending}
              />
            </div>

            {/* Toggle Switches */}
            <div className="space-y-4">
              <ToggleSwitch
                label={t("admin.testimonials.displayOnWebsite") || "Display on Website"}
                checked={isDisplayedValue}
                onChange={(checked) => setValue("isDisplayed", checked)}
              />
              
              <ToggleSwitch
                label={t("common.active") || "Active"}
                checked={isActiveValue}
                onChange={(checked) => setValue("isActive", checked)}
              />
            </div>
          </div>

          {/* Form validation summary */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800 text-sm font-medium">
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
                Please fix the following errors:
              </div>
              <ul className="text-red-700 text-sm mt-2 list-disc list-inside space-y-1">
                {errors.customerName && <li>{errors.customerName.message}</li>}
                {errors.partnerId && <li>{errors.partnerId.message}</li>}
                {errors.rating && <li>{errors.rating.message}</li>}
                {errors.test && <li>{errors.test.message}</li>}
              </ul>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="flex-1"
              disabled={createMutation.isPending}
            >
              {t("common.cancel") || "Cancel"}
            </Button>
            
            <Button
              type="submit"
              variant="secondary"
              disabled={!isValid || createMutation.isPending}
              className="flex-1"
              icon={IconPlus}
              iconPosition="left"
            >
              {createMutation.isPending
                ? t("common.creating") || "Creating..."
                :  t("common.create") || "Create"}
            </Button>
          </div>
        </form>
      </div>

      {/* Success Message */}
      {createMutation.isSuccess && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-medium">Success!</span>
          </div>
          <p className="text-green-700 text-sm mt-1">
            Testimonial created successfully. You can add another testimonial or go back to the list.
          </p>
        </div>
      )}
    </div>
  );
}