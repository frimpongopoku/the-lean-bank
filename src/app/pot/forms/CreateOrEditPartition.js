import { useEffect, useState } from "react";
import InputField from "./InputField";
import SubmitButton from "./SubmitButton";

const CreateOrEditPartition = ({ onSubmit, mode = "create", data }) => {
  const [formData, setFormData] = useState({
    name: "",
    abbreviation: "",
    balance: "",
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
    <div className="p-6 min-w-[320px]">
      <div className="mb-6">
        <h2 className="font-bold text-lg text-white">
          {isEdit ? "Edit Partition" : "New Partition"}
        </h2>
        <p className="text-white/50 text-sm mt-1">
          {isEdit
            ? "Update the details for this partition"
            : "Create a new wallet inside this pot"}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-1">
        <InputField
          label="Name"
          placeholder="e.g. Emergency Fund"
          name="name"
          value={formData.name}
          onChange={handleChange}
          maxLength={20}
          required
        />
        <InputField
          label="Abbreviation (optional)"
          placeholder="e.g. EMG"
          name="abbreviation"
          value={formData.abbreviation}
          onChange={handleChange}
          maxLength={5}
        />
        <InputField
          label="Amount"
          placeholder="0.00"
          name="balance"
          type="number"
          value={formData.balance}
          onChange={handleChange}
          required
        />
        {isEdit && (
          <InputField
            label="Reason for edit"
            name="description"
            placeholder="Why are you changing this?"
            value={formData.description}
            onChange={handleChange}
            textarea
          />
        )}
        <div className="pt-2">
          <SubmitButton text={isEdit ? "Save Changes" : "Create Partition"} />
        </div>
      </form>
    </div>
  );
};

export default CreateOrEditPartition;
