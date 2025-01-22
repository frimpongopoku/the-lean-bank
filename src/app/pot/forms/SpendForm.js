// forms/SpendForm.js
import { useState } from "react";

import InputField from "./InputField";
import SubmitButton from "./SubmitButton";

const SpendForm = ({
  onSubmit,
  title = "Spend",
  subtitle = "How much did you spend?",
}) => {
  const [formData, setFormData] = useState({ amount: "", description: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 w-[500]">
      <div className="mb-4">
        {title && <h2 className="font-bold text-lg">{title}</h2>}
        {subtitle && <p className="text-gray-500">{subtitle}</p>}
      </div>
      <InputField
        label="Amount"
        placeholder={`Enter amount...`}
        type="number"
        name="amount"
        value={formData.amount}
        onChange={handleChange}
        required
      />
      <InputField
        textarea
        name="description"
        placeholder={`Enter description...`}
        label="Description"
        value={formData.description}
        onChange={handleChange}
      />
      <SubmitButton text="Submit" />
    </form>
  );
};

export default SpendForm;
