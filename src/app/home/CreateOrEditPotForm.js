import React, { useEffect, useState } from "react";
import InputField from "../pot/forms/InputField";
import SubmitButton from "../pot/forms/SubmitButton";

const CURRENCY_KEY = "tlb_default_currency";

function CreateOrEditPotForm({ onSubmit, isEdit, data }) {
  const defaultCurrency = typeof window !== "undefined"
    ? localStorage.getItem(CURRENCY_KEY) || ""
    : "";

  const [formData, setFormData] = useState({
    name: "",
    currency: isEdit ? "" : defaultCurrency,
    balance: "",
    description: "",
  });

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
          {isEdit ? "Edit Pot" : "New Pot"}
        </h2>
        <p className="text-white/50 text-sm mt-1">
          {isEdit
            ? "Update your pot details"
            : "How much do you have in this account right now?"}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-1">
        <InputField
          label="Name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. GCB Savings"
          maxLength={40}
          required
        />
        <InputField
          label="Currency"
          name="currency"
          type="text"
          value={formData.currency}
          onChange={handleChange}
          placeholder="e.g. GHS"
          maxLength={3}
        />
        <InputField
          label="Balance"
          name="balance"
          type="number"
          value={formData.balance}
          onChange={handleChange}
          placeholder="0.00"
          required
        />
        {isEdit && (
          <p className="text-white/30 text-xs px-1">
            Balance changes are recorded as adjustment transactions.
          </p>
        )}
        <InputField
          textarea
          label="Description (optional)"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="What is this account for?"
          maxLength={100}
        />
        <div className="pt-2">
          <SubmitButton text={isEdit ? "Save Changes" : "Create Pot"} />
        </div>
      </form>
    </div>
  );
}

export default CreateOrEditPotForm;
