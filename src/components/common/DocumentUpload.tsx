// src/components/common/DocumentUpload.tsx
import { useRef, useState } from "react";
import { uploadService } from "../../services/uploadS3.service";
import AdminToast from "./AdminToast";
import type { AdminToastType } from "./AdminToast";
import { FileText } from "lucide-react";
import { useTranslation } from "react-i18next";

// Toast state interface
interface ToastState {
  id: string;
  type: AdminToastType;
  message: string;
  title?: string;
  subtitle?: string;
  open: boolean;
}

interface DocumentUploadProps {
  label: React.ReactNode;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  error?: string;
  onPreview?: (url: string, fileName?: string) => void;
  required?: boolean;
  accept?: string;
}

export default function DocumentUpload({
  label,
  value,
  onChange,
  folder = "documents",
  error,
  onPreview,
  required = false,
  accept = ".pdf,.doc,.docx,.txt,.xlsx,.xls,.xlsm,.ppt,.pptx,.rtf",
}: DocumentUploadProps) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Remove toast from state after animation
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const allowedExtensions = [
      "pdf",
      "doc",
      "docx",
      "txt",
      "xlsx",
      "xls",
      "xlsm",
      "ppt",
      "pptx",
      "rtf",
    ];

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      toast.error(
        t("admin.partners.invalidDocumentFile") ||
          "Please select a valid document file (PDF, Word, Excel, PowerPoint, Text)"
      );
      return;
    }

    // Check file size (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(
        t("admin.partners.documentSizeExceeded") ||
          "Document size should be less than 50MB"
      );
      return;
    }

    setUploading(true);
    try {
      const url = await uploadService.uploadDocument(file, folder);
      onChange(url);
      toast.success(
        t("admin.partners.uploadSuccess") || "Document uploaded successfully"
      );
    } catch (error) {
      console.error("Document upload error:", error);
      toast.error(
        t("admin.partners.uploadFailed") || "Failed to upload document"
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClick = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  const handlePreview = () => {
    if (value && onPreview) {
      onPreview(value, getFileNameFromUrl(value));
    }
  };

  const getFileIcon = (url: string) => {
    if (url.includes(".pdf")) return "📄";
    if (url.includes(".doc")) return "📝";
    if (url.includes(".xls")) return "📊";
    if (url.includes(".ppt")) return "📽️";
    return "📎";
  };

  const getFileNameFromUrl = (url: string) => {
    try {
      return decodeURIComponent(url.split("/").pop() || "Document");
    } catch {
      return "Document";
    }
  };

  const getFileTypeText = (url: string) => {
    if (url.includes(".pdf"))
      return t("admin.partners.pdfDocument") || "PDF Document";
    if (url.includes(".doc"))
      return t("admin.partners.wordDocument") || "Word Document";
    if (url.includes(".xls"))
      return t("admin.partners.excelSpreadsheet") || "Excel Spreadsheet";
    if (url.includes(".ppt"))
      return (
        t("admin.partners.powerpointPresentation") || "PowerPoint Presentation"
      );
    if (url.includes(".txt"))
      return t("admin.partners.textFile") || "Text File";
    return t("admin.partners.document") || "Document";
  };

  return (
    <div className="w-full">
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

      {/* Section Title */}
      <label className="block text-base font-semibold text-gray-900 mb-2 cursor-pointer">
        {label}
        {required}
      </label>

      {/* Sub Label */}
      <p className="text-sm text-gray-500 mb-2 cursor-pointer">
        {t("admin.partners.UploadDocument") || "Upload Document"}{" "}
        <span className="text-gray-400">
          {t("admin.partners.maxFileSize", { size: 50 }) || "(Max: 50MB)"}
        </span>
      </p>

      {/* Upload Box */}
      <div
        onClick={handleClick}
        className={`w-full border-2 border-dashed rounded-md cursor-pointer flex flex-col items-center justify-center py-1 transition
          ${
            uploading
              ? "opacity-60 cursor-not-allowed"
              : "hover:border-[#91C73D] hover:bg-gray-50"
          }
          ${error ? "border-red-300" : "border-gray-300"}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <svg
              className="w-6 h-6 animate-spin text-gray-400 cursor-pointer"
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
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 
                5.291A7.962 7.962 0 014 12H0c0 
                3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-sm">
              {t("admin.partners.uploading") || "Uploading..."}
            </p>
          </div>
        ) : value ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-20 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center cursor-pointer">
              <span className="text-2xl">{getFileIcon(value)}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400 truncate">
                {getFileNameFromUrl(value)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {getFileTypeText(value)}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-600">
            <FileText className="w-6 h-6 text-[#91C73D] mb-1 cursor-pointer" />
            <p className="text-sm text-[#91C73D] font-medium cursor-pointer">
              {t("admin.partners.clickToUpload") || "Click to upload document"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {t("admin.partners.supportedFormats") ||
                "PDF, Word, Excel, PowerPoint, Text"}
            </p>
          </div>
        )}
      </div>

      {/* Document Preview */}
      {value && !uploading && (
        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-start gap-3">
            {/* Document Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-white rounded border flex items-center justify-center cursor-pointer">
                <span className="text-2xl">{getFileIcon(value)}</span>
              </div>
            </div>

            {/* Document Info and Actions */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-800">
                {getFileNameFromUrl(value)}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {getFileTypeText(value)}
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={handlePreview}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 cursor-pointer"
                  title="Preview document"
                >
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3-3H7"
                    />
                  </svg>
                  {t("admin.partners.preview") || "Preview"}
                </button>
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center gap-1 cursor-pointer"
                  title="Open document in new tab"
                >
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
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  {t("admin.partners.open") || "Open"}
                </a>
                <a
                  href={value}
                  download
                  className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center gap-1 cursor-pointer"
                  title="Download document"
                >
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
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  {t("admin.partners.download") || "Download"}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
          {error}
        </p>
      )}
    </div>
  );
}