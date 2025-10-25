// src/components/common/DocumentUpload.tsx
import { useState } from 'react';
import { toast } from 'sonner';
import Button from './Button';
import { uploadService } from '../../services/uploadS3.service';

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
  folder = 'partners/documents',
  error,
  accept = '.pdf,.doc,.docx,.txt,.xlsx,.xls,.xlsm,.ppt,.pptx,.rtf',
  required = false
}: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate progress (in real implementation, you might want to use axios with progress events)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload the file
      const uploadedUrl = await uploadService.uploadDocument(file, folder);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Small delay to show 100% progress
      setTimeout(() => {
        onChange(uploadedUrl);
        toast.success('Document uploaded successfully!');
      }, 300);
      
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload document');
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset the input
    event.target.value = '';
  };

  const handleManualUrl = () => {
    const url = prompt('Enter document URL:');
    if (url) {
      // Basic URL validation
      if (url.startsWith('http://') || url.startsWith('https://')) {
        onChange(url);
        toast.success('Document URL added successfully!');
      } else {
        toast.error('Please enter a valid URL starting with http:// or https://');
      }
    }
  };

  const getFileTypeIcon = (url: string) => {
    if (url.includes('.pdf')) return '📄';
    if (url.includes('.doc')) return '📝';
    if (url.includes('.xls')) return '📊';
    if (url.includes('.ppt')) return '📽️';
    if (url.includes('.txt')) return '📃';
    return '📎';
  };

  const getFileNameFromUrl = (url: string) => {
    try {
      return url.split('/').pop() || 'Document';
    } catch {
      return 'Document';
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {error && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {/* URL Input and Upload Buttons */}
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Document URL or upload file"
            className={`w-full px-3 py-2 border rounded-md focus:border-[#91C73D] focus:ring-2 focus:ring-[#91C73D]/20 focus:outline-none ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isUploading}
          />
        </div>
        
        {/* File Upload Button */}
        <div className="relative">
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          <Button
            type="button"
            variant="secondary"
            disabled={isUploading}
            className="whitespace-nowrap min-w-[120px]"
          >
            {isUploading ? 'Uploading...' : 'Upload File'}
          </Button>
        </div>

        {/* Manual URL Button */}
        <Button
          type="button"
          variant="secondary"
          onClick={handleManualUrl}
          disabled={isUploading}
          className="whitespace-nowrap"
        >
          Add URL
        </Button>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      {/* Document Preview */}
      {value && !isUploading && (
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-xl">{getFileTypeIcon(value)}</span>
            <div>
              <p className="text-sm font-medium text-green-800">
                {getFileNameFromUrl(value)}
              </p>
              <p className="text-xs text-green-600">
                Document ready
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onPreview?.(value)}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Preview
            </button>
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Open
            </a>
            <a
              href={value}
              download
              className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Download
            </a>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500">
        Supported formats: PDF, Word, Excel, PowerPoint, Text files (Max: 50MB)
      </p>
    </div>
  );
}