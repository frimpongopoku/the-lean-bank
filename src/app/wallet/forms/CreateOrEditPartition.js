// forms/CreateOrEditPartition.js
import { useState } from "react";
import InputField from "../components/InputField";
import SubmitButton from "../components/SubmitButton";

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
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto p-4 border rounded shadow"
    >
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
  );
};

export default CreateOrEditPartition;
