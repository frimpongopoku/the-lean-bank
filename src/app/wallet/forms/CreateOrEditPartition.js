// forms/CreateOrEditPartition.js
import { useState } from "react";
import InputField from "./InputField";
import SubmitButton from "./SubmitButton";

const CreateOrEditPartition = ({ mode = "create", onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    abbreviation: "",
    amount: "",
    description: "",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div>
      <div className="px-4">
        <h2 className="font-bold text-lg">Create New</h2>
        <p className="text-gray-500">
          Fill in the form below to create a new partition
        </p>
      </div>
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 w-[500]">
        <InputField
          label="Name"
          value={formData.name}
          onChange={handleChange}
          maxLength={20}
          required
        />
        <InputField
          label="Abbreviation"
          value={formData.abbreviation}
          onChange={handleChange}
          maxLength={5}
          required
        />
        <InputField
          label="Amount"
          type="number"
          value={formData.amount}
          onChange={handleChange}
          required
        />
        {mode === "edit" && (
          <InputField
            label="Description (reason for edit)"
            value={formData.description}
            onChange={handleChange}
          />
        )}
        <SubmitButton text={mode === "create" ? "Create" : "Edit"} />
      </form>
    </div>
  );
};

export default CreateOrEditPartition;
