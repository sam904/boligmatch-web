// src/components/common/VideoUpload.tsx
import { useRef, useState } from 'react';
import { uploadService } from '../../services/uploadS3.service';
import { toast } from 'sonner';
import { Upload } from 'lucide-react'; // simple upload icon

interface VideoUploadProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  error?: string;
  onPreview?: (url: string) => void;
}

export default function VideoUpload({
  label = 'Media & Description',
  value,
  onChange,
  folder = 'videos',
  error,
  onPreview,
}: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const supportedTypes = [
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo',
      'video/webm',
    ];
    if (!supportedTypes.includes(file.type)) {
      toast.error('Please select a video file (MP4, MPEG, MOV, AVI, WEBM)');
      return;
    }

    const maxSize = 200 * 1024 * 1024; // 200MB
    if (file.size > maxSize) {
      toast.error('Video size should be less than 200MB');
      return;
    }

    setUploading(true);
    try {
      const url = await uploadService.uploadVideo(file, folder);
      onChange(url);
      toast.success('Video uploaded successfully');
    } catch (error) {
      console.error('Video upload error:', error);
      toast.error('Failed to upload video');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  const handlePreview = () => {
    if (value && onPreview) onPreview(value);
  };

  return (
    <div className="w-full">
      {/* Section Title */}
      <label className="block text-base font-semibold text-gray-900 mb-2">
        {label}
      </label>

      {/* Sub Label */}
      <p className="text-sm text-gray-500 mb-2">
        Upload Video <span className="text-gray-400">(Max: 200MB)</span>
      </p>

      {/* Upload Box */}
      <div
        onClick={handleClick}
        className={`w-full border-2 border-dashed rounded-md cursor-pointer flex flex-col items-center justify-center py-10 transition
          ${uploading ? 'opacity-60 cursor-not-allowed' : 'hover:border-[#91C73D] hover:bg-gray-50'}
          ${error ? 'border-red-300' : 'border-gray-300'}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <svg
              className="w-6 h-6 animate-spin text-gray-400"
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
            <p className="text-sm">Uploading...</p>
          </div>
        ) : value ? (
          <div
            className="flex flex-col items-center gap-2 text-center"
            onClick={handlePreview}
          >
            <video
              src={value}
              className="w-40 h-24 object-cover rounded-md border border-gray-300"
              controls
            />
            <p className="text-sm text-gray-600 break-all max-w-[300px]">
              {value}
            </p>
            <p className="text-xs text-blue-600 underline">Click to preview</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-600">
            <Upload className="w-6 h-6 text-[#91C73D] mb-1" />
            <p className="text-sm text-[#91C73D] font-medium">
              Click to upload
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
          {error}
        </p>
      )}
    </div>
  );
}
