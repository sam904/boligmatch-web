import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { testimonialService } from "../../../services/testimonial.service";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import AdminToast from "../../../components/common/AdminToast";
import DeleteConfirmation from "../../../components/common/DeleteConfirmation";
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
import Pagination from "../../../components/common/Pagination";
import SearchBar from "../../../components/common/SearchBar";
import { FilterDropdown } from "../../../components/common/FilterDropdown";
import { useDebounce } from "../../../hooks/useDebounce";

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
  const [editingTestimonial, setEditingTestimonial] =
    useState<Testimonial | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    testimonial: Testimonial | null;
  }>({
    isOpen: false,
    testimonial: null,
  });

  // Pagination states - CHANGED: Default pageSize to 5
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // CHANGED: Default to 5 records
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Active" | "InActive"
  >("All");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Get businessName from location state
  const locationState = location.state as LocationState;
  const businessName = locationState?.businessName || "";

  // Fetch paginated testimonials for this partner
  const {
    data: paginatedData,
    isLoading: isLoadingTestimonials,
    error: testimonialsError,
    refetch: refetchTestimonials,
  } = useQuery({
    queryKey: [
      "testimonials",
      "partner",
      partnerId,
      currentPage,
      pageSize,
      debouncedSearchTerm,
      statusFilter,
    ],
    queryFn: () => {
      if (!partnerId) {
        return Promise.resolve({
          items: [],
          total: 0,
        });
      }

      const queryParams = {
        page: currentPage,
        pageSize: pageSize,
        searchTerm: debouncedSearchTerm || undefined,
        status: statusFilter === "All" ? "All" : statusFilter,
        sortDirection: "desc" as const,
        sortField: "id" as const,
        userId: 0,
        partnerId: parseInt(partnerId),
        pageNumber: 0,
        rowsPerPage: 0,
      };

      return testimonialService.getPaginated(queryParams);
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
    reset: resetForm,
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
      if (!editingTestimonial)
        throw new Error("No testimonial selected for editing");

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
      setDeleteConfirmation({ isOpen: false, testimonial: null });
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(
        error,
        "Failed to delete testimonial"
      );
      toast.error(errorMessage);
      setDeleteConfirmation({ isOpen: false, testimonial: null });
    },
  });

  // Form submission handler
  const onSubmit: SubmitHandler<TestimonialFormData> = async (data) => {
    // Check if there are validation errors
    if (hasValidationErrors) {
      setShowValidation(true);
      toast.error(
        t("validation.fillRequiredFields") || "Please fill all required fields"
      );
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle delete testimonial - now opens confirmation modal instead of immediate delete
  const handleDeleteTestimonial = (testimonial: Testimonial) => {
    setDeleteConfirmation({
      isOpen: true,
      testimonial: testimonial,
    });
  };

  // Handle confirm delete from confirmation modal
  const handleConfirmDelete = () => {
    if (deleteConfirmation.testimonial?.id) {
      deleteMutation.mutate(deleteConfirmation.testimonial.id);
    } else {
      toast.error("Cannot delete testimonial: Invalid ID");
      setDeleteConfirmation({ isOpen: false, testimonial: null });
    }
  };

  // Handle cancel delete from confirmation modal
  const handleCancelDelete = () => {
    setDeleteConfirmation({ isOpen: false, testimonial: null });
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingTestimonial(null);
    resetForm();
    setShowValidation(false);
  };

  // Handle form close/back navigation
  const handleFormClose = () => {
    // Smart back: use browser back if history exists, otherwise redirect to "/"
    const hasHistory = window.history.length > 1;
    const hasState = location.state !== null && location.state !== undefined;
    const hasLocationKey = location.key !== 'default' && location.key !== null;
    const notOnHome = location.pathname !== '/';
    
    const canGoBack = hasHistory && (hasState || hasLocationKey || (notOnHome && window.history.length > 2));
    
    if (canGoBack) {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle search change
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Handle status filter change
  const handleStatusFilterChange = (filter: "All" | "Active" | "InActive") => {
    setStatusFilter(filter);
    setCurrentPage(1);
  };

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Render star rating display
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <IconStarRating
            key={star}
            className={`w-4 h-4 cursor-pointer ${
              rating >= star ? "text-[#91C73D]" : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating})</span>
      </div>
    );
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Get data from API response
  const previousTestimonials = paginatedData?.items || [];
  const totalItems = paginatedData?.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const hasRecords = previousTestimonials.length > 0;

  return (
    <div className="p-4 sm:p-6">
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={
          deleteConfirmation.testimonial
            ? `${
                t("admin.testimonials.testimonialFrom", {
                  name: deleteConfirmation.testimonial.customerName,
                }) ||
                `Testimonial from: ${deleteConfirmation.testimonial.customerName}`
              }`
            : undefined
        }
        confirmationMessage={
          t("admin.testimonials.deleteConfirm") ||
          "Are you sure you want to delete this testimonial?"
        }
        isLoading={deleteMutation.isPending}
      />

      {/* Testimonial Form */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
        {/* Header Section - Responsive */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={handleFormClose}
              disabled={isSubmitting}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-[#165933] text-white cursor-pointer flex-shrink-0"
              title="Go back"
            >
              <IconArrowLeft className="w-4 h-4" />
            </button>

            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
              {editingTestimonial
                ? t("admin.testimonials.editTestimonial") || "Edit Testimonial"
                : t("admin.testimonials.addTestimonial") ||
                  "Add New Testimonial"}
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
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
                <>
                  {t("admin.testimonials.partnerId") || "Partner Name"}
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
                  <>
                    {t("admin.testimonials.customerName") || "Customer Name"}
                    <span className="text-red-500 ml-1">*</span>
                  </>
                }
                {...register("customerName")}
                placeholder={
                  t("admin.testimonials.enterCustomerName") ||
                  "Enter customer name"
                }
                disabled={isSubmitting}
              />
              {showValidation &&
                (!customerNameValue || customerNameValue.trim() === "") && (
                  <p className="text-red-500 text-sm mt-1">
                    {t("validation.customerNameRequired") ||
                      "Customer name is required"}
                  </p>
                )}
            </div>

            {/* Rating - Improved mobile layout */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <>
                  {t("admin.testimonials.rating") || "Give Ratings"}
                  <span className="text-red-500 ml-1">*</span>
                </>
              </label>

              <div className="flex items-center justify-center sm:justify-start gap-2 bg-gray-50 border border-gray-200 p-3 rounded-md">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => {
                      setValue("rating", level);
                    }}
                    disabled={isSubmitting}
                    className="cursor-pointer transform hover:scale-110 transition-transform"
                  >
                    <IconStarRating
                      className={`w-6 h-6 sm:w-8 sm:h-8 transition-colors ${
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <>
                  {t("admin.testimonials.testimonialText") ||
                    "Share Your Opinion"}
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
                placeholder={
                  t("admin.testimonials.shareDetailsofyourExperience") ||
                  "Share details of your experience..."
                }
                disabled={isSubmitting}
              />
              {showValidation && (!testValue || testValue.trim() === "") && (
                <p className="text-red-500 text-sm mt-1">
                  {t("validation.shareYourOpinionRequired") ||
                    "Share Your Opinion is required"}
                </p>
              )}
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("admin.testimonials.note") || "Note"}
              </label>
              <textarea
                {...register("note")}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#91C73D]/20 focus:border-[#91C73D] transition-colors duration-200 resize-none"
                placeholder={
                  t("admin.testimonials.enteranyadditionalNotes") ||
                  "Enter any additional notes..."
                }
                disabled={isSubmitting}
              />
            </div>

            {/* Toggle Switches - Stack on mobile, row on larger screens */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-4 sm:gap-6">
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
          {showValidation && hasValidationErrors && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800 text-sm font-medium">
                <svg
                  className="w-4 h-4 flex-shrink-0"
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
                {t("common.pleaseFixErrors") ||
                  "Please fix the following errors:"}
              </div>
              <ul className="text-red-700 text-sm mt-2 list-disc list-inside space-y-1">
                {(!customerNameValue || customerNameValue.trim() === "") && (
                  <li>
                    {t("validation.customerNameRequired") ||
                      "Customer name is required"}
                  </li>
                )}
                {(!testValue || testValue.trim() === "") && (
                  <li>
                    {t("validation.testimonialTextRequired") ||
                      "Testimonial text is required"}
                  </li>
                )}
                {(!partnerIdValue || partnerIdValue <= 0) && (
                  <li>
                    {t("validation.partnerIdRequired") ||
                      "Partner ID is required"}
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Form Actions - Stack on mobile, row on larger screens */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
            {editingTestimonial ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                  className="cursor-pointer w-full sm:w-auto order-2 sm:order-1"
                >
                  {t("common.cancel") || "Cancel"}
                </Button>
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={isSubmitting}
                  className="cursor-pointer w-full sm:w-auto order-1 sm:order-2"
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
                  className="cursor-pointer w-full sm:w-auto order-2 sm:order-1"
                >
                  {t("common.cancel") || "Cancel"}
                </Button>
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={isSubmitting}
                  className="cursor-pointer w-full sm:w-auto order-1 sm:order-2"
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

      {/* Testimonials Section */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            {t("admin.testimonials.title") || "Previous Testimonials"}
          </h2>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full cursor-pointer self-start sm:self-center">
            {totalItems} testimonial(s)
          </span>
        </div>

        {/* Search and Filter Controls - Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="w-full sm:w-auto">
            <FilterDropdown
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="w-full sm:w-auto"
            />
          </div>
          <div className="w-full sm:flex-1 sm:max-w-xs lg:max-w-sm">
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              pageSize={pageSize}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        </div>

        {isLoadingTestimonials ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#91C73D] mx-auto cursor-pointer"></div>
            <p className="text-gray-500 mt-2">
              {t("admin.testimonials.loadingTestimonials") ||
                "Loading testimonials..."}
            </p>
          </div>
        ) : testimonialsError ? (
          <div className="text-center py-8 text-red-500 px-4">
            {t("common.errorLoading") || "Failed to load testimonials:"}{" "}
            {getErrorMessage(
              testimonialsError,
              t("common.unknownError") || "Unknown error"
            )}
          </div>
        ) : !hasRecords ? (
          <div className="text-center py-8 text-gray-500 px-4">
            {searchTerm || statusFilter !== "All"
              ? t("admin.testimonials.noTestimonialsMatch") ||
                "No testimonials match your search criteria."
              : t("admin.testimonials.noTestimonialsFound") ||
                "No testimonials found for this partner."}
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {previousTestimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Customer info and rating - Stack on mobile */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                        <h3 className="font-semibold text-gray-900 break-words">
                          {testimonial.customerName}
                        </h3>
                        <div className="flex items-center gap-2">
                          {renderStars(testimonial.rating)}
                        </div>
                      </div>

                      {/* Status badges - Wrap properly on mobile */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {testimonial.isDisplayed && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 cursor-pointer">
                            {t("common.displayed") || "Displayed"}
                          </span>
                        )}
                        {!testimonial.isActive && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 cursor-pointer">
                            {t("common.inactive") || "Inactive"}
                          </span>
                        )}
                      </div>

                      <p className="text-gray-700 mb-2 break-words">
                        {testimonial.test}
                      </p>

                      {testimonial.note && (
                        <p className="text-sm text-gray-500 mb-2 break-words">
                          <strong>{t("common.note") || "Note"}:</strong>{" "}
                          {testimonial.note}
                        </p>
                      )}

                      <div className="text-xs text-gray-400 cursor-pointer">
                        {t("common.created") || "Created"}:{" "}
                        {testimonial.createdDate
                          ? new Date(
                              testimonial.createdDate
                            ).toLocaleDateString()
                          : "N/A"}
                        {testimonial.modifiedDate && (
                          <>
                            {" "}
                            | {t("common.modified") || "Modified"}:{" "}
                            {testimonial.modifiedDate
                              ? new Date(
                                  testimonial.modifiedDate
                                ).toLocaleDateString()
                              : "N/A"}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action buttons - Right aligned on larger screens */}
                    <div className="flex items-center gap-2 sm:ml-4 sm:flex-shrink-0 self-start sm:self-center">
                      <button
                        onClick={() => handleEditTestimonial(testimonial)}
                        disabled={isSubmitting || deleteMutation.isPending}
                        className="p-2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                        title={t("common.edit") || "Edit testimonial"}
                      >
                        <IconPencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTestimonial(testimonial)}
                        disabled={isSubmitting || deleteMutation.isPending}
                        className="p-2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                        title={t("common.delete") || "Delete testimonial"}
                      >
                        <IconTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {hasRecords && totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
