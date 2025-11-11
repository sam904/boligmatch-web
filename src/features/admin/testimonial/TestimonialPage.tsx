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
import {
  IconPlus,
  IconArrowLeft,
} from "../../../components/common/Icons/Index";
import { useParams, useLocation, useNavigate } from "react-router-dom";
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

interface LocationState {
  businessName?: string;
}

export default function TestimonialFormPage() {
  const { t } = useTranslation();
  const { partnerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate(); // Added navigate hook
  const queryClient = useQueryClient();
  const [toasts, setToasts] = useState<ToastState[]>([]);

  // Get businessName from location state
  const locationState = location.state as LocationState;
  const businessName = locationState?.businessName || "";

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
      if (!isNaN(parsedPartnerId)) {
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
      newErrors.partnerId = "Partner ID is required";
    }

    if (!data.rating || data.rating < 1 || data.rating > 5) {
      newErrors.rating = "Rating must be between 1 and 5";
    }

    if (!data.test || data.test.trim() === "") {
      newErrors.test = "Share Your Opinion is required";
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
        const errorMessage = getErrorMessage(
          error,
          "Failed to create testimonial"
        );
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["testimonials"],
        exact: false,
      });
      toast.success(
        t("admin.testimonials.createSuccess") ||
          "Testimonial created successfully"
      );
      reset();
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(
        error,
        "Failed to create testimonial"
      );
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

  // Handle form close/back navigation
  const handleFormClose = () => {
    // Navigate back to the previous page (partners list)
    navigate(-1);
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

      {/* Testimonial Form */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* Header Section - Updated with back button */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            {/* Back Button */}
            <button
              onClick={handleFormClose}
              disabled={createMutation.isPending}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-[#165933] text-white"
              title="Go back"
            >
              <IconArrowLeft className="w-4 h-4" />
            </button>

            <h1 className="text-2xl font-bold text-gray-900">
              {t("admin.testimonials.addTestimonial") || "Add New Testimonial"}
            </h1>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="hidden">
              <Input
                label={t("admin.testimonials.partnerId") || "Partner ID"}
                type="number"
                error={errors.partnerId?.message}
                {...register("partnerId", {
                  required: "Partner ID is required",
                  min: {
                    value: 1,
                    message: "Partner ID must be greater than 0",
                  },
                  valueAsNumber: true,
                })}
                required
                placeholder="Enter partner ID"
                disabled={createMutation.isPending || !!partnerId}
                readOnly={!!partnerId}
              />
            </div>

            {/* Show businessName in a disabled field instead of partnerId */}
            <Input
              label={t("admin.testimonials.partnerId") || "Partner Name"}
              value={businessName}
              disabled={true}
              placeholder="No partner selected"
            />

            {/* Customer Name */}
            <Input
              label={t("admin.testimonials.customerName") || "Customer Name"}
              error={errors.customerName?.message}
              {...register("customerName", {
                required: "Customer name is required",
                minLength: { value: 1, message: "Customer name is required" },
              })}
              required
              placeholder="Enter customer name"
              disabled={createMutation.isPending}
            />

            {/* Rating */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("admin.testimonials.rating") || "Give Ratings"}
              </label>

              <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 p-3 rounded-md">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() =>
                      setValue("rating", level, { shouldValidate: true })
                    }
                    disabled={createMutation.isPending}
                    className={`transition-transform transform hover:scale-105 ${
                      ratingValue >= level ? "text-[#165933]" : "text-[#91C73D]"
                    }`}
                  >
                    <svg
                      width="46"
                      height="43"
                      viewBox="0 0 46 43"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-8 h-8"
                      fill="currentColor"
                    >
                      <g clipPath="url(#clip0_1776_4279)">
                        <path
                          d="M23.4101 10.0708C23.4101 10.7108 22.6501 11.0708 22.1001 11.0708C21.7238 11.1152 21.344 11.0229 21.0301 10.8108L20.7101 10.5608C20.2916 10.2928 19.7917 10.1819 19.2991 10.2478C18.8066 10.3138 18.3534 10.5522 18.0201 10.9208C17.5896 11.4622 17.3473 12.1293 17.3301 12.8208V13.0808C17.3691 13.7315 17.6103 14.3538 18.0201 14.8608C18.2044 15.0734 18.4314 15.2448 18.6864 15.3637C18.9415 15.4826 19.2187 15.5463 19.5001 15.5508C19.93 15.5748 20.3557 15.4552 20.7101 15.2108C20.8227 15.139 20.9296 15.0588 21.0301 14.9708C21.344 14.7586 21.7238 14.6663 22.1001 14.7108C22.6501 14.7108 23.4101 15.1108 23.4101 15.7108V23.1008H30.7501C30.8876 22.9736 30.9701 22.7978 30.9801 22.6108C30.9801 22.1908 30.9201 22.0908 30.9101 22.0808C30.8008 21.9582 30.7006 21.8278 30.6101 21.6908C30.2272 21.1127 30.0641 20.4167 30.1503 19.7287C30.2366 19.0408 30.5664 18.4064 31.0801 17.9408C31.74 17.3904 32.5617 17.0708 33.4201 17.0308H33.7501C34.6503 17.0518 35.517 17.376 36.2101 17.9508C36.7238 18.4165 37.0536 19.0507 37.1398 19.7387C37.2261 20.4266 37.063 21.1228 36.6801 21.7008C36.59 21.835 36.4897 21.962 36.3801 22.0808C36.3139 22.2526 36.2899 22.4378 36.3101 22.6208C36.3116 22.7131 36.3318 22.8042 36.3697 22.8884C36.4075 22.9727 36.4621 23.0483 36.5301 23.1108H40.6701V22.0008H44.5901C44.8677 21.9989 45.1382 21.9133 45.3664 21.7552C45.5946 21.5972 45.7698 21.374 45.8692 21.1148C45.9685 20.8556 45.9874 20.5724 45.9234 20.3023C45.8593 20.0322 45.7153 19.7878 45.5101 19.6008L38.1601 12.9708L31.4501 6.91078L24.4501 0.550781C24.1686 0.295973 23.8228 0.123059 23.4501 0.0507812V10.1008L23.4101 10.0708Z"
                          fill="currentColor"
                        />
                        <path
                          d="M15.1901 23.2H22.5801V15.87C22.5193 15.7992 22.4442 15.7421 22.3597 15.7025C22.2753 15.6628 22.1834 15.6415 22.0901 15.64C21.9079 15.6145 21.7222 15.6352 21.5501 15.7C21.4274 15.8093 21.2971 15.9095 21.1601 16C20.6702 16.3369 20.0841 16.5054 19.4901 16.48C19.0921 16.4714 18.7006 16.3776 18.3418 16.2051C17.9831 16.0327 17.6653 15.7854 17.4101 15.48C16.8576 14.8174 16.5379 13.9918 16.5 13.13V12.82C16.516 11.9176 16.8367 11.0471 17.4101 10.35C17.6712 10.0578 17.9899 9.8227 18.346 9.65924C18.7022 9.49578 19.0883 9.40752 19.4801 9.39999C20.0758 9.38541 20.6619 9.55287 21.1601 9.88C21.3401 10 21.4601 10.11 21.5501 10.18C21.6401 10.25 21.6701 10.25 22.0901 10.25C22.2742 10.2453 22.4496 10.1701 22.5801 10.04V0C22.2059 0.0741505 21.8597 0.250701 21.5801 0.509995L0.47005 19.56C0.26487 19.747 0.120843 19.9915 0.0567814 20.2616C-0.00728008 20.5317 0.0116067 20.8148 0.110965 21.074C0.210324 21.3332 0.385538 21.5564 0.613727 21.7144C0.841917 21.8725 1.11247 21.9581 1.39005 21.96H5.31006V23.2H9.47005C10.1201 23.2 10.47 23.96 10.53 24.51C10.5664 24.8872 10.471 25.2652 10.2601 25.58C10.1745 25.6823 10.0943 25.7892 10.0201 25.9C9.74689 26.3161 9.63198 26.8163 9.6962 27.3099C9.76042 27.8035 9.99952 28.2577 10.3701 28.59C10.9089 29.0251 11.5776 29.268 12.2701 29.28H12.5401C13.1877 29.2409 13.8068 28.9996 14.3101 28.59C14.5245 28.4066 14.6978 28.18 14.8184 27.9249C14.9391 27.6698 15.0044 27.3921 15.0101 27.11C15.0236 26.6813 14.9049 26.2589 14.6701 25.9C14.5701 25.76 14.4901 25.67 14.4201 25.58C14.2127 25.2639 14.1208 24.886 14.1601 24.51C14.1501 24 14.5501 23.2 15.1901 23.2Z"
                          fill="currentColor"
                        />
                        <path
                          d="M40.8692 40.7896L40.7292 23.9096H36.5692C35.9292 23.9096 35.5192 23.1596 35.5092 22.6096C35.4662 22.2347 35.5546 21.8566 35.7592 21.5396C35.8292 21.4496 35.9092 21.3596 36.0092 21.2196C36.2447 20.8581 36.3569 20.4301 36.3292 19.9996C36.3221 19.7192 36.2562 19.4434 36.1356 19.1902C36.015 18.9369 35.8425 18.7118 35.6292 18.5296C35.0865 18.1027 34.4196 17.864 33.7292 17.8496H33.4592C32.8107 17.8929 32.1919 18.1376 31.6892 18.5496C31.32 18.8834 31.0834 19.3391 31.0228 19.8331C30.9622 20.3271 31.0816 20.8265 31.3592 21.2396C31.4307 21.355 31.5146 21.4623 31.6092 21.5596C31.8157 21.8763 31.9107 22.2528 31.8792 22.6296C31.8792 23.1796 31.4792 23.9396 30.8792 23.9496H28.8992L23.4492 23.9996V29.2496V31.3296C23.5096 31.4009 23.5846 31.4584 23.6691 31.498C23.7537 31.5377 23.8458 31.5587 23.9392 31.5596C24.1222 31.5798 24.3074 31.5558 24.4792 31.4896L24.8592 31.1796C25.3517 30.8473 25.9352 30.6761 26.5292 30.6896C26.9218 30.6895 27.31 30.7723 27.6685 30.9326C28.0269 31.0928 28.3475 31.327 28.6092 31.6196C29.1708 32.2784 29.4979 33.1049 29.5392 33.9696C29.5442 34.0161 29.5442 34.0631 29.5392 34.1096V34.2796C29.5345 35.1806 29.2203 36.0526 28.6492 36.7496C28.3942 37.0528 28.0779 37.2986 27.7212 37.471C27.3644 37.6433 26.9752 37.7383 26.5792 37.7496C25.9831 37.7787 25.3937 37.6138 24.8992 37.2796L24.5092 36.9896C24.5092 36.9896 24.3992 36.9196 23.9792 36.9196C23.7943 36.9299 23.6198 37.0083 23.4892 37.1396V42.8296L38.8192 42.7096C39.3447 42.7231 39.8543 42.5293 40.238 42.17C40.6216 41.8107 40.8484 41.3148 40.8692 40.7896Z"
                          fill="currentColor"
                        />
                        <path
                          d="M22.5708 37.19C22.5708 36.54 23.3308 36.19 23.8708 36.19C24.2503 36.144 24.6338 36.2363 24.9508 36.45C25.0492 36.5405 25.1564 36.6209 25.2708 36.69C25.6218 36.9337 26.0441 37.0534 26.4708 37.03C26.7538 37.027 27.033 36.9639 27.2899 36.845C27.5467 36.726 27.7754 36.5539 27.9608 36.34C28.3913 35.7986 28.6336 35.1315 28.6508 34.44V34.27C28.6508 34.27 28.6508 34.21 28.6508 34.18C28.6153 33.5303 28.3775 32.9079 27.9708 32.4C27.7865 32.1873 27.5594 32.016 27.3044 31.8971C27.0494 31.7782 26.7721 31.7144 26.4908 31.71C26.0609 31.6859 25.6352 31.8055 25.2808 32.05C25.1682 32.1218 25.0612 32.202 24.9608 32.29C24.6438 32.5037 24.2603 32.596 23.8808 32.55C23.3408 32.55 22.5808 32.15 22.5808 31.55V24H15.2508C15.1818 24.0623 15.126 24.1377 15.0865 24.2219C15.047 24.306 15.0247 24.3971 15.0208 24.49C15.0208 24.92 15.0808 25.02 15.0908 25.03C15.1008 25.04 15.2708 25.24 15.3908 25.42C15.7737 25.9981 15.9368 26.6941 15.8505 27.3821C15.7643 28.07 15.4345 28.7043 14.9208 29.17C14.2582 29.7224 13.4326 30.0421 12.5708 30.08H12.2508C11.3509 30.0665 10.4828 29.7454 9.79079 29.17C9.2771 28.7043 8.94725 28.07 8.86102 27.3821C8.7748 26.6941 8.93791 25.9981 9.32079 25.42C9.41383 25.2848 9.51398 25.1546 9.62079 25.03C9.62079 25.03 9.69078 24.92 9.69078 24.5C9.67864 24.3156 9.60055 24.1416 9.47078 24.01H5.30078V40.92C5.31383 41.4417 5.53029 41.9377 5.90396 42.302C6.27763 42.6663 6.7789 42.8702 7.30078 42.87H22.6108V37.18L22.5708 37.19Z"
                          fill="currentColor"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_1776_4279">
                          <rect width="45.96" height="42.88" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </button>
                ))}
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
                {t("admin.testimonials.testimonialText") ||
                  "Share Your Opinion"}
              </label>
              <textarea
                {...register("test", {
                  required: "Share Your Opinion is required",
                  minLength: {
                    value: 1,
                    message: "Share Your Opinion is required",
                  },
                })}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#91C73D]/20 focus:border-[#91C73D] transition-colors duration-200 resize-none"
                placeholder="Share details of your Experience..."
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
            <div className="flex flex-wrap items-center gap-6">
              <ToggleSwitch
                label={
                  t("admin.testimonials.displayOnWebsite") ||
                  "Display on Website"
                }
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
              onClick={handleFormClose}
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
                : t("common.create") || "Create"}
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
            Testimonial created successfully. You can add another testimonial or
            go back to the list.
          </p>
        </div>
      )}
    </div>
  );
}
