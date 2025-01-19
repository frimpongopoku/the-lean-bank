// forms/CreateOrEditPartition.js
import { useEffect, useState } from "react";
import InputField from "./InputField";
import SubmitButton from "./SubmitButton";

const CreateOrEditPartition = ({ onSubmit, mode = "create", data }) => {
  const [formData, setFormData] = useState({
    name: "",
    abbreviation: "",
    amount: "",
    description: "",
  });

  const isEdit = mode === "edit";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  useEffect(() => {
    if (data) setFormData(data);
  }, [data?.toString()]);

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
          name="name"
          value={formData.name}
          onChange={handleChange}
          maxLength={20}
          required
        />
        <InputField
          label="Abbreviation"
          name="abbreviation"
          value={formData.abbreviation}
          onChange={handleChange}
          maxLength={5}
          required
        />
        <InputField
          label="Amount"
          name="balance"
          type="number"
          value={formData.balance}
          onChange={handleChange}
          required
        />
        {isEdit && (
          <InputField
            label="Description (reason for edit)"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        )}
        <SubmitButton text={!isEdit ? "Create" : "Edit"} />
      </form>
    </div>
  );
};

export default CreateOrEditPartition;
