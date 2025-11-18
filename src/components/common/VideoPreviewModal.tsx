// src/components/common/VideoPreviewModal.tsx
function VideoPreviewModal({ videoUrl, isOpen, onClose }: { videoUrl: string; isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Video Preview</h3>
         <button
            onClick={onClose}
            className="text-[#171717] border border-[#171717] hover:bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-4 flex justify-center items-center max-h-[70vh] overflow-auto">
          <video 
            controls 
            className="max-w-full max-h-full"
            style={{ maxHeight: '60vh' }}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="p-4 border-t text-left">
          <a 
            href={videoUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
          >
            Open video in new tab
          </a>
        </div>
      </div>
    </div>
  );
}
export default VideoPreviewModal;