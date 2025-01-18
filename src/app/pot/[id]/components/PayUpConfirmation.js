import React, { useState } from "react";

const PayUpConfirmation = ({ onClose, onConfirm }) => {
  const [selectedOption, setSelectedOption] = useState("");

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleConfirm = () => {
    if (selectedOption) {
      onConfirm(selectedOption);
    } else {
      alert("Please select an option.");
    }
  };

  return (
    <div className="">
      <div className="bg-white   p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          How do you want to handle funds after payment?
        </h2>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="source_wallet"
              checked={selectedOption === "source_wallet"}
              onChange={handleOptionChange}
              className="form-radio text-blue-600"
            />
            <span className="text-gray-700">Pay back to the source wallet</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="main_account"
              checked={selectedOption === "main_account"}
              onChange={handleOptionChange}
              className="form-radio text-blue-600"
            />
            <span className="text-gray-700">Pay back to main account</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="clear_funds"
              checked={selectedOption === "clear_funds"}
              onChange={handleOptionChange}
              className="form-radio text-blue-600"
            />
            <span className="text-gray-700">Clear funds</span>
          </label>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayUpConfirmation;
