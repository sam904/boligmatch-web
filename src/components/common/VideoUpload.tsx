// src/components/common/VideoUpload.tsx
import { useRef, useState } from 'react';
import { uploadService } from '../../services/uploadS3.service';
import Button from './Button';
import { toast } from 'sonner';

interface VideoUploadProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  error?: string;
  onPreview?: (url: string) => void;
}

export default function VideoUpload({ 
  label, 
  value, 
  onChange, 
  folder = 'videos', 
  error, 
  onPreview 
}: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const supportedTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
    if (!supportedTypes.includes(file.type)) {
      toast.error('Please select a video file (MP4, MPEG, MOV, AVI, WEBM)');
      return;
    }

    // Increased size limit for videos (200MB)
    const maxSize = 200 * 1024 * 1024; // 200MB in bytes
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

  const handleRemove = () => {
    onChange('');
  };

  const handlePreview = () => {
    if (value && onPreview) {
      onPreview(value);
    }
  };

  // Helper function to format file size
//   const formatFileSize = (bytes: number) => {
//     if (bytes === 0) return '0 Bytes';
//     const k = 1024;
//     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//   };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} <span className="text-xs text-gray-500">(Max: 200MB)</span>
      </label>
      
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Input Field */}
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Paste video URL or upload"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#91C73D] focus:ring-2 focus:ring-[#91C73D]/20 focus:outline-none pr-10"
            />
            {/* Clear button inside input */}
            {value && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                title="Clear Video"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
            accept="video/*"
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
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Upload Video
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* File size info */}
      <div className="mt-1 text-xs text-gray-500">
        Supported formats: MP4, MPEG, MOV, AVI, WEBM | Maximum size: 200MB
      </div>

      {/* Preview */}
      {value && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start gap-3">
            {/* Video Preview */}
            <div 
              className="flex-shrink-0 cursor-pointer"
              onClick={handlePreview}
              title="Click to preview video"
            >
              <div className="w-24 h-16 bg-black rounded border overflow-hidden flex items-center justify-center relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
                <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                  VIDEO
                </div>
              </div>
            </div>
            
            {/* URL and Actions */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600 break-all">{value}</p>
              {/* <div className="flex gap-2 mt-2">
                {onPreview && (
                  <button
                    type="button"
                    onClick={handlePreview}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Preview Video
                  </button>
                )}
              </div> */}
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
