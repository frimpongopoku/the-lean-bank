import React, { useEffect, useState } from "react";
import InputField from "../pot/forms/InputField";
import SubmitButton from "../pot/forms/SubmitButton";

function CreateOrEditPotForm({ onSubmit, isEdit, data }) {
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
    if (isEdit) return onSubmit(formData);
    onSubmit(formData);
  };

  useEffect(() => {
    if (data) setFormData(data);
  }, [data?.toString()]);

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
          value={formData?.name}
          onChange={handleChange}
          placeholder="Enter name"
          maxLength={40}
        />
        <InputField
          label="Currency"
          name="currency"
          type="text"
          value={formData?.currency}
          onChange={handleChange}
          placeholder="Enter currency"
          maxLength={3}
        />
        <InputField
          label="Amount"
          name="balance"
          type="number"
          value={formData?.balance}
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
          maxLength={100}
        />
        <SubmitButton text={isEdit ? "Save" : "Create"} />
      </form>
    </div>
  );
}

export default CreateOrEditPotForm;
