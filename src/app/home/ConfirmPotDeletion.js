import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

function ConfirmPotDeletion({ pot, onConfirm, onCancel }) {
  return (
    <div className="p-6 text-center">
      <div className="w-14 h-14 rounded-full bg-brand-rose/10 flex items-center justify-center mx-auto mb-4">
        <FontAwesomeIcon icon={faTrash} className="text-brand-rose text-xl" />
      </div>
      <h2 className="text-lg font-bold text-white mb-2">Delete Pot?</h2>
      <p className="text-white/55 text-sm leading-relaxed mb-6">
        You are about to delete{" "}
        <span className="text-brand-rose font-semibold">{pot.name}</span> with a
        balance of{" "}
        <span className="text-white font-semibold">
          {pot.balance?.toLocaleString()}
        </span>
        . All partitions inside will be removed. This cannot be undone.
      </p>
      <div className="flex gap-3 justify-center">
        <button onClick={onCancel} className="btn-ghost text-sm px-5 py-2.5">
          Cancel
        </button>
        <button
          onClick={() => onConfirm(pot.id)}
          className="btn-danger text-sm px-5 py-2.5"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default ConfirmPotDeletion;
