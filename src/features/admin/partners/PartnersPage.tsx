// src/pages/admin/PartnersPage/PartnersPage.tsx
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { partnerService } from "../../../services/partner.service";
import { subCategoryService } from "../../../services/subCategory.service";
import DataTable from "../../../components/common/DataTable/DataTable";
import Pagination from "../../../components/common/Pagination";
import SearchBar from "../../../components/common/SearchBar";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import Stepper from "../../../components/common/Stepper";
import TextArea from "../../../components/common/TextArea";
import { useNavigate } from "react-router-dom";
import DeleteConfirmation from "../../../components/common/DeleteConfirmation";
import ImageUpload from "../../../components/common/ImageUpload";
import VideoUpload from "../../../components/common/VideoUpload";
import VideoPreviewModal from "../../../components/common/VideoPreviewModal";
import DocumentPreviewModal from "../../../components/common/DocumentPreviewModal";
import AdminToast from "../../../components/common/AdminToast";
import type { AdminToastType } from "../../../components/common/AdminToast";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ResetPasswordModal from "../../../components/common/ResetPasswordModal";
import { useTranslation } from "react-i18next";
import { useDebounce } from "../../../hooks/useDebounce";
import type { ColumnDef } from "@tanstack/react-table";
import type {
  Partner,
  PartnerDocument,
  PartnerSubCategory,
} from "../../../types/partner";
import { partnerDocumentService } from "../../../services/partnerdocument.service";
import type { PartnerDocumentDto } from "../../../types/partnerdocument";
import { categoryService } from "../../../services/category.service";
import type { SubCategory } from "../../../types/subcategory";
import type { Category } from "../../../types/category";
import SearchableSelectController from "../../../components/common/SearchableSelectController";
import DocumentUpload from "../../../components/common/DocumentUpload";
import { userService } from "../../../services/user.service";
import ToggleSwitch from "../../../components/common/ToggleSwitch";
import RichTextEditor from "../../../components/common/RichTextEditor";
import { exportToExcel } from "../../../utils/export.utils";
import {
  IconPencil,
  IconTrash,
  IconPlus,
  IconUpload,
  IconArrowLeft,
  IconKey,
  IconNoRecords,
  IconTestimonial,
} from "../../../components/common/Icons/Index";
import { FilterDropdown } from "../../../components/common/FilterDropdown";

// Toast state interface
interface ToastState {
  id: string;
  type: AdminToastType;
  message: string;
  title?: string;
  subtitle?: string;
  open: boolean;
}

// In the ImagePreviewModal component, replace hardcoded text:
function ImagePreviewModal({
  imageUrl,
  isOpen,
  onClose,
}: {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center bg-black/50 z-50 p-4 cursor-pointer">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">
            {t("common.imagePreview") || "Image Preview"}
          </h3>
          <button
            onClick={onClose}
            className="text-[#171717] border border-[#171717] hover:bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
        <div className="p-4 flex justify-center items-center max-h-[70vh] overflow-auto">
          <img
            src={imageUrl}
            alt="Preview"
            className="max-w-full max-h-full object-contain cursor-pointer"
          />
        </div>
        <div className="p-4 border-t text-left">
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
          >
            {t("common.openInNewTab") || "Open in new tab"}
          </a>
        </div>
      </div>
    </div>
  );
}

// Logo Upload Component with exact 512x512 Validation
function LogoUploadWithValidation({
  value,
  onChange,
  onPreview,
  error,
  label = "Company Logo",
}: {
  value: string;
  onChange: (url: string) => void;
  onPreview: (url: string) => void;
  error?: string;
  label?: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <ImageUpload
          label={label}
          value={value}
          onChange={onChange}
          onPreview={onPreview}
          folder="partners/logos"
          error={error}
          exactDimensions={{ width: 512, height: 512 }}
          showDimensionValidation={true}
        />
      </div>
    </div>
  );
}

// Schemas - UPDATED WITH STATUS FIELD
const partnerSubCategorySchema = z.object({
  id: z.number().optional(),
  partnerId: z.number().optional(),
  subCategoryId: z.number().min(1, "Sub Category is required"),
  isActive: z.boolean(),
});

const partnerDocumentSchema = z.object({
  id: z.number().optional(),
  partnerId: z.number().optional(),
  documentName: z.string().min(1, "Document name is required"),
  documentUrl: z.string().min(1, "Document URL is required"),
  isActive: z.boolean(),
});

// UPDATED PARTNER SCHEMA WITH STATUS FIELD
const partnerSchema = z.object({
  userId: z.number().optional(),
  categoryId: z.number().min(1, "Category is required"),
  address: z.string().min(1, "Address is required"),
  businessName: z.string().min(1, "Business Name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .refine((email) => {
      if (!email) return false;
      return true;
    }),
  mobileNo: z
    .string()
    .min(1, "Mobile number is required")
    .length(8, "Mobile number must be exactly 8 digits")
    .regex(/^\d+$/, "Mobile number can only contain numbers")
    .refine((mobileNo) => {
      if (!mobileNo) return false;
      return true;
    }),
  videoUrl: z.string().optional(),
  logoUrl: z.string().optional(),
  trustPilotUrl: z
    .string()
    .url("Invalid TrustPilot URL")
    .optional()
    .or(z.literal("")),
  cvr: z.number().min(0, "CVR is required"),
  descriptionShort: z.string().optional(),
  textField1: z.string().optional(),
  textField2: z.string().optional(),
  textField3: z.string().optional(),
  textField4: z.string().optional(),
  textField5: z.string().optional(),
  imageUrl1: z.string().optional(),
  imageUrl2: z.string().optional(),
  imageUrl3: z.string().optional(),
  imageUrl4: z.string().optional(),
  imageUrl5: z.string().optional(),
  thumbnail: z.string().optional(),
  isActive: z.boolean(),
  status: z.enum(["Active", "InActive"]).default("Active"), // CHANGED: Remove "All" and add default
  parSubCatlst: z
    .array(partnerSubCategorySchema)
    .min(1, "At least one sub category is required"),
  parDoclst: z.array(partnerDocumentSchema).optional().default([]),
});

type PartnerFormData = {
  userId?: number;
  categoryId: number;
  address: string;
  businessName: string;
  email?: string;
  mobileNo?: string;
  businessUnit: number;
  videoUrl?: string;
  logoUrl?: string;
  trustPilotUrl?: string;
  cvr: number;
  descriptionShort?: string;
  textField1?: string;
  textField2?: string;
  textField3?: string;
  textField4?: string;
  textField5?: string;
  imageUrl1?: string;
  imageUrl2?: string;
  imageUrl3?: string;
  imageUrl4?: string;
  imageUrl5?: string;
  thumbnail?: string;
  isActive: boolean;
  status: "All" | "Active" | "InActive";
  parSubCatlst: PartnerSubCategory[];
  parDoclst: PartnerDocument[];
};

type FieldPath<T> = keyof T | string;
type ValidFieldNames =
  | FieldPath<PartnerFormData>
  | `parDoclst.${number}.${keyof PartnerDocument}`
  | `parSubCatlst.${number}.${keyof PartnerSubCategory}`;

export default function PartnersPage() {
  const { t } = useTranslation();
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [resettingPartner, setResettingPartner] = useState<Partner | null>(
    null
  );
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Active" | "InActive"
  >("All");
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [savingDocuments, setSavingDocuments] = useState<number[]>([]);
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    isOpen: boolean;
  }>({ url: "", isOpen: false });
  const [previewVideo, setPreviewVideo] = useState<{
    url: string;
    isOpen: boolean;
  }>({ url: "", isOpen: false });
  const [previewDocument, setPreviewDocument] = useState<{
    url: string;
    name: string;
    isOpen: boolean;
  }>({ url: "", name: "", isOpen: false });
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [documentDeleteConfirmation, setDocumentDeleteConfirmation] = useState<{
    isOpen: boolean;
    documentIndex: number | null;
    documentId?: number;
    documentName?: string;
  }>({
    isOpen: false,
    documentIndex: null,
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    partner: Partner | null;
  }>({ isOpen: false, partner: null });
  const navigate = useNavigate();
  // Email and Mobile Validation States
  const [emailValidation, setEmailValidation] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
  }>({
    checking: false,
    available: null,
    message: "",
  });

  const [mobileValidation, setMobileValidation] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
  }>({
    checking: false,
    available: null,
    message: "",
  });

  const [emailDebounceTimer, setEmailDebounceTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [mobileDebounceTimer, setMobileDebounceTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const queryClient = useQueryClient();

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

  const handleAddTestimonial = (partner: Partner) => {
    navigate(`/admin/testimonial/${partner.id}`, {
      state: {
        businessName: partner.businessName,
      },
    });
  };
  // Email validation function
  const validateEmailAvailability = async (email: string) => {
    if (!email) {
      setEmailValidation({
        checking: false,
        available: null,
        message: "",
      });
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailValidation({
        checking: false,
        available: false,
        message:
          t("validation.emailInvalidFormat") ||
          "Please enter a valid email address",
      });
      return;
    }

    setEmailValidation({
      checking: false,
      available: null,
      message:
        t("validation.emailCheckError") || "Error checking email availability",
    });

    try {
      const response = await userService.checkEmailOrMobileAvailability(email);

      if (response.isSuccess) {
        setEmailValidation({
          checking: false,
          available: true,
          message: "Email is available",
        });
      } else {
        // Handle duplicate email case
        setEmailValidation({
          checking: false,
          available: false,
          message:
            response.failureReason ||
            t("validation.emailAlreadyRegistered") ||
            "Email already registered",
        });
      }
    } catch (error: any) {
      console.error("Email validation error:", error);

      // Handle API errors specifically
      if (error.response?.status === 400) {
        setEmailValidation({
          checking: false,
          available: false,
          message:
            error.response.data?.failureReason || "Email already registered",
        });
      } else {
        setEmailValidation({
          checking: false,
          available: null,
          message: "Error checking email availability",
        });
      }
    }
  };

  // Mobile validation function - UPDATED FOR 8 DIGITS
  const validateMobileAvailability = async (mobileNo: string) => {
    if (!mobileNo) {
      setMobileValidation({
        checking: false,
        available: null,
        message: "",
      });
      return;
    }

    // Clean mobile number (remove spaces, dashes, etc.)
    const cleanMobile = mobileNo.replace(/[\s\-\(\)]+/g, "");

    // UPDATED: Basic mobile validation - exactly 8 digits
    if (cleanMobile.length !== 8) {
      setMobileValidation({
        checking: false,
        available: false,
        message:
          t("validation.mobileInvalidLength") ||
          "Mobile number must be exactly 8 digits",
      });
      return;
    }

    // UPDATED: Validate that it contains only digits
    if (!/^\d+$/.test(cleanMobile)) {
      setMobileValidation({
        checking: false,
        available: false,
        message:
          t("validation.mobileNumbersOnly") ||
          "Mobile number can only contain numbers",
      });
      return;
    }

    setMobileValidation({
      checking: true,
      available: null,
      message:
        t("admin.partners.mobileChecking") ||
        "Checking mobile number availability...",
    });

    try {
      const response = await userService.checkEmailOrMobileAvailability(
        cleanMobile
      );

      if (response.isSuccess) {
        setMobileValidation({
          checking: false,
          available: true,
          message: "Mobile number is available",
        });
      } else {
        // Handle duplicate mobile case
        setMobileValidation({
          checking: false,
          available: false,
          message:
            response.failureReason ||
            t("validation.mobileAlreadyRegistered") ||
            "Mobile number already registered",
        });
      }
    } catch (error: any) {
      console.error("Mobile validation error:", error);

      // Handle API errors specifically
      if (error.response?.status === 400) {
        setMobileValidation({
          checking: false,
          available: false,
          message:
            error.response.data?.failureReason ||
            "Mobile number already registered",
        });
      } else {
        setMobileValidation({
          checking: false,
          available: null,
          message:
            t("validation.mobileCheckError") ||
            "Error checking mobile number availability",
        });
      }
    }
  };

  // Debounced email validation handler
  const handleEmailChange = (email: string) => {
    setValue("email", email);

    // Clear existing timer
    if (emailDebounceTimer) {
      clearTimeout(emailDebounceTimer);
    }

    // Set new timer for debounced validation
    const timer = setTimeout(() => {
      validateEmailAvailability(email);
    }, 800); // 800ms debounce

    setEmailDebounceTimer(timer);
  };

  // Debounced mobile validation handler
  const handleMobileChange = (mobileNo: string) => {
    setValue("mobileNo", mobileNo);

    // Clear existing timer
    if (mobileDebounceTimer) {
      clearTimeout(mobileDebounceTimer);
    }

    // Set new timer for debounced validation
    const timer = setTimeout(() => {
      validateMobileAvailability(mobileNo);
    }, 800); // 800ms debounce

    setMobileDebounceTimer(timer);
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (emailDebounceTimer) clearTimeout(emailDebounceTimer);
      if (mobileDebounceTimer) clearTimeout(mobileDebounceTimer);
    };
  }, [emailDebounceTimer, mobileDebounceTimer]);

  const steps = [
    t("admin.partners.BasicInformation") || "Basic Information",
    t("admin.partners.Media&Description") || "Media & Description",
    t("admin.partners.TextFields") || "Text Fields",
    t("admin.partners.Images&Status") || "Images & Status",
    t("admin.partners.Documents") || "Documents",
    t("admin.partners.Categories&SubCategories") ||
      "Categories & SubCategories",
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    trigger,
    control,
    setValue,
    watch,
  } = useForm<PartnerFormData>({
    resolver: zodResolver(partnerSchema as any),
    defaultValues: {
      isActive: true,
      status: "Active",
      cvr: 0,
      businessUnit: 1,
      categoryId: 0,
      userId: 2,
      businessName: "",
      email: "",
      mobileNo: "",
      address: "",
      trustPilotUrl: "",
      parSubCatlst: [{ subCategoryId: 0, isActive: true }],
      parDoclst: [],
    },
  });

  const {
    fields: subCategoryFields,
    append: appendSubCategory,
    remove: removeSubCategory,
  } = useFieldArray({
    control,
    name: "parSubCatlst",
  });

  const handleDocumentPreview = (url: string, name?: string) => {
    setPreviewDocument({
      url,
      name: name || url.split("/").pop() || "Document",
      isOpen: true,
    });
  };

  const {
    fields: documentFields,
    append: appendDocument,
    remove: removeDocument,
  } = useFieldArray({
    control,
    name: "parDoclst",
  });

  const logoUrlValue = watch("logoUrl");
  const videoUrlValue = watch("videoUrl");
  const imageUrl1Value = watch("imageUrl1");
  const imageUrl2Value = watch("imageUrl2");
  const imageUrl3Value = watch("imageUrl3");
  const imageUrl4Value = watch("imageUrl4");
  const imageUrl5Value = watch("imageUrl5");
  const thumbnailValue = watch("thumbnail");
  const categoryIdValue = watch("categoryId");
  const isActiveValue = watch("isActive");
  const emailValue = watch("email");
  const mobileNoValue = watch("mobileNo");

  // Check if a step is completed - FIXED VERSION
  const isStepCompleted = async (step: number): Promise<boolean> => {
    const stepFields: Record<number, ValidFieldNames[]> = {
      1: [
        "businessName",
        "email",
        "mobileNo",
        "businessUnit",
        "cvr",
        "address",
      ],
      2: ["videoUrl", "logoUrl", "descriptionShort"],
      3: ["textField1", "textField2", "textField3", "textField4", "textField5"],
      4: [
        "imageUrl1",
        "imageUrl2",
        "imageUrl3",
        "imageUrl4",
        "imageUrl5",
        "isActive",
        "status",
      ],
      5: [], // Documents are optional
      6: ["categoryId"],
    };

    // For steps 5 and 6, we need to check array fields
    if (step === 5) {
      // If there are no documents, step is automatically completed
      if (documentFields.length === 0) {
        return true;
      }

      // If there are documents, validate them
      const documentValidations = documentFields.map((_, index) =>
        trigger([
          `parDoclst.${index}.documentName`,
          `parDoclst.${index}.documentUrl`,
          `parDoclst.${index}.isActive`,
        ] as any)
      );
      const documentResults = await Promise.all(documentValidations);
      return documentResults.every((result) => result);
    }

    if (step === 6) {
      const categoryValid = await trigger("categoryId", { shouldFocus: false });
      const subCategoryValidations = subCategoryFields.map((_, index) =>
        trigger([
          `parSubCatlst.${index}.subCategoryId`,
          `parSubCatlst.${index}.isActive`,
        ] as any)
      );
      const subCategoryResults = await Promise.all(subCategoryValidations);
      return categoryValid && subCategoryResults.every((result) => result);
    }

    // For regular steps - ADD PROPER VALIDATION
    if (stepFields[step].length > 0) {
      const isValid = await trigger(stepFields[step] as any, {
        shouldFocus: false,
      });

      // Additional check for step 1 to ensure email validation passes
      if (step === 1) {
        const hasEmailErrors = !!errors.email?.message;
        const hasEmailValidationErrors = emailValidation.available === false;
        const isEmailChecking = emailValidation.checking;

        // Don't allow proceeding if email validation is in progress or failed
        if (isEmailChecking) {
          toast.error(
            t("admin.partners.waitEmailValidation") ||
              "Please wait for email validation to complete"
          );
          return false;
        }

        if (hasEmailValidationErrors) {
          toast.error(
            t("admin.partners.fixEmailErrors") ||
              "Please fix email validation errors before proceeding"
          );
          return false;
        }

        return isValid && !hasEmailErrors && !hasEmailValidationErrors;
      }

      return isValid;
    }

    return true;
  };

  // Add this function to handle document changes and auto-save
  const handleDocumentChange = async (
    field: "documentName" | "documentUrl",
    value: string,
    index: number
  ) => {
    // Update the form value
    if (field === "documentName") {
      setValue(`parDoclst.${index}.documentName`, value);
    } else {
      setValue(`parDoclst.${index}.documentUrl`, value);
    }

    // If we're editing an existing partner and both fields have values, auto-save
    if (editingPartner?.id) {
      const currentDocument = watch(`parDoclst.${index}`);
      const documentName =
        field === "documentName" ? value : currentDocument.documentName;
      const documentUrl =
        field === "documentUrl" ? value : currentDocument.documentUrl;

      // Only save if both fields are filled
      if (
        documentName &&
        documentName.trim() !== "" &&
        documentUrl &&
        documentUrl.trim() !== ""
      ) {
        // Debounce the save to avoid too many API calls
        const timeoutId = setTimeout(() => {
          handleDocumentSave(
            {
              id: currentDocument.id || 0,
              partnerId: editingPartner.id!,
              documentName: documentName.trim(),
              documentUrl: documentUrl.trim(),
              isActive: currentDocument.isActive ?? true,
            },
            index
          );
        }, 1000); // 1 second debounce

        return () => clearTimeout(timeoutId);
      }
    }
  };

  // Update the handleDocumentSave function
  const handleDocumentSave = async (
    documentData: PartnerDocumentDto,
    index: number
  ) => {
    if (!editingPartner?.id) {
      toast.error(
        t("admin.partners.savePartnerFirst") ||
          "Please save partner basic information first"
      );
      return;
    }

    // Add to saving documents array to show loading state
    setSavingDocuments((prev) => [...prev, index]);

    try {
      const payload: PartnerDocumentDto = {
        ...documentData,
        partnerId: editingPartner.id,
        isActive: true,
      };

      let response;
      if (documentData.id && documentData.id > 0) {
        // Update existing document
        response = await partnerDocumentService.updateDocument(payload);
      } else {
        // Add new document
        response = await partnerDocumentService.addDocument(payload);
      }

      // FIX: Remove .data since response is directly ApiResponse<PartnerDocument>
      if (response.isSuccess) {
        toast.success(
          t("admin.partners.documentSaved", {
            name: documentData.documentName,
          }) || `Document "${documentData.documentName}" saved successfully`
        );

        // Update the local form state with the returned document (which includes the ID)
        if (response.output) {
          setValue(`parDoclst.${index}`, {
            ...documentData,
            id: response.output.id,
            partnerId: editingPartner.id,
            isActive: true,
          });
        }

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["partners"] });
        queryClient.invalidateQueries({
          queryKey: ["partner", editingPartner.id],
        });
      } else {
        throw new Error(response.errorMessage || "Failed to save document");
      }
    } catch (error: any) {
      console.error("Document save error:", error);
      toast.error(
        t("admin.partners.documentSaveError", { error: error.message }) ||
          `Failed to save document: ${error.message}`
      );
    } finally {
      // Remove from saving documents array
      setSavingDocuments((prev) => prev.filter((i) => i !== index));
    }
  };

  // Update completed steps when current step changes
  useEffect(() => {
    const updateCompletedSteps = async () => {
      const newCompletedSteps = [...completedSteps];

      // Check all previous steps
      for (let step = 1; step < currentStep; step++) {
        if (!newCompletedSteps.includes(step)) {
          const isValid = await isStepCompleted(step);
          if (isValid && !newCompletedSteps.includes(step)) {
            newCompletedSteps.push(step);
          }
        }
      }

      setCompletedSteps(newCompletedSteps);
    };

    if (currentStep > 1) {
      updateCompletedSteps();
    }
  }, [currentStep]);

  // UPDATED: Fetch partners with status filter
  const { data: paginatedData, isLoading } = useQuery({
    queryKey: [
      "partners",
      currentPage,
      pageSize,
      debouncedSearchTerm,
      statusFilter,
    ],
    queryFn: () =>
      partnerService.getPaginated({
        page: currentPage,
        pageSize,
        searchTerm: debouncedSearchTerm || undefined,
        status: statusFilter === "All" ? "All" : statusFilter,
        sortDirection: "desc",
        sortField: "id",
      }),
    enabled: !showForm,
  });

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<
    Category[]
  >({
    queryKey: ["categories"],
    queryFn: () => categoryService.getAll(true),
    staleTime: 5 * 60 * 1000,
  });

  const { data: subCategories = [], isLoading: isLoadingSubCategories } =
    useQuery<SubCategory[]>({
      queryKey: ["subCategories", selectedCategoryId],
      queryFn: () => subCategoryService.getAll(true),
      staleTime: 5 * 60 * 1000,
      select: (data) => {
        if (selectedCategoryId > 0) {
          return data.filter(
            (subCat) => subCat.categoryId === selectedCategoryId
          );
        }
        return data;
      },
    });

  const getCategoryName = (categoryId: number) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : `Category ${categoryId}`;
  };

  useEffect(() => {
    if (categoryIdValue && categoryIdValue > 0) {
      setSelectedCategoryId(categoryIdValue);
    }
  }, [categoryIdValue]);

  useEffect(() => {
    console.log("useEffect for editing partner triggered:", {
      editingPartner,
      showForm,
    });
    if (editingPartner && showForm) {
      const formData: PartnerFormData = {
        userId: editingPartner.userId || 2,
        categoryId: editingPartner.categoryId,
        address: editingPartner.address,
        businessName: editingPartner.businessName,
        email: editingPartner.email || "",
        mobileNo: editingPartner.mobileNo || "",
        businessUnit: editingPartner.businessUnit,
        videoUrl: editingPartner.videoUrl || "",
        logoUrl: editingPartner.logoUrl || "",
        trustPilotUrl: editingPartner.trustPilotUrl || "",
        cvr: editingPartner.cvr,
        descriptionShort: editingPartner.descriptionShort || "",
        textField1: editingPartner.textField1 || "",
        textField2: editingPartner.textField2 || "",
        textField3: editingPartner.textField3 || "",
        textField4: editingPartner.textField4 || "",
        textField5: editingPartner.textField5 || "",
        imageUrl1: editingPartner.imageUrl1 || "",
        imageUrl2: editingPartner.imageUrl2 || "",
        imageUrl3: editingPartner.imageUrl3 || "",
        imageUrl4: editingPartner.imageUrl4 || "",
        imageUrl5: editingPartner.imageUrl5 || "",
        thumbnail: editingPartner.thumbnail || "",
        isActive: editingPartner.isActive,
        status: editingPartner.status || "Active",
        parSubCatlst:
          editingPartner.parSubCatlst && editingPartner.parSubCatlst.length > 0
            ? editingPartner.parSubCatlst.map((subCat) => ({
                id: subCat.id,
                partnerId: subCat.partnerId,
                subCategoryId: subCat.subCategoryId,
                isActive: subCat.isActive ?? true,
              }))
            : [{ subCategoryId: 0, isActive: true }],
        // CHANGED: Handle empty documents array
        parDoclst:
          editingPartner.parDoclst && editingPartner.parDoclst.length > 0
            ? editingPartner.parDoclst.map((doc) => ({
                id: doc.id,
                partnerId: doc.partnerId,
                documentName: doc.documentName,
                documentUrl: doc.documentUrl,
                isActive: doc.isActive ?? true,
              }))
            : [], // Empty array instead of default document
      };
      reset(formData);
      setSelectedCategoryId(editingPartner.categoryId);

      // Reset validation states for editing mode
      setEmailValidation({
        checking: false,
        available: null,
        message: "",
      });
      setMobileValidation({
        checking: false,
        available: null,
        message: "",
      });

      // Mark all steps as completed for editing mode
      setCompletedSteps([1, 2, 3, 4, 5, 6]);
    } else if (!showForm) {
      resetForm();
    }
  }, [editingPartner, showForm, reset]);

  const resetForm = () => {
    const defaultValues: PartnerFormData = {
      userId: 2,
      categoryId: 0,
      address: "",
      businessUnit: 1,
      businessName: "",
      email: "",
      mobileNo: "",
      videoUrl: "",
      logoUrl: "",
      trustPilotUrl: "",
      cvr: 0,
      descriptionShort: "",
      textField1: "",
      textField2: "",
      textField3: "",
      textField4: "",
      textField5: "",
      imageUrl1: "",
      imageUrl2: "",
      imageUrl3: "",
      imageUrl4: "",
      imageUrl5: "",
      thumbnail: "",
      isActive: true,
      status: "Active",
      parSubCatlst: [{ subCategoryId: 0, isActive: true }],
      parDoclst: [],
    };
    reset(defaultValues);
    setCurrentStep(1);
    setEditingPartner(null);
    setSelectedCategoryId(0);
    setCompletedSteps([]);
    setSavingDocuments([]);

    // Reset validation states
    setEmailValidation({
      checking: false,
      available: null,
      message: "",
    });
    setMobileValidation({
      checking: false,
      available: null,
      message: "",
    });
  };

  const createMutation = useMutation({
    mutationFn: partnerService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"], exact: false });
      toast.success(
        t("admin.partners.createSuccess") || "Partner created successfully"
      );
      handleFormClose();
    },
    onError: (error: any) => {
      console.error("Create partner error:", error);

      // Extract the actual error message from the API response
      const apiError = error?.response?.data;
      const errorMessage =
        apiError?.failureReason ||
        apiError?.errorMessage ||
        error?.message ||
        t("admin.partners.createError") ||
        "Failed to create partner";

      toast.error(errorMessage);
      setIsSubmitting(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: partnerService.update,
    onSuccess: (variables) => {
      console.log("Update mutation called with variables:", variables);
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      queryClient.invalidateQueries({ queryKey: ["partner", variables.id] });
      toast.success(
        t("admin.partners.updateSuccess") || "Partner updated successfully"
      );
      if (currentStep === steps.length) {
        handleFormClose();
      }
    },
    onError: (error: any) => {
      console.error("Update mutation error:", error);

      // Extract the actual error message from the API response
      const apiError = error?.response?.data;
      const errorMessage =
        apiError?.failureReason ||
        apiError?.errorMessage ||
        error?.message ||
        t("admin.partners.updateError") ||
        "Failed to update partner";

      toast.error(errorMessage);
      setIsSubmitting(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => partnerService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"], exact: false });
      toast.success(
        t("admin.partners.deleteSuccess") || "Partner deleted successfully"
      );
      setDeleteConfirmation({ isOpen: false, partner: null });
    },
    onError: () => {
      toast.error(
        t("admin.partners.deleteError") || "Failed to delete partner"
      );
      setDeleteConfirmation({ isOpen: false, partner: null });
    },
  });

  const handleRemoveDocumentClick = (index: number) => {
    const documentId = watch(`parDoclst.${index}.id`);
    const documentName = watch(`parDoclst.${index}.documentName`);

    setDocumentDeleteConfirmation({
      isOpen: true,
      documentIndex: index,
      documentId,
      documentName: documentName || `Document ${index + 1}`,
    });
  };

  const handleConfirmDocumentDelete = async () => {
    const { documentIndex, documentId } = documentDeleteConfirmation;

    if (documentIndex === null) return;

    if (editingPartner?.id && documentId) {
      try {
        await partnerDocumentService.deleteDocument(documentId);
        toast.success(
          t("admin.partners.documentDeleted") || "Document deleted successfully"
        );
        removeDocumentField(documentIndex);
        queryClient.invalidateQueries({
          queryKey: ["partners"],
        });
      } catch (error) {
        console.error("Delete document error:", error);
        toast.error(
          t("admin.partners.documentDeleteError") || "Failed to delete document"
        );
      }
    } else {
      removeDocumentField(documentIndex);
    }

    setDocumentDeleteConfirmation({
      isOpen: false,
      documentIndex: null,
    });
  };

  const handleCancelDocumentDelete = () => {
    setDocumentDeleteConfirmation({
      isOpen: false,
      documentIndex: null,
    });
  };

  // UPDATED: Export function with status filter
  const handleExportPartners = async () => {
    try {
      setIsExporting(true);
      const exportParams: Record<string, any> = {
        includeIsActive: true,
      };
      if (debouncedSearchTerm) {
        exportParams.searchTerm = debouncedSearchTerm;
      }
      if (statusFilter !== "All") {
        exportParams.status = statusFilter === "Active" ? "Active" : "InActive";
      } else {
        exportParams.status = "All";
      }
      console.log("Exporting partners with params:", exportParams);
      await exportToExcel("Partner", exportParams);
      toast.success(
        t("admin.partners.partnersExported") || "Partners exported successfully"
      );
    } catch (error) {
      console.error("Export failed:", error);
      const errorMessage = getErrorMessage(error, "Failed to export partners");
      toast.error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  // Modified onSubmit to handle both create and update with validation
  const onSubmit = async (data: PartnerFormData) => {
    if (isSubmitting) return;

    // Check if email or mobile validations are in progress
    if (emailValidation.checking || mobileValidation.checking) {
      toast.error(
        t("admin.partners.waitEmailValidation") ||
          "Please wait for email/mobile validation to complete"
      );
      return;
    }

    // Check if email validation failed
    if (data.email && emailValidation.available === false) {
      toast.error("Please fix email validation errors before submitting");
      return;
    }

    // Check if mobile validation failed
    if (data.mobileNo && mobileValidation.available === false) {
      toast.error(
        "Please fix mobile number validation errors before submitting"
      );
      return;
    }

    console.log("Form submission triggered with data:", data);

    const isValid = await trigger();
    if (!isValid) {
      console.log("Form validation failed:", errors);
      toast.error("Please fix form errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const subCategoriesPayload = data.parSubCatlst.map((subCat) => ({
        id: subCat.id,
        partnerId: editingPartner?.id || 0,
        subCategoryId: subCat.subCategoryId,
        isActive: subCat.isActive,
      }));

      // CHANGED: Handle empty documents array
      const documentsPayload = (data.parDoclst || []).map((doc) => ({
        id: doc.id,
        partnerId: editingPartner?.id || 0,
        documentName: doc.documentName,
        documentUrl: doc.documentUrl,
        isActive: true,
      }));

      const payload = {
        ...data,
        id: editingPartner?.id,
        parSubCatlst: subCategoriesPayload,
        parDoclst: documentsPayload, // This can now be empty array
        email: data.email || undefined,
        mobileNo: data.mobileNo || undefined,
        trustPilotUrl: data.trustPilotUrl || undefined,
      };

      console.log(
        "Final payload being sent:",
        JSON.stringify(payload, null, 2)
      );
      console.log(
        "Documents payload structure:",
        documentsPayload.map((doc) => Object.keys(doc))
      );

      if (editingPartner) {
        await updateMutation.mutateAsync(payload as any);
      } else {
        await createMutation.mutateAsync(payload as any);
      }
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Unified handleNext function for both create and update modes - FIXED VERSION
  const handleNext = async () => {
    if (isSubmitting) return;

    // Check validation states for step 1 - ENHANCED VALIDATION
    if (currentStep === 1) {
      // Check if email or mobile validations are in progress
      if (emailValidation.checking || mobileValidation.checking) {
        toast.error("Please wait for email/mobile validation to complete");
        return;
      }

      // Check if email validation failed
      if (emailValue && emailValidation.available === false) {
        toast.error(
          t("admin.partners.fixEmailErrors") ||
            "Please fix email validation errors before proceeding"
        );
        return;
      }

      // Check if mobile validation failed
      if (mobileNoValue && mobileValidation.available === false) {
        toast.error(
          t("admin.partners.fixMobileErrors") ||
            "Please fix mobile number validation errors before proceeding"
        );
        return;
      }

      // Check if required fields are empty
      const requiredFields = {
        businessName: watch("businessName"),
        email: watch("email"),
        mobileNo: watch("mobileNo"),
        cvr: watch("cvr"),
        address: watch("address"),
      };

      const emptyFields = Object.entries(requiredFields)
        .filter(([value]) => !value || value.toString().trim() === "")
        .map(([key]) => key);

      if (emptyFields.length > 0) {
        toast.error(
          t("admin.partners.fillRequiredFields") ||
            `Please fill in all required fields: ${emptyFields.join(", ")}`
        );
        return;
      }
    }

    let isValid = true;

    const stepFields: Record<number, ValidFieldNames[]> = {
      1: [
        "businessName",
        "email",
        "mobileNo",
        "businessUnit",
        "cvr",
        "address",
        "trustPilotUrl",
      ],
      2: ["videoUrl", "logoUrl", "descriptionShort"],
      3: ["textField1", "textField2", "textField3", "textField4", "textField5"],
      4: [
        "imageUrl1",
        "imageUrl2",
        "imageUrl3",
        "imageUrl4",
        "imageUrl5",
        "isActive",
        "status",
      ],
      5: [], // Documents are optional, no required fields
      6: ["categoryId"],
    };

    // Validate current step fields
    if (stepFields[currentStep].length > 0) {
      isValid = await trigger(stepFields[currentStep] as any, {
        shouldFocus: true,
      });
    }

    // Additional validation for array fields in steps 5 and 6
    if (currentStep === 5) {
      // Documents are optional, so if there are no documents, step is valid
      if (documentFields.length === 0) {
        isValid = true;
      } else {
        // If there are documents, validate them
        const documentValidations = documentFields.map((_, index) =>
          trigger([
            `parDoclst.${index}.documentName`,
            `parDoclst.${index}.documentUrl`,
            `parDoclst.${index}.isActive`,
          ] as any)
        );
        const documentResults = await Promise.all(documentValidations);
        isValid = isValid && documentResults.every((result) => result);
      }
    }

    if (currentStep === 6) {
      const categoryValid = await trigger("categoryId", { shouldFocus: true });
      isValid = isValid && categoryValid;

      const subCategoryValidations = subCategoryFields.map((_, index) =>
        trigger([
          `parSubCatlst.${index}.subCategoryId`,
          `parSubCatlst.${index}.isActive`,
        ] as any)
      );
      const subCategoryResults = await Promise.all(subCategoryValidations);
      isValid = isValid && subCategoryResults.every((result) => result);
    }

    if (!isValid) {
      console.log("Validation errors:", errors);
      toast.error(
        t("admin.partners.fixStepErrors") ||
          "Please fix all form errors in this step before proceeding"
      );
      return;
    }

    // In update mode, submit the current step before moving to next
    if (editingPartner && currentStep < steps.length) {
      setIsSubmitting(true);
      try {
        const data = watch();
        const subCategoriesPayload = data.parSubCatlst.map((subCat) => ({
          id: subCat.id,
          partnerId: editingPartner?.id || 0,
          subCategoryId: subCat.subCategoryId,
          isActive: subCat.isActive,
        }));

        // CHANGED: Handle empty documents array in update mode
        const documentsPayload = (data.parDoclst || []).map((doc) => ({
          id: doc.id,
          partnerId: editingPartner?.id || 0,
          documentName: doc.documentName,
          documentUrl: doc.documentUrl,
          isActive: doc.isActive,
        }));

        const payload = {
          ...data,
          id: editingPartner?.id,
          parSubCatlst: subCategoriesPayload,
          parDoclst: documentsPayload,
          email: data.email || undefined,
          mobileNo: data.mobileNo || undefined,
        };

        await updateMutation.mutateAsync(payload as any);
        toast.success(
          t("admin.partners.stepUpdated", { step: currentStep }) ||
            `Step ${currentStep} updated successfully`
        );
        // Move to next step after successful update
        setCurrentStep((prev) => prev + 1);
      } catch (error) {
        console.error("Step update error:", error);
      } finally {
        setIsSubmitting(false);
      }
    } else if (currentStep < steps.length) {
      // In create mode, just move to next step
      setCurrentStep((prev) => prev + 1);
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
    }
  };

  const handleBack = () => {
    if (isSubmitting) return;
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // New function to handle step click - FIXED VERSION
  const handleStepClick = async (step: number) => {
    if (isSubmitting) return;

    // In update mode, allow free navigation between steps
    if (editingPartner) {
      // But still validate that we can navigate to the requested step
      if (step > currentStep) {
        const canNavigate = await isStepCompleted(currentStep);
        if (!canNavigate) {
          toast.error(
            t("admin.partners.completeStepBefore", { currentStep, step }) ||
              `Please complete step ${currentStep} before proceeding to step ${step}`
          );
          return;
        }
      }
      setCurrentStep(step);
      return;
    }

    // For create mode, use original logic
    if (step < currentStep || completedSteps.includes(step)) {
      setCurrentStep(step);
    } else if (step === currentStep + 1) {
      await handleNext();
    } else if (step > currentStep) {
      let canNavigate = true;

      for (let i = currentStep; i < step; i++) {
        const isValid = await isStepCompleted(i);
        if (!isValid) {
          canNavigate = false;
          toast.error(
            `Please complete step ${i} before proceeding to step ${step}`
          );
          break;
        }
      }

      if (canNavigate) {
        setCurrentStep(step);
        const newCompletedSteps = [...completedSteps];
        for (let i = currentStep; i < step; i++) {
          if (!newCompletedSteps.includes(i)) {
            newCompletedSteps.push(i);
          }
        }
        setCompletedSteps(newCompletedSteps);
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // UPDATED: Status filter change handler
  const handleStatusFilterChange = (filter: "All" | "Active" | "InActive") => {
    setStatusFilter(filter);
    setCurrentPage(1);
  };

  const handleResetPassword = (partner: Partner) => {
    setResettingPartner(partner);
    setIsPasswordModalOpen(true);
  };

  const handlePasswordModalClose = () => {
    setIsPasswordModalOpen(false);
    setResettingPartner(null);
  };

  const handleFormClose = () => {
    setShowForm(false);
    resetForm();
    setIsSubmitting(false);
  };

  const handleAddPartner = () => {
    setEditingPartner(null);
    setShowForm(true);
    resetForm();
  };

  const handleEditPartner = (partner: Partner) => {
    setEditingPartner(partner);
    setShowForm(true);
  };

  const handleDeletePartner = (partner: Partner) => {
    if (!partner.id) return;

    // Show delete confirmation modal
    setDeleteConfirmation({
      isOpen: true,
      partner: partner,
    });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmation.partner?.id) {
      deleteMutation.mutate(deleteConfirmation.partner.id);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation({ isOpen: false, partner: null });
  };

  const addSubCategoryField = () => {
    appendSubCategory({ subCategoryId: 0, isActive: true });
  };

  const removeSubCategoryField = (index: number) => {
    if (subCategoryFields.length > 1) {
      removeSubCategory(index);
    }
  };

  const addDocumentField = () => {
    appendDocument({ documentName: "", documentUrl: "", isActive: true });
  };

  const removeDocumentField = (index: number) => {
    // CHANGED: Allow removing even when there's only one document
    // since documents are optional
    removeDocument(index);
  };

  const handleImagePreview = (url: string) => {
    setPreviewImage({ url, isOpen: true });
  };

  const handleVideoPreview = (url: string) => {
    setPreviewVideo({ url, isOpen: true });
  };

  const handleCategoryChange = (categoryId: number | string) => {
    console.log("Category changed to:", categoryId);
    const categoryIdNum =
      typeof categoryId === "string" ? parseInt(categoryId, 10) : categoryId;

    setSelectedCategoryId(categoryIdNum);

    if (subCategoryFields.length > 0) {
      subCategoryFields.forEach((_, index) => {
        setValue(`parSubCatlst.${index}.subCategoryId`, 0);
        setValue(`parSubCatlst.${index}.isActive`, true);
      });
    }
  };

  // Get data from API response
  const partners = paginatedData?.output?.result || [];
  const totalItems = paginatedData?.output?.rowCount || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // UPDATED: Check if there are any records to display
  const hasRecords = partners.length > 0;

  // UPDATED: Columns with status field
  const columns: ColumnDef<Partner>[] = [
    { accessorKey: "id", header: t("admin.partners.id") || "ID" },
    {
      accessorKey: "businessName",
      header: t("admin.partners.BusinessName") || "Business Name",
    },
    {
      accessorKey: "categoryId",
      header: t("admin.categories.title") || "Category",
      cell: ({ row }) => getCategoryName(row.original.categoryId),
    },
    {
      accessorKey: "subCategories",
      header: t("admin.subcategories.title") || "Sub Categories",
      cell: ({ row }) => {
        const subCategories = row.original.parSubCatlst;

        if (!subCategories || subCategories.length === 0) {
          return <span className="text-gray-400">No subcategories</span>;
        }

        // Get unique subcategory names
        const uniqueSubCategories = Array.from(
          new Set(
            subCategories
              .filter((subCat) => subCat.subCategories)
              .map((subCat) => subCat.subCategories)
          )
        );

        if (uniqueSubCategories.length === 0) {
          return <span className="text-gray-400">No subcategories</span>;
        }

        return (
          <div className="max-w-xs">
            {uniqueSubCategories.map((subCatName, index) => (
              <span
                key={index}
                className="inline-block text-black text-xs px-2 py-1  mr-1 mb-1 cursor-pointer"
              >
                {subCatName}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "address",
      header: t("common.address") || "Address",
      cell: ({ row }) => {
        const address = row.original.address;
        if (!address) return "-";

        return address.length > 50 ? `${address.substring(0, 50)}...` : address;
      },
    },
    { accessorKey: "cvr", header: t("admin.partners.cvr") || "CVR" },
    {
      accessorKey: "mobileNo",
      header: t("admin.partners.mobileNo") || "Mobile Number",
    },
    {
      accessorKey: "isActive",
      header: t("admin.partners.status") || "Status",
      enableSorting: false,
      cell: ({ row }) => (
        <span
          className="px-2 py-1 rounded-full text-xs text-white font-medium"
          style={{
            backgroundColor: row.original.isActive
              ? "var(--color-secondary)"
              : "var(--color-neutral)",
          }}
        >
          {row.original.isActive
            ? t("common.active") || "Active"
            : t("common.inactive") || "Inactive"}
        </span>
      ),
    },
    {
      id: "actions",
      header: t("common.actions") || "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleAddTestimonial(row.original)}
            disabled={showForm}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
            title={t("admin.partners.addTestimonial") || "Add Testimonial"}
          >
            <IconTestimonial />
          </button>
          <button
            onClick={() => handleEditPartner(row.original)}
            disabled={showForm}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
            title={t("admin.partners.editPartner") || "Edit partner"}
          >
            <IconPencil />
          </button>
          <button
            onClick={() => handleResetPassword(row.original)}
            disabled={showForm}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
            title={t("admin.partners.resetPassword") || "Reset Password"}
          >
            <IconKey />
          </button>
          <button
            onClick={() => handleDeletePartner(row.original)}
            disabled={showForm}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
            title={t("admin.partners.deletePartner") || "Delete partner"}
          >
            <IconTrash />
          </button>
        </div>
      ),
    },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 sm:space-y-5">
            <h3 className="text-lg font-bold text-gray-900 mt-4 sm:mt-6">
              {t("admin.partners.BasicInformation") || "Basic Information"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Input
                label={
                  <>
                    {t("admin.partners.businessName") || "Business Name"}
                    <span className="text-red-500 ml-1">*</span>
                  </>
                }
                error={
                  errors.businessName?.message &&
                  t("validation.businessNameRequired")
                }
                {...register("businessName")}
              />

              {/* Email Field */}
              <div className="space-y-1">
                <Input
                  label={
                    <>
                      {t("admin.partners.email") || "Email"}
                      <span className="text-red-500 ml-1">*</span>
                    </>
                  }
                  type="email"
                  value={emailValue || ""}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder={
                    t("common.enterEmailAddress") || "Enter email address"
                  }
                  className={
                    emailValidation.available === false ? "border-red-500" : ""
                  }
                />
                {emailValidation.checking && (
                  <div className="flex items-center gap-2 text-blue-600 text-sm">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 cursor-pointer"></div>
                    {t("admin.partners.emailChecking") ||
                      "Checking email availability..."}
                  </div>
                )}
                {emailValidation.available === true &&
                  !emailValidation.checking && (
                    <div className="text-green-600 text-sm flex items-center gap-1">
                      <svg
                        className="w-4 h-4 cursor-pointer"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {t("admin.partners.emailAvailable") ||
                        "Email is available"}
                    </div>
                  )}
                {emailValidation.available === false &&
                  !emailValidation.checking && (
                    <div className="text-red-600 text-sm flex items-center gap-1">
                      <svg
                        className="w-4 h-4 cursor-pointer"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {t("admin.partners.emailNotAvailable") ||
                        "Email already registered"}
                    </div>
                  )}
                {errors.email?.message &&
                  emailValidation.available !== false && (
                    <div className="text-red-600 text-sm flex items-center gap-1">
                      <svg
                        className="w-4 h-4 cursor-pointer"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {t("validation.emailRequired") || "Email is required"}
                    </div>
                  )}
              </div>

              {/* Mobile Field */}
              <div className="space-y-1">
                <Input
                  label={
                    <>
                      {t("admin.partners.mobileNumber") || "Mobile Number"}
                      <span className="text-red-500 ml-1">*</span>
                    </>
                  }
                  value={mobileNoValue || ""}
                  onChange={(e) => handleMobileChange(e.target.value)}
                  placeholder={
                    t("common.mobilePlaceholder") ||
                    "Enter 8-digit mobile number"
                  }
                  className={
                    mobileValidation.available === false ? "border-red-500" : ""
                  }
                  maxLength={8}
                />
                {mobileValidation.checking && (
                  <div className="flex items-center gap-2 text-blue-600 text-sm">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 cursor-pointer"></div>
                    {t("admin.partners.mobileChecking") ||
                      "Checking mobile number availability..."}
                  </div>
                )}
                {mobileValidation.available === true &&
                  !mobileValidation.checking && (
                    <div className="text-green-600 text-sm flex items-center gap-1">
                      <svg
                        className="w-4 h-4 cursor-pointer"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {t("admin.partners.mobileAvailable") ||
                        "Mobile number is available"}
                    </div>
                  )}
                {mobileValidation.available === false &&
                  !mobileValidation.checking && (
                    <div className="text-red-600 text-sm flex items-center gap-1">
                      <svg
                        className="w-4 h-4 cursor-pointer"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {mobileValidation.message}
                    </div>
                  )}
                {errors.mobileNo?.message &&
                  mobileValidation.available !== false && (
                    <div className="text-red-600 text-sm flex items-center gap-1">
                      <svg
                        className="w-4 h-4 cursor-pointer"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {t("validation.mobileRequired") ||
                        "Mobile number is required"}
                    </div>
                  )}
              </div>

              <Input
                label="CVR"
                type="number"
                error={errors.cvr?.message && t("validation.cvrRequired")}
                {...register("cvr", { valueAsNumber: true })}
              />
            </div>
            <TextArea
              label={
                <>
                  {t("admin.partners.address") || "Address"}
                  <span className="text-red-500 ml-1">*</span>
                </>
              }
              error={errors.address?.message && t("validation.addressRequired")}
              rows={3}
              placeholder={t("common.enterFullAddress") || "Enter full address"}
              {...register("address")}
            />
            <Input
              label={t("admin.partners.trustPilotUrl") || "TrustPilot URL"}
              type="url"
              error={
                errors.trustPilotUrl?.message &&
                t("validation.trustPilotUrlInvalid")
              }
              {...register("trustPilotUrl")}
              placeholder={
                t("common.trustPilotPlaceholder") ||
                "https://www.trustpilot.com/review/your-business"
              }
            />
            <ToggleSwitch
              label={t("common.active") || "Active"}
              checked={isActiveValue}
              onChange={(checked) => setValue("isActive", checked)}
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mt-4 sm:mt-6">
              {t("admin.partners.Media&Description") || "Media & Description"}
            </h3>

            <div className="space-y-3">
              <ImageUpload
                label={
                  t("admin.partners.thumbnailUpload") || "Thumbnail Upload"
                }
                value={thumbnailValue}
                onChange={(url) => setValue("thumbnail", url)}
                onPreview={handleImagePreview}
                folder="partners/thumbnails"
                error={errors.thumbnail?.message}
                exactDimensions={{ width: 1440, height: 710 }}
                showDimensionValidation={true}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <VideoUpload
                label=""
                value={videoUrlValue || ""}
                onChange={(url) => setValue("videoUrl", url)}
                onPreview={handleVideoPreview}
                folder="partners/videos"
                error={errors.videoUrl?.message}
              />

              <LogoUploadWithValidation
                label={t("admin.partners.logoUpload") || "Logo Upload"}
                value={logoUrlValue || ""}
                onChange={(url) => setValue("logoUrl", url)}
                onPreview={handleImagePreview}
                error={errors.logoUrl?.message}
              />
            </div>

            <TextArea
              label={
                t("admin.partners.shortDescription") || "Short Description"
              }
              error={errors.descriptionShort?.message}
              rows={3}
              {...register("descriptionShort")}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mt-4 sm:mt-6">
              {t("admin.partners.TextFields") || "Text Fields"}
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <TextArea
                label={
                  t("admin.partners.longDescription") || "Long Description"
                }
                rows={6}
                error={errors.textField1?.message}
                {...register("textField1")}
              />
              <div>
                <RichTextEditor
                  label={t("admin.partners.TextField2") || "Text Fields 2"}
                  value={watch("textField2") || ""}
                  onChange={(value) => setValue("textField2", value)}
                  error={errors.textField2?.message}
                  placeholder="Enter formatted text for Text Field 2..."
                  height="min-h-[120px] sm:min-h-[150px]"
                />
              </div>

              {/* Rich Text Editor for Text Field 3 */}
              <div>
                <RichTextEditor
                  label={t("admin.partners.TextField3") || "Text Fields 3"}
                  value={watch("textField3") || ""}
                  onChange={(value) => setValue("textField3", value)}
                  error={errors.textField3?.message}
                  placeholder="Enter formatted text for Text Field 3..."
                  height="min-h-[120px] sm:min-h-[150px]"
                />
              </div>
              <div>
                <RichTextEditor
                  label={t("admin.partners.TextField4") || "Text Fields 4"}
                  value={watch("textField4") || ""}
                  onChange={(value) => setValue("textField4", value)}
                  error={errors.textField4?.message}
                  placeholder="Enter formatted text for Text Field 4..."
                  height="min-h-[120px] sm:min-h-[150px]"
                />
              </div>
              <Input
                label={t("admin.partners.TextField5") || "Text Fields 5"}
                error={errors.textField5?.message}
                {...register("textField5")}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mt-4 sm:mt-6">
              {t("admin.partners.Images&Status") || "Images & Status"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <ImageUpload
                label={t("admin.partners.ImageUpload1") || "Image Upload 1"}
                value={imageUrl1Value}
                onChange={(url) => setValue("imageUrl1", url)}
                onPreview={handleImagePreview}
                folder="partners/images"
                error={errors.imageUrl1?.message}
                exactDimensions={{ width: 1440, height: 710 }}
                showDimensionValidation={true}
              />

              <ImageUpload
                label={t("admin.partners.ImageUpload2") || "Image Upload 2"}
                value={imageUrl2Value}
                onChange={(url) => setValue("imageUrl2", url)}
                onPreview={handleImagePreview}
                folder="partners/images"
                error={errors.imageUrl2?.message}
                exactDimensions={{ width: 439, height: 468 }}
                showDimensionValidation={true}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <ImageUpload
                label={t("admin.partners.ImageUpload3") || "Image Upload 3"}
                value={imageUrl3Value}
                onChange={(url) => setValue("imageUrl3", url)}
                onPreview={handleImagePreview}
                folder="partners/images"
                error={errors.imageUrl3?.message}
                exactDimensions={{ width: 439, height: 468 }}
                showDimensionValidation={true}
              />
              <ImageUpload
                label={t("admin.partners.ImageUpload4") || "Image Upload 4"}
                value={imageUrl4Value}
                onChange={(url) => setValue("imageUrl4", url)}
                onPreview={handleImagePreview}
                folder="partners/images"
                error={errors.imageUrl4?.message}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <ImageUpload
                label={t("admin.partners.ImageUpload5") || "Image Upload 5"}
                value={imageUrl5Value}
                onChange={(url) => setValue("imageUrl5", url)}
                onPreview={handleImagePreview}
                folder="partners/images"
                error={errors.imageUrl5?.message}
              />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 mt-4 sm:mt-6">
              {t("admin.partners.Documents") || "Documents"}
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-3">
                {t("admin.partners.partnerDocuments") || "Partner Documents"}
              </h4>

              {/* No documents message */}
              {documentFields.length === 0 && (
                <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg mb-4">
                  <p className="text-gray-500 text-sm">
                    {t("admin.partners.noDocumentsAdded") ||
                      "Ingen dokumenter tilføjet"}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    {t("admin.partners.documentsOptional") ||
                      "Dokumenter er valgfrie"}
                  </p>
                </div>
              )}

              {/* Document fields */}
              {documentFields.map((field, index) => (
                <div
                  key={field.id}
                  className="border border-gray-200 rounded-lg p-4 mb-4 bg-white"
                >
                  <div className="space-y-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("admin.partners.DocumentName") || "Document Name"}{" "}
                        {index + 1} <span className="text-red-500">*</span>
                      </label>
                      <Input
                        error={
                          errors.parDoclst?.[index]?.documentName?.message &&
                          t("validation.documentNameRequired")
                        }
                        value={watch(`parDoclst.${index}.documentName`)}
                        onChange={(e) =>
                          handleDocumentChange(
                            "documentName",
                            e.target.value,
                            index
                          )
                        }
                        placeholder={
                          t("admin.partners.documentPlaceholder") ||
                          "Enter document name (e.g., Business License, Contract, Certificate)"
                        }
                        required
                        disabled={savingDocuments.includes(index)}
                      />
                    </div>

                    <div>
                      <DocumentUpload
                        label={`${
                          t("admin.partners.DocumentFile") || "Document File"
                        } ${index + 1}`}
                        value={watch(`parDoclst.${index}.documentUrl`)}
                        onChange={(url) => {
                          setValue(`parDoclst.${index}.documentUrl`, url);
                          handleDocumentChange("documentUrl", url, index);
                        }}
                        onPreview={(url) =>
                          handleDocumentPreview(
                            url,
                            watch(`parDoclst.${index}.documentName`)
                          )
                        }
                        folder="partners/documents"
                        error={
                          errors.parDoclst?.[index]?.documentUrl?.message &&
                          t("validation.documentUrlRequired")
                        }
                        required
                      />
                    </div>

                    {savingDocuments.includes(index) && (
                      <div className="flex items-center gap-2 text-blue-600 text-sm">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 cursor-pointer"></div>
                        {t("common.savingDocument") || "Saving document..."}
                      </div>
                    )}
                  </div>

                  {/* FIXED: Always show remove button when there are documents */}
                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => handleRemoveDocumentClick(index)}
                      disabled={savingDocuments.includes(index)}
                      className="cursor-pointer"
                    >
                      {t("common.removeDocument") || "Remove Document"}
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                onClick={addDocumentField}
                style={{
                  backgroundColor: "#95C11F",
                  borderColor: "#95C11F",
                  color: "white",
                }}
                className="hover:bg-[#85B11F] hover:border-[#85B11F] cursor-pointer"
              >
                {t("admin.partners.AddDocument") || "Add Document"} +
              </Button>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 mt-4 sm:mt-6">
              {t("admin.partners.Categories&SubCategories") ||
                "Categories & SubCategories"}
            </h3>
            <div className="bg-[#F0F2EA] p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-3">
                {t("admin.partners.SelectCategory") || "Select Category"}
              </h4>
              {isLoadingCategories ? (
                <div className="text-center py-2">
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 cursor-pointer"></div>
                  <p className="mt-1 text-gray-600 text-sm">
                    {t("common.loadingCategories") || "Loading categories..."}
                  </p>
                </div>
              ) : (
                <SearchableSelectController
                  name="categoryId"
                  control={control}
                  label={t("admin.categories.title") || "Category"}
                  error={
                    errors.categoryId?.message &&
                    t("validation.categoryRequired")
                  }
                  options={categories
                    .filter((cat) => cat.isActive)
                    .map((cat) => ({
                      value: cat.id,
                      label: cat.name,
                    }))}
                  placeholder={
                    isLoadingCategories
                      ? t("common.loadingCategories") || "Loading categories..."
                      : categories.filter((cat) => cat.isActive).length === 0
                      ? t("admin.partners.noActiveCategoriesWarning") ||
                        "No active categories available"
                      : t("common.selectCategory") || "Select Category"
                  }
                  disabled={
                    isLoadingCategories ||
                    categories.filter((cat) => cat.isActive).length === 0
                  }
                  required={true}
                  onChange={handleCategoryChange}
                />
              )}
              {!isLoadingCategories &&
                categories.filter((cat) => cat.isActive).length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <svg
                        className="w-4 h-4 cursor-pointer"
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
                      <span className="text-sm font-medium">
                        {t("admin.partners.noActiveCategoriesWarning") ||
                          "No Active Categories Available"}
                      </span>
                    </div>
                    <p className="text-yellow-700 text-sm mt-1">
                      {t("admin.partners.noActiveCategoriesMessage") ||
                        "You need to create active categories before adding partners."}
                    </p>
                  </div>
                )}
            </div>
            {selectedCategoryId > 0 && (
              <div className="bg-[#F0F2EA] p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-3">
                  {t("admin.subcategories.title") || "Sub Categories"}
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  {t("admin.partners.addSubCategories") ||
                    "Add one or more sub categories for this partner under the selected category"}
                </p>
                {isLoadingSubCategories ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 cursor-pointer"></div>
                    <p className="mt-2 text-gray-600">
                      {t("admin.partners.loadingSubCategories") ||
                        "Loading sub categories..."}
                    </p>
                  </div>
                ) : (
                  <>
                    {subCategoryFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="flex flex-col sm:flex-row items-end gap-3 sm:gap-4 p-4 border border-gray-200 rounded-lg mb-3"
                      >
                        <div className="flex-1 w-full">
                          <SearchableSelectController
                            name={`parSubCatlst.${index}.subCategoryId`}
                            control={control}
                            label={`${
                              t("admin.subcategories.title") || "Sub Category"
                            } ${index + 1}`}
                            error={
                              errors.parSubCatlst?.[index]?.subCategoryId
                                ?.message && t("validation.subCategoryRequired")
                            }
                            options={subCategories
                              .filter((subCat) => subCat.isActive)
                              .map((subCat) => ({
                                value: subCat.id,
                                label: subCat.name,
                              }))}
                            placeholder={
                              isLoadingSubCategories
                                ? t("admin.partners.loadingSubCategories") ||
                                  "Loading sub categories..."
                                : subCategories.filter(
                                    (subCat) => subCat.isActive
                                  ).length === 0
                                ? t(
                                    "admin.partners.noSubCategoriesAvailable"
                                  ) ||
                                  "No active sub categories available for this category"
                                : t("admin.partners.selectSubcategory") ||
                                  "Select Sub Category"
                            }
                            disabled={
                              isLoadingSubCategories ||
                              subCategories.filter((subCat) => subCat.isActive)
                                .length === 0
                            }
                            required={true}
                          />
                        </div>
                        {subCategoryFields.length > 1 && (
                          <Button
                            type="button"
                            variant="danger"
                            onClick={() => removeSubCategoryField(index)}
                            className="mb-1 cursor-pointer w-full sm:w-auto"
                          >
                            {t("common.remove") || "Remove"}
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={addSubCategoryField}
                      style={{
                        backgroundColor: "#95C11F",
                        borderColor: "#95C11F",
                        color: "white",
                      }}
                      className="hover:bg-[#85B11F] hover:border-[#85B11F] cursor-pointer w-full sm:w-auto"
                    >
                      {t("admin.partners.AddsubCategory") ||
                        "Add Sub Categories"}{" "}
                      +
                    </Button>
                    {!isLoadingSubCategories &&
                      subCategories.filter((subCat) => subCat.isActive)
                        .length === 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                          <div className="flex items-center gap-2 text-yellow-800">
                            <svg
                              className="w-4 h-4 cursor-pointer"
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
                            <span className="text-sm font-medium">
                              {t(
                                "admin.partners.noActiveSubCategoriesWarning"
                              ) || "No Active Sub Categories Available"}
                            </span>
                          </div>
                          <p className="text-yellow-700 text-sm mt-1">
                            {t("admin.partners.noActiveSubCategoriesMessage") ||
                              "There are no active subcategories available for the selected category."}
                          </p>
                        </div>
                      )}
                  </>
                )}
                {errors.parSubCatlst && !errors.parSubCatlst.root && (
                  <p className="text-red-500 text-sm mt-2">
                    {t("validation.atLeastOneSubCategory") ||
                      "At least one sub category is required"}
                  </p>
                )}
              </div>
            )}
            {selectedCategoryId === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-blue-800">
                  <svg
                    className="w-5 h-5 cursor-pointer"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-medium">
                    {t("admin.partners.selectCategoryFirst") ||
                      "Select a Category First"}
                  </span>
                </div>
                <p className="text-blue-700 text-sm mt-1">
                  {t("admin.partners.selectCategoryFirstMessage") ||
                    "Please select a category above to see available subcategories."}
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderFormFooter = () => (
    <div className="flex flex-col sm:flex-row justify-between pt-4 sm:pt-6 mt-4 border-t border-gray-200 gap-3 sm:gap-0">
      <div>
        {currentStep > 1 && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleBack}
            disabled={isSubmitting}
            className="cursor-pointer w-full sm:w-auto mb-2 sm:mb-0"
          >
            {t("common.Previous") || "Previous"}
          </Button>
        )}
      </div>
      <div className="flex gap-2">
        {currentStep < steps.length ? (
          <Button
            key="next"
            type="button"
            variant="secondary"
            size="lg"
            onClick={handleNext}
            disabled={isSubmitting}
            className="cursor-pointer w-full sm:w-auto"
          >
            {isSubmitting
              ? t("common.updating") || "Updating..."
              : t("common.Next") || "Next"}
          </Button>
        ) : (
          <Button
            key="submit"
            size="lg"
            type="submit"
            disabled={
              isSubmitting ||
              createMutation.isPending ||
              updateMutation.isPending
            }
            className="cursor-pointer w-full sm:w-auto"
          >
            {isSubmitting
              ? t("common.Submitting") || "Submitting..."
              : editingPartner
              ? t("common.update")
              : t("common.create")}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-3 sm:p-4">
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

      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={
          deleteConfirmation.partner
            ? t("admin.partners.deletePartnerItem", {
                businessName: deleteConfirmation.partner.businessName,
                cvr: deleteConfirmation.partner.cvr,
              }) ||
              `Partner: ${deleteConfirmation.partner.businessName} (CVR: ${deleteConfirmation.partner.cvr})`
            : undefined
        }
        confirmationMessage={
          t("admin.partners.deleteConfirm") ||
          "Are you sure you want to delete this partner?"
        }
        isLoading={deleteMutation.isPending}
      />

      {/* Document Delete Confirmation */}
      <DeleteConfirmation
        open={documentDeleteConfirmation.isOpen}
        onClose={handleCancelDocumentDelete}
        onConfirm={handleConfirmDocumentDelete}
        title={t("admin.partners.deleteDocumentTitle") || "Delete Document"}
        itemName={
          documentDeleteConfirmation.documentName
            ? t("admin.partners.deleteDocumentItem", {
                name: documentDeleteConfirmation.documentName,
              }) || `Document: ${documentDeleteConfirmation.documentName}`
            : undefined
        }
        confirmationMessage={
          t("admin.partners.deleteDocumentConfirm") ||
          "Are you sure you want to delete this document?"
        }
        confirmButtonText={
          t("admin.partners.deleteDocumentButton") || "Delete Document"
        }
        cancelButtonText={t("common.cancel") || "Cancel"}
      />

      {!showForm && (
        <div className="p-2 mb-2 sm:p-3 sm:mb-4">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div className="font-figtree flex justify-center lg:justify-start">
              <Button
                variant="primary"
                size="md"
                onClick={handleAddPartner}
                disabled={showForm}
                icon={IconPlus}
                iconPosition="left"
                iconSize="w-5 h-5"
                className="cursor-pointer"
              >
                {t("admin.partners.addPartner")}
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <div className="w-full sm:w-auto">
                <FilterDropdown
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="w-full sm:w-auto"
                />
              </div>

              <div className="w-full sm:flex-1 lg:w-64">
                <SearchBar
                  searchTerm={searchTerm}
                  onSearchChange={handleSearchChange}
                />
              </div>

              {/* UPDATED: Export Button with hasRecords check */}
              <Button
                variant="outline"
                size="md"
                onClick={handleExportPartners}
                disabled={isExporting || !hasRecords}
                icon={IconUpload}
                iconPosition="left"
                iconSize="w-5 h-5"
                className="cursor-pointer w-full sm:w-auto"
              >
                {isExporting
                  ? t("common.exporting") || "Exporting..."
                  : t("common.ExportCSV") || "Export CSV"}
              </Button>
            </div>
          </div>
        </div>
      )}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          {/* Updated header with back arrow */}
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <button
              onClick={handleFormClose}
              disabled={isSubmitting}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-[#165933] text-white cursor-pointer flex-shrink-0"
              title="Go back"
            >
              <IconArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                {editingPartner
                  ? t("admin.partners.editPartner")
                  : t("admin.partners.addPartner")}
              </h2>
            </div>
          </div>

          {/* Stepper - Make it scrollable on mobile */}
          <div className="overflow-x-auto p-2">
            <div className="min-w-max">
              <Stepper
                currentStep={currentStep}
                steps={steps}
                onStepClick={handleStepClick}
                completedSteps={completedSteps}
              />
            </div>
          </div>

          <form
            onSubmit={handleSubmit((data) => {
              console.log("Form submission triggered with data:", data);
              onSubmit(data);
            })}
          >
            <div className="px-0 sm:px-1 mb-4 sm:mb-6">
              {renderStepContent()}
            </div>
            {renderFormFooter()}
          </form>
        </div>
      )}
      {!showForm && (
        <>
          {isLoading ? (
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 text-center">
              <div
                className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 cursor-pointer"
                style={{ borderColor: "var(--color-primary)" }}
              ></div>
              <p className="mt-3 sm:mt-4 text-gray-600 text-sm sm:text-base">
                {t("common.loading")}
              </p>
            </div>
          ) : (
            /* UPDATED: Data Table or No Records Message */
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {hasRecords ? (
                <>
                  <div className="overflow-x-auto">
                    <DataTable data={partners} columns={columns} />
                  </div>
                  {/* Only show pagination if there are records and more than one page */}
                  {hasRecords && totalPages > 1 && (
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4">
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
              ) : (
                /* No Records Found Message */
                <div className="p-6 sm:p-8 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <IconNoRecords className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mb-3 sm:mb-4 cursor-pointer" />
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                      {t("common.noRecordsFound") || "No records found"}
                    </h3>
                    <p className="text-gray-500 text-xs sm:text-sm mb-3 sm:mb-4 px-4">
                      {searchTerm || statusFilter !== "All"
                        ? t("admin.partners.adjustSearch") ||
                          "Try adjusting your search or filter criteria"
                        : t("admin.partners.noPartnersCreated") ||
                          "No partners have been created yet"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
      <ImagePreviewModal
        imageUrl={previewImage.url}
        isOpen={previewImage.isOpen}
        onClose={() => setPreviewImage({ url: "", isOpen: false })}
      />
      <VideoPreviewModal
        videoUrl={previewVideo.url}
        isOpen={previewVideo.isOpen}
        onClose={() => setPreviewVideo({ url: "", isOpen: false })}
      />
      <DocumentPreviewModal
        documentUrl={previewDocument.url}
        documentName={previewDocument.name}
        isOpen={previewDocument.isOpen}
        onClose={() => setPreviewDocument({ url: "", name: "", isOpen: false })}
      />
      <ResetPasswordModal
        open={isPasswordModalOpen}
        onClose={handlePasswordModalClose}
        onSuccess={() => {
          toast.success(
            t("admin.partners.passwordResetSuccess", {
              email: resettingPartner?.email,
            }) || `Password reset successfully for ${resettingPartner?.email}`
          );
          setResettingPartner(null);
        }}
        targetUser={{
          email: resettingPartner?.email || "",
          businessName: resettingPartner?.businessName,
        }}
      />
    </div>
  );
}
