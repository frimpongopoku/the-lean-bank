import React, { useState } from "react";
import InputField from "../wallet/forms/InputField";
import SubmitButton from "../wallet/forms/SubmitButton";

function CreateOrEditPotForm() {
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted", formData);
    // Add logic to handle the form submission (e.g., API call)
  };

  return (
    <div className="px-4">
      <div>
        <h2 className="font-bold text-lg">Create New Pot</h2>
        <p className="text-gray-500">
          How much do you have in your bank right now? Fill in the form below
        </p>
      </div>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <InputField
          label="Name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter name"
        />
        <InputField
          label="Amount"
          name="amount"
          type="number"
          value={formData.amount}
          onChange={handleChange}
          placeholder="Enter amount"
        />
        <InputField
          textarea
          label="Description"
          name="description"
          type="text"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter description"
        />
        <SubmitButton text="Create" />
      </form>
    </div>
  );
}

export default CreateOrEditPotForm;
