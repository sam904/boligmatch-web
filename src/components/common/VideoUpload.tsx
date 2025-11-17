// src/components/common/VideoUpload.tsx
import { useRef, useState } from "react";
import { uploadService } from "../../services/uploadS3.service";
import AdminToast from "./AdminToast";
import type { AdminToastType } from "./AdminToast";
import { Upload, Loader2, Play } from "lucide-react";
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

interface VideoUploadProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  error?: string;
  onPreview?: (url: string) => void;
}

export default function VideoUpload({
  label = "Media & Description",
  value,
  onChange,
  folder = "videos",
  error,
  onPreview,
}: VideoUploadProps) {
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

    const supportedTypes = [
      "video/mp4",
      "video/mpeg",
      "video/quicktime",
      "video/x-msvideo",
      "video/webm",
    ];
    if (!supportedTypes.includes(file.type)) {
      toast.error(
        t("videoUpload.invalidVideoFile") ||
          "Please select a video file (MP4, MPEG, MOV, AVI, WEBM)"
      );
      return;
    }

    const maxSize = 200 * 1024 * 1024; // 200MB
    if (file.size > maxSize) {
      toast.error(
        t("videoUpload.videoSizeExceeded", { size: 200 }) ||
          "Video size should be less than 200MB"
      );
      return;
    }

    setUploading(true);
    try {
      const url = await uploadService.uploadVideo(file, folder);
      onChange(url);
      toast.success(
        t("videoUpload.uploadSuccess") || "Video uploaded successfully"
      );
    } catch (error) {
      console.error("Video upload error:", error);
      toast.error(t("videoUpload.uploadFailed") || "Failed to upload video");
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

  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value && onPreview) {
      onPreview(value);
    }
  };

  const getFileNameFromUrl = (url: string) => {
    try {
      return decodeURIComponent(url.split("/").pop() || "Video");
    } catch {
      return "Video";
    }
  };

  const getVideoTypeText = (url: string) => {
    if (url.includes(".mp4")) return "MP4 Video";
    if (url.includes(".mpeg")) return "MPEG Video";
    if (url.includes(".mov")) return "MOV Video";
    if (url.includes(".avi")) return "AVI Video";
    if (url.includes(".webm")) return "WebM Video";
    return "Video File";
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
      <label className="block text-base font-semibold text-gray-900 mb-2">
        {label}
      </label>

      {/* Sub Label */}
      <p className="text-sm text-gray-500 mb-2">
        {t("videoUpload.uploadVideo") || "Upload Video"}{" "}
        <span className="text-gray-400">
          ({t("videoUpload.maxSize", { size: 200 }) || "Max: 200MB"})
        </span>
      </p>

      {/* Upload Area */}
      <div
        onClick={handleClick}
        className={`
          relative w-full border-2 border-dashed rounded-lg cursor-pointer
          transition-all py-2  duration-200 ease-in-out
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
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-gray-500 py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            <p className="text-sm">
              {t("videoUpload.uploading") || "Uploading..."}
            </p>
          </div>
        ) : value ? (
          <div className="flex flex-col items-center gap-3 text-center py-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center overflow-hidden relative">
              <video src={value} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                <Play className="w-8 h-8 text-white fill-current" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 truncate max-w-[300px]">
                {getFileNameFromUrl(value)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {getVideoTypeText(value)}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-600 py-1">
            <Upload className="w-6 h-6 text-[#91C73D] mb-2" />
            <p className="text-sm text-[#91C73D] font-medium">
              {t("videoUpload.clickToUpload") || "Click to upload video"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {t("videoUpload.supportedFormats") || "MP4, MPEG, MOV, AVI, WebM"}
            </p>
          </div>
        )}
      </div>

      {/* Video Preview Section */}
      {value && !uploading && (
        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-start gap-3">
            {/* Video Thumbnail - Clickable */}
            <div
              className="flex-shrink-0 cursor-pointer relative"
              onClick={handleVideoClick}
            >
              <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center overflow-hidden">
                <video src={value} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                  <Play className="w-4 h-4 text-white fill-current" />
                </div>
              </div>
            </div>

            {/* Video Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-800 truncate">
                {getFileNameFromUrl(value)}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {getVideoTypeText(value)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
          {error}
        </p>
      )}
    </div>
  );
}