import { useEffect, useRef } from 'react';

interface DeleteConfirmDialogProps {
  open: boolean;
  itemTitle: string;
  itemType?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

export default function DeleteConfirmDialog({
  open,
  itemTitle,
  itemType = 'post',
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onCancel}
      className="
        m-auto w-full max-w-md rounded-lg bg-white p-6 shadow-xl
        backdrop:bg-black/50
        dark:bg-gray-900
      "
    >
      <h2
        className="
          mb-2 text-lg font-semibold text-gray-900
          dark:text-white
        "
      >
        Delete {itemType}
      </h2>
      <p
        className="
          mb-6 text-sm text-gray-600
          dark:text-gray-400
        "
      >
        Are you sure you want to delete &ldquo;{itemTitle}&rdquo;? This action cannot be undone.
      </p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          disabled={isDeleting}
          className="
            cursor-pointer rounded-md px-4 py-2 text-sm font-medium
            text-gray-700
            hover:bg-gray-100
            dark:text-gray-300
            dark:hover:bg-gray-800
          "
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          className="
            cursor-pointer rounded-md bg-red-600 px-4 py-2 text-sm font-medium
            text-white
            hover:bg-red-700
            disabled:opacity-50
            dark:bg-red-500
            dark:hover:bg-red-600
          "
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </dialog>
  );
}
