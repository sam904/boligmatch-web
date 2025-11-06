// src/components/common/DeleteConfirmation.tsx
import Button from "./Button";
import Modal from "./Modal";

interface DeleteConfirmationProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  itemName?: string;
  confirmationMessage?: string;
  isLoading?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

export default function DeleteConfirmation({
  open,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  itemName,
  confirmationMessage = "Are you sure you want to delete this item?",
  isLoading = false,
  confirmButtonText = "Delete",
  cancelButtonText = "Cancel"
}: DeleteConfirmationProps) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="text-gray-600">
          <p className="mb-2">{confirmationMessage}</p>
          {itemName && (
            <p className="font-semibold">{itemName}</p>
          )}
          <p className="text-sm text-red-600 mt-2">
            This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isLoading}
          >
            {cancelButtonText}
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? "Deleting..." : confirmButtonText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}