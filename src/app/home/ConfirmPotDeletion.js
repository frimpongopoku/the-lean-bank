import React from "react";

function ConfirmPotDeletion({ pot, onConfirm, onCancel }) {
  return (
    <div className="bg-white rounded-lg p-6 w-full max-w-md">
      <h2 className="text-xl font-bold text-center mb-4">Confirm Deletion</h2>
      <p className="text-gray-600 text-center mb-6">
        Are you sure you want to delete the pot{" "}
        <span className="font-semibold text-red-600">{pot.name}</span> with a
        balance of{" "}
        <span className="font-semibold">{pot.balance?.toLocaleString()}</span>?
        This action cannot be undone.
      </p>
      <div className="flex justify-center space-x-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          onClick={() => onConfirm(pot.id)}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default ConfirmPotDeletion;
