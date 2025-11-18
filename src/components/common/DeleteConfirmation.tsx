// src/components/common/DeleteConfirmation.tsx
import Button from "./Button";
import Modal from "./Modal";
import { useTranslation } from "react-i18next";

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
  title,
  itemName,
  confirmationMessage,
  isLoading = false,
  confirmButtonText,
  cancelButtonText,
}: DeleteConfirmationProps) {
  const { t } = useTranslation();

  // Use translations with fallbacks to existing defaults
  const resolvedTitle =
    title || t("deleteConfirmation.title") || "Confirm Deletion";
  const resolvedConfirmationMessage =
    confirmationMessage ||
    t("deleteConfirmation.defaultMessage") ||
    "Are you sure you want to delete this item?";
  const resolvedConfirmButtonText =
    confirmButtonText || t("deleteConfirmation.confirmButton") || "Delete";
  const resolvedCancelButtonText =
    cancelButtonText || t("deleteConfirmation.cancelButton") || "Cancel";
  const deletingText = t("deleteConfirmation.deleting") || "Deleting...";
  const cannotUndoneText =
    t("deleteConfirmation.cannotUndone") || "This action cannot be undone.";

  return (
    <Modal
      open={open}
      title={resolvedTitle}
      onClose={onClose}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="text-gray-600">
          <p className="mb-2">{resolvedConfirmationMessage}</p>
          {itemName && <p className="font-semibold">{itemName}</p>}
          <p className="text-sm text-red-600 mt-2">{cannotUndoneText}</p>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 cursor-pointer"
            disabled={isLoading}
          >
            {resolvedCancelButtonText}
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 cursor-pointer"
          >
            {isLoading ? deletingText : resolvedConfirmButtonText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
