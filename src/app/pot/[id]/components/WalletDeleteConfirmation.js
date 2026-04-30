import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

const WalletDeleteConfirmation = ({ onConfirm, onCancel }) => {
  return (
    <div className="p-6 text-center">
      <div className="w-14 h-14 rounded-full bg-brand-rose/10 flex items-center justify-center mx-auto mb-4">
        <FontAwesomeIcon icon={faTrash} className="text-brand-rose text-xl" />
      </div>
      <h2 className="text-lg font-bold text-white mb-2">Remove Partition?</h2>
      <p className="text-white/55 text-sm leading-relaxed mb-6">
        This partition and all its data will be permanently removed.
        <br />
        This action cannot be undone.
      </p>
      <div className="flex gap-3 justify-center">
        <button onClick={onCancel} className="btn-ghost text-sm px-5 py-2.5">
          Cancel
        </button>
        <button
          onClick={() => onConfirm()}
          className="btn-danger text-sm px-5 py-2.5"
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default WalletDeleteConfirmation;
