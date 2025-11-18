// src/components/common/DocumentPreviewModal.tsx
import { useState, useEffect } from 'react';

interface DocumentPreviewModalProps {
  documentUrl: string;
  isOpen: boolean;
  onClose: () => void;
  documentName?: string;
}

export default function DocumentPreviewModal({ 
  documentUrl, 
  isOpen, 
  onClose,
  documentName = "Document" 
}: DocumentPreviewModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(null);
    }
  }, [isOpen, documentUrl]);

  if (!isOpen) return null;

  const getFileType = (url: string): string => {
    if (url.includes('.pdf')) return 'pdf';
    if (url.includes('.doc') || url.includes('.docx')) return 'word';
    if (url.includes('.xls') || url.includes('.xlsx')) return 'excel';
    if (url.includes('.ppt') || url.includes('.pptx')) return 'powerpoint';
    if (url.includes('.txt')) return 'text';
    if (url.includes('.rtf')) return 'rtf';
    return 'unknown';
  };

  const getFileTypeIcon = (url: string): string => {
    switch (getFileType(url)) {
      case 'pdf': return '📄';
      case 'word': return '📝';
      case 'excel': return '📊';
      case 'powerpoint': return '📽️';
      case 'text': return '📃';
      case 'rtf': return '📄';
      default: return '📎';
    }
  };

  const getFileTypeText = (url: string): string => {
    switch (getFileType(url)) {
      case 'pdf': return 'PDF Document';
      case 'word': return 'Word Document';
      case 'excel': return 'Excel Spreadsheet';
      case 'powerpoint': return 'PowerPoint Presentation';
      case 'text': return 'Text File';
      case 'rtf': return 'Rich Text Document';
      default: return 'Document';
    }
  };

  const renderDocumentPreview = () => {
    const fileType = getFileType(documentUrl);

    switch (fileType) {
      case 'pdf':
        return (
          <iframe
            src={documentUrl}
            className="w-full h-full min-h-[500px] border-0 cursor-pointer"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setError('Failed to load PDF document');
            }}
            title="PDF Document Preview"
          />
        );
      
      case 'word':
      case 'excel':
      case 'powerpoint':
        // For Office documents, use Microsoft Office Online Viewer
        const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(documentUrl)}`;
        return (
          <iframe
            src={officeViewerUrl}
            className="w-full h-full min-h-[500px] border-0 cursor-pointer"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setError('Failed to load document. Please download to view.');
            }}
            title="Document Preview"
          />
        );
      
      case 'text':
      case 'rtf':
        // For text files, fetch and display content
        return (
          <div className="w-full h-full min-h-[500px] bg-gray-50 border rounded-lg p-4 font-mono text-sm whitespace-pre-wrap overflow-auto cursor-pointer">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 cursor-pointer"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center">{error}</div>
            ) : (
              <div>Text content would be displayed here</div>
            )}
          </div>
        );
      
      default:
        return (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <div className="text-6xl mb-4">{getFileTypeIcon(documentUrl)}</div>
            <p className="text-lg font-medium">Preview not available</p>
            <p className="text-sm mt-2">This document type cannot be previewed in the browser.</p>
            <p className="text-sm">Please download the file to view it.</p>
          </div>
        );
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = documentName || documentUrl.split('/').pop() || 'document';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(documentUrl, '_blank');
  };

  // Get file type for conditional rendering
  const fileType = getFileType(documentUrl);

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl max-h-[90vh] w-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getFileTypeIcon(documentUrl)}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 cursor-pointer">
                {documentName || documentUrl.split('/').pop() || 'Document Preview'}
              </h3>
              <p className="text-sm text-gray-500">{getFileTypeText(documentUrl)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#171717] border border-[#171717] hover:bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center transition-colors cursor-pointer"
            title="Close preview"
          >
            ✕
          </button>
        </div>

        {/* Loading State */}
        {isLoading && fileType !== 'text' && fileType !== 'rtf' && (
          <div className="flex items-center justify-center p-8">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600">Loading document preview...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center p-8 text-red-600">
            <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-lg font-medium">{error}</p>
          </div>
        )}

        {/* Document Preview Content */}
        <div className="flex-1 overflow-auto p-4">
          {renderDocumentPreview()}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center p-4 border-t bg-gray-50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Some documents may not display correctly in preview</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleOpenInNewTab}
              className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2 cursor-pointer"
              title="Open in new tab"
            >
              <svg className="w-4 h-4 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open in New Tab
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 cursor-pointer"
              title="Download document"
            >
              <svg className="w-4 h-4 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}