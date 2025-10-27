// src/components/common/DocumentUpload.tsx
import { useRef, useState } from "react";
import { toast } from "sonner";
import Button from "./Button";
import { uploadService } from "../../services/uploadS3.service";

interface DocumentUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  onPreview?: (url: string) => void;
  folder?: string;
  error?: string;
  accept?: string;
  required?: boolean;
}

export default function DocumentUpload({
  label,
  value,
  onChange,
  onPreview,
  folder = "partners/documents",
  error,
  accept = ".pdf,.doc,.docx,.txt,.xlsx,.xls,.xlsm,.ppt,.pptx,.rtf",
  required = false,
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        "Please select a valid document file (PDF, Word, Excel, PowerPoint, Text)"
      );
      return;
    }

    // Check file size (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Document size should be less than 50MB");
      return;
    }

    setUploading(true);
    try {
      const url = await uploadService.uploadDocument(file, folder);
      onChange(url);
      toast.success("Document uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  const handlePreview = () => {
    if (value && onPreview) {
      onPreview(value);
    }
  };

  const getFileTypeIcon = (url: string) => {
    if (url.includes(".pdf")) return "📄";
    if (url.includes(".doc")) return "📝";
    if (url.includes(".xls")) return "📊";
    if (url.includes(".ppt")) return "📽️";
    if (url.includes(".txt")) return "📃";
    return "📎";
  };

  const getFileNameFromUrl = (url: string) => {
    try {
      return url.split("/").pop() || "Document";
    } catch {
      return "Document";
    }
  };

  const getFileTypeText = (url: string) => {
    if (url.includes(".pdf")) return "PDF Document";
    if (url.includes(".doc")) return "Word Document";
    if (url.includes(".xls")) return "Excel Spreadsheet";
    if (url.includes(".ppt")) return "PowerPoint Presentation";
    if (url.includes(".txt")) return "Text File";
    return "Document";
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Input Field - Full width on mobile, flexible on desktop */}
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Document URL or upload file"
              className={`w-full px-3 py-2 border rounded-lg focus:border-[#91C73D] focus:ring-2 focus:ring-[#91C73D]/20 focus:outline-none pr-10 ${
                error ? "border-red-500" : "border-gray-300"
              }`}
              disabled={uploading}
            />
            {/* Clear button inside input */}
            {value && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                title="Clear Document"
                disabled={uploading}
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Upload Button */}
        <div className="flex-shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
          />

          <Button
            type="button"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full sm:w-auto min-w-[120px] h-full"
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 animate-spin"
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Uploading...
              </span>
            ) : (
              <span className="flex items-center gap-2">
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                Upload
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Document Preview */}
      {value && !uploading && (
        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-start gap-3">
            {/* Document Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-white rounded border flex items-center justify-center">
                <span className="text-2xl">{getFileTypeIcon(value)}</span>
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
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                >
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3-3H7"
                    />
                  </svg>
                  Preview
                </button>
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center gap-1"
                >
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
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  Open
                </a>
                <a
                  href={value}
                  download
                  className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center gap-1"
                >
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
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download
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

      {/* Help Text */}
      <p className="mt-1 text-xs text-gray-500">
        Supported formats: PDF, Word, Excel, PowerPoint, Text files (Max: 50MB)
      </p>
    </div>
  );
}
