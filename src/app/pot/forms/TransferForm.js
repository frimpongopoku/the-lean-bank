import { useState } from "react";
import InputField from "./InputField";
import SubmitButton from "./SubmitButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

const TransferForm = ({ fromPartition, allPartitions, onSubmit }) => {
  const [formData, setFormData] = useState({
    toPartId: "",
    amount: "",
    description: "",
  });

  const others = (allPartitions || []).filter((p) => p.id !== fromPartition?.id);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.toPartId) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 min-w-[320px]">
      <div className="mb-6">
        <h2 className="font-bold text-lg text-white">Transfer</h2>
        <p className="text-white/50 text-sm mt-1">
          Move money from{" "}
          <span className="text-brand-emerald font-semibold">
            {fromPartition?.name}
          </span>{" "}
          to another partition
        </p>
      </div>

      {/* From → To visual */}
      <div className="flex items-center gap-3 mb-5 px-3 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <span className="text-brand-emerald text-sm font-semibold truncate flex-1">
          {fromPartition?.name}
        </span>
        <FontAwesomeIcon icon={faArrowRight} className="text-white/30 text-xs flex-shrink-0" />
        <span className="text-white/50 text-sm flex-1 text-right truncate">
          {formData.toPartId
            ? others.find((p) => p.id === formData.toPartId)?.name || "…"
            : "Select…"}
        </span>
      </div>

      {/* Destination */}
      <div className="mb-4">
        <label className="block text-white/60 text-xs font-semibold mb-2 uppercase tracking-wider">
          Destination <span className="text-brand-rose ml-1">*</span>
        </label>
        {others.length === 0 ? (
          <p className="text-white/35 text-sm">
            No other partitions to transfer to.
          </p>
        ) : (
          <select
            name="toPartId"
            value={formData.toPartId}
            onChange={handleChange}
            required
            className="input-glass"
            style={{ appearance: "none" }}
          >
            <option value="">Choose partition…</option>
            {others.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <InputField
        label="Amount"
        name="amount"
        type="number"
        placeholder="0.00"
        value={formData.amount}
        onChange={handleChange}
        required
      />
      <InputField
        label="Description (optional)"
        name="description"
        placeholder="What's this transfer for?"
        value={formData.description}
        onChange={handleChange}
        textarea
      />

      <div className="pt-2">
        <SubmitButton text="Transfer" />
      </div>
    </form>
  );
};

export default TransferForm;
