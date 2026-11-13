"use client";
import { FormHeader } from "@/app/pot/forms/InputField";

export default function ConfirmDialog({ title, children, confirmLabel = "Delete", tone = "danger", onConfirm, onCancel }) {
  return (
    <div>
      <FormHeader title={title} onClose={onCancel} />
      <div className="px-5 sm:px-6 pt-2 pb-5 flex flex-col gap-5">
        <div className="text-sm text-ink-2 leading-relaxed">{children}</div>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            data-autofocus={tone === "danger" ? "" : undefined}
            onClick={() => onCancel()}
            className="btn-ghost flex-1 sm:flex-none"
          >
            Cancel
          </button>
          <button
            type="button"
            data-autofocus={tone === "danger" ? undefined : ""}
            onClick={() => onConfirm()}
            className={`${tone === "danger" ? "btn-danger" : "btn-primary"} flex-1 sm:flex-none`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
