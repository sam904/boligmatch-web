import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { testimonialService } from "../../../services/testimonial.service";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import AdminToast from "../../../components/common/AdminToast";
import type { AdminToastType } from "../../../components/common/AdminToast";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  IconArrowLeft,
  IconStarRating,
  IconTrash,
  IconPencil,
} from "../../../components/common/Icons/Index";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import ToggleSwitch from "../../../components/common/ToggleSwitch";
import type { TestimonialDto, Testimonial } from "../../../types/testimonial";

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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [showValidation, setShowValidation] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  // Get businessName from location state
  const locationState = location.state as LocationState;
  const businessName = locationState?.businessName || "";

  // Fetch previous testimonials for this partner
  const {
    data: previousTestimonials = [],
    isLoading: isLoadingTestimonials,
    error: testimonialsError,
    refetch: refetchTestimonials
  } = useQuery({
    queryKey: ['testimonials', 'partner', partnerId],
    queryFn: () => {
      if (!partnerId) return Promise.resolve([]);
      return testimonialService.getByPartnerIdList(parseInt(partnerId));
    },
    enabled: !!partnerId,
  });

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

  // Form setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset: resetForm
  } = useForm<TestimonialFormData>({
    defaultValues: {
      partnerId: partnerId ? parseInt(partnerId) : 0,
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

  // Check if form has validation errors
  const hasValidationErrors = 
    !customerNameValue || 
    customerNameValue.trim() === "" || 
    !testValue || 
    testValue.trim() === "" || 
    !partnerIdValue || 
    partnerIdValue <= 0;

  // Set partnerId from URL parameter when component mounts
  useEffect(() => {
    if (partnerId) {
      const parsedPartnerId = parseInt(partnerId, 10);
      if (!isNaN(parsedPartnerId)) {
        setValue("partnerId", parsedPartnerId);
      }
    }
  }, [partnerId, setValue]);

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
      // Refetch the testimonials list to show the new one
      refetchTestimonials();
      toast.success(
        t("admin.testimonials.createSuccess") ||
          "Testimonial created successfully"
      );
      resetForm();
      setShowValidation(false);
      setEditingTestimonial(null);
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(
        error,
        "Failed to create testimonial"
      );
      toast.error(errorMessage);
    },
  });

  // Update testimonial mutation
  const updateMutation = useMutation({
    mutationFn: async (data: TestimonialFormData) => {
      if (!editingTestimonial) throw new Error("No testimonial selected for editing");
      
      try {
        const submissionData: Testimonial = {
          ...editingTestimonial,
          partnerId: data.partnerId,
          rating: data.rating,
          test: data.test,
          customerName: data.customerName,
          note: data.note,
          isDisplayed: data.isDisplayed,
          isActive: data.isActive,
        };

        return await testimonialService.update(submissionData);
      } catch (error) {
        const errorMessage = getErrorMessage(
          error,
          "Failed to update testimonial"
        );
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["testimonials"],
        exact: false,
      });
      // Refetch the testimonials list to show the updated one
      refetchTestimonials();
      toast.success(
        t("admin.testimonials.updateSuccess") ||
          "Testimonial updated successfully"
      );
      resetForm();
      setShowValidation(false);
      setEditingTestimonial(null);
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(
        error,
        "Failed to update testimonial"
      );
      toast.error(errorMessage);
    },
  });

  // Delete testimonial mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      try {
        return await testimonialService.remove(id);
      } catch (error) {
        const errorMessage = getErrorMessage(
          error,
          "Failed to delete testimonial"
        );
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["testimonials"],
        exact: false,
      });
      // Refetch the testimonials list to remove the deleted one
      refetchTestimonials();
      toast.success(
        t("admin.testimonials.deleteSuccess") ||
          "Testimonial deleted successfully"
      );
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(
        error,
        "Failed to delete testimonial"
      );
      toast.error(errorMessage);
    },
  });

  // Form submission handler
  const onSubmit: SubmitHandler<TestimonialFormData> = async (data) => {
    // Check if there are validation errors
    if (hasValidationErrors) {
      // Show validation errors and prevent submission
      setShowValidation(true);
      toast.error("Please fill all required fields");
      return;
    }

    // If no validation errors, proceed with submission
    try {
      if (editingTestimonial) {
        await updateMutation.mutateAsync(data);
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  // Handle edit testimonial
  const handleEditTestimonial = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setValue("partnerId", testimonial.partnerId);
    setValue("rating", testimonial.rating);
    setValue("test", testimonial.test);
    setValue("customerName", testimonial.customerName);
    setValue("note", testimonial.note || "");
    setValue("isDisplayed", testimonial.isDisplayed);
    setValue("isActive", testimonial.isActive);
    setShowValidation(false);
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle delete testimonial
  const handleDeleteTestimonial = (testimonial: Testimonial) => {
    if (window.confirm(`Are you sure you want to delete the testimonial from ${testimonial.customerName}?`)) {
      deleteMutation.mutate(testimonial.id);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingTestimonial(null);
    resetForm();
    setShowValidation(false);
  };

  // Handle form close/back navigation
  const handleFormClose = () => {
    navigate(-1);
  };

  // Render star rating display
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <IconStarRating
            key={star}
            className={`w-4 h-4 ${
              rating >= star ? "text-[#91C73D]" : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating})</span>
      </div>
    );
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

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
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handleFormClose}
              disabled={isSubmitting}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-[#165933] text-white"
              title="Go back"
            >
              <IconArrowLeft className="w-4 h-4" />
            </button>

            <h1 className="text-2xl font-bold text-gray-900">
              {editingTestimonial 
                ? t("admin.testimonials.editTestimonial") || "Edit Testimonial"
                : t("admin.testimonials.addTestimonial") || "Add New Testimonial"
              }
            </h1>
          </div>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hidden Partner ID Field */}
            <div className="hidden">
              <input
                type="hidden"
                {...register("partnerId", {
                  required: "Partner ID is required",
                  min: 1,
                })}
              />
            </div>

            {/* Show businessName in a disabled field */}
            <Input
              label={
                <>{t("admin.testimonials.partnerId") || "Partner Name"}
                  <span className="text-red-500 ml-1">*</span>
                </>
              }
              value={businessName}
              disabled={true}
              placeholder="No partner selected"
            />

            {/* Customer Name */}
            <div>
              <Input
                label={
                  <>{t("admin.testimonials.customerName") || "Customer Name"}
                    <span className="text-red-500 ml-1">*</span>
                  </>
                }
                {...register("customerName")}
                placeholder={t("admin.testimonials.enterCustomerName") || "Enter customer name"}
                disabled={isSubmitting}
              />
              {showValidation && (!customerNameValue || customerNameValue.trim() === "") && (
                <p className="text-red-500 text-sm mt-1">Customer name is required</p>
              )}
            </div>

            {/* Rating */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <>{t("admin.testimonials.rating") || "Give Ratings"}
                  <span className="text-red-500 ml-1">*</span>
                </>
              </label>

              <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 p-3 rounded-md">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => {
                      setValue("rating", level);
                    }}
                    disabled={isSubmitting}
                  >
                    <IconStarRating
                      className={`w-8 h-8 transition-transform transform hover:scale-105 ${
                        ratingValue >= level
                          ? "text-[#91C73D]"
                          : "text-[#165933]"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <input
                type="hidden"
                {...register("rating", {
                  required: true,
                  min: 1,
                  max: 5,
                })}
              />
            </div>

            {/* Testimonial Text */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <>{t("admin.testimonials.testimonialText") || "Share Your Opinion"}
                  <span className="text-red-500 ml-1">*</span>
                </>
              </label>
              <textarea
                {...register("test")}
                rows={4}
                className={`w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#91C73D]/20 focus:border-[#91C73D] transition-colors duration-200 resize-none ${
                  showValidation && (!testValue || testValue.trim() === "")
                    ? "border-red-300" 
                    : "border-gray-300"
                }`}
                placeholder={t("admin.testimonials.shareDetailsofyourExperience") ||"Share details of your Experience..."}
                disabled={isSubmitting}
              />
              {showValidation && (!testValue || testValue.trim() === "") && (
                <p className="text-red-500 text-sm mt-1">Share Your Opinion is required</p>
              )}
            </div>

            {/* Note */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("admin.testimonials.note") || "Note"}
              </label>
              <textarea
                {...register("note")}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#91C73D]/20 focus:border-[#91C73D] transition-colors duration-200 resize-none"
                placeholder= {t("admin.testimonials.enteranyadditionalNotes") ||"Enter any additional notes..."}
                disabled={isSubmitting}
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

          {/* Form validation summary - Only show when there are actual errors AND showValidation is true */}
          {showValidation && hasValidationErrors && (
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
                {(!customerNameValue || customerNameValue.trim() === "") && (
                  <li>Customer name is required</li>
                )}
                {(!testValue || testValue.trim() === "") && (
                  <li>Share Your Opinion is required</li>
                )}
                {(!partnerIdValue || partnerIdValue <= 0) && (
                  <li>Partner ID is required</li>
                )}
              </ul>
            </div>
          )}

         
         {/* Form Actions */}
<div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
  {editingTestimonial ? (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleCancelEdit}
        disabled={isSubmitting}
      >
        {t("common.cancel") || "Cancel"}
      </Button>
      <Button
        type="submit"
        variant="secondary"
        disabled={isSubmitting}
      >
        {isSubmitting
          ? t("common.updating") || "Updating..."
          : t("common.update") || "Update"}
      </Button>
    </>
  ) : (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleFormClose}
        disabled={isSubmitting}
      >
        {t("common.cancel") || "Cancel"}
      </Button>
      <Button
        type="submit"
        variant="secondary"
        disabled={isSubmitting}
      >
        {isSubmitting
          ? t("common.creating") || "Creating..."
          : t("common.create") || "Create"}
      </Button>
    </>
  )}
</div>
        </form>
      </div>

      {/* Previous Testimonials Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {t("admin.testimonials.previousTestimonials") || "Previous Testimonials"}
          </h2>
          {/* <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {previousTestimonials.length} testimonial(s)
          </span> */}
        </div>

        {isLoadingTestimonials ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#91C73D] mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading testimonials...</p>
          </div>
        ) : testimonialsError ? (
          <div className="text-center py-8 text-red-500">
            Failed to load testimonials: {getErrorMessage(testimonialsError, "Unknown error")}
          </div>
        ) : previousTestimonials.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No testimonials found for this partner.
          </div>
        ) : (
          <div className="space-y-4">
            {previousTestimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {testimonial.customerName}
                      </h3>
                      {renderStars(testimonial.rating)}
                      {/* <div className="flex items-center gap-2">
                        {testimonial.isDisplayed && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Displayed
                          </span>
                        )}
                        {!testimonial.isActive && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Inactive
                          </span>
                        )}
                      </div> */}
                    </div>
                    
                    <p className="text-gray-700 mb-2">{testimonial.test}</p>
                    
                    {testimonial.note && (
                      <p className="text-sm text-gray-500 mb-2">
                        <strong>Note:</strong> {testimonial.note}
                      </p>
                    )}
                    
                   {/* <div className="text-xs text-gray-400">
  Created: {new Date(testimonial.createdDate).toLocaleDateString()}
  {testimonial.modifiedDate && (
    <> | Modified: {new Date(testimonial.modifiedDate).toLocaleDateString()}</>
  )}
</div> */}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEditTestimonial(testimonial)}
                      disabled={isSubmitting || deleteMutation.isPending}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit testimonial"
                    >
                      <IconPencil className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteTestimonial(testimonial)}
                      disabled={isSubmitting || deleteMutation.isPending}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete testimonial"
                    >
                      <IconTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}