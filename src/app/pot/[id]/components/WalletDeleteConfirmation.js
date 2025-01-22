import React, { useState } from "react";

const WalletDeleteConfirmation = ({ onConfirm, onCancel }) => {
  const [selectedOption, setSelectedOption] = useState("");

  return (
    <div className=" ">
      <div className="bg-white p-6 g  ">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Are you sure you want to remove this?
        </h2>

        <p className="text-gray-600 mb-4">
          Go ahead and select "Yes" to remove this partition.
          <br /> This action cannot be undone.
        </p>
        {/* <p className="text-gray-600 mb-4">
          What action do you want to take with the funds?
        </p>

        <div className="space-y-2 mb-6">
          <label className="flex items-center">
            <input
              type="radio"
              name="fundAction"
              value="deleteWithFunds"
              checked={selectedOption === "deleteWithFunds"}
              onChange={(e) => setSelectedOption(e.target.value)}
              className="form-radio text-blue-500 focus:ring focus:ring-blue-300"
            />
            <span className="ml-2 text-gray-700">Remove and clear funds</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="fundAction"
              value="addToMainWallet"
              checked={selectedOption === "addToMainWallet"}
              onChange={(e) => setSelectedOption(e.target.value)}
              className="form-radio text-blue-500 focus:ring focus:ring-blue-300"
            />
            <span className="ml-2 text-gray-700">
              Remove and add funds back to main wallet
            </span>
          </label>
        </div> */}

        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 cursor-pointer bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selectedOption)}
            // disabled={!selectedOption}
            className={`px-4 py-2 rounded text-white ${
              selectedOption
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-blue-300 cursor-not-allowed"
            } focus:outline-none`}
          >
            Yes, Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletDeleteConfirmation;
