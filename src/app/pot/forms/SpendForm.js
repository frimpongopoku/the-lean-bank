import { useState } from "react";
import InputField from "./InputField";
import SubmitButton from "./SubmitButton";

const SpendForm = ({
  onSubmit,
  title = "Spend",
  subtitle = "How much did you spend?",
  accentColor = "brand-rose",
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
    <form onSubmit={handleSubmit} className="p-6 w-full min-w-[320px]">
      <div className="mb-6">
        <h2 className="font-bold text-lg text-white">{title}</h2>
        <p className="text-white/50 text-sm mt-1">{subtitle}</p>
      </div>
      <InputField
        label="Amount"
        placeholder="0.00"
        type="number"
        name="amount"
        value={formData.amount}
        onChange={handleChange}
        required
      />
      <InputField
        textarea
        name="description"
        placeholder="What's this for?"
        label="Description"
        value={formData.description}
        onChange={handleChange}
      />
      <SubmitButton text="Confirm" />
    </form>
  );
};

export default SpendForm;
