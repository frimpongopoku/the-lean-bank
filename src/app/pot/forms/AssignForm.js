"use client";
import { useState } from "react";
import InputField, { FormHeader, parseAmount } from "./InputField";
import SubmitButton from "./SubmitButton";
import { formatAmount, useAmountsHidden, MASK } from "@/app/components/ui/money";

/* Put unassigned money into an envelope. The account balance doesn't change. */
export default function AssignForm({ parts, unassigned, currency, onSubmit, onClose }) {
  const hidden = useAmountsHidden();
  const [partId, setPartId] = useState(parts[0]?.id || "");
  const [amount, setAmount] = useState(String(unassigned));
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const v = parseAmount(amount);
    if (!Number.isFinite(v) || v <= 0) return setError("Enter an amount above zero.");
    if (v > unassigned + 0.001) return setError(`Only ${currency} ${formatAmount(unassigned)} is unassigned.`);
    onSubmit({ partId, amount: v });
  };

  return (
    <form onSubmit={submit} noValidate>
      <FormHeader
        title="Assign to an envelope"
        subtitle={`${currency} ${hidden ? MASK : formatAmount(unassigned)} is in the account but not in any envelope.`}
        onClose={onClose}
      />
      <div className="px-5 sm:px-6 py-5 flex flex-col gap-4">
        <div>
          <label className="field-label" htmlFor="assign-env">Envelope</label>
          <select id="assign-env" className="field" value={partId} onChange={(e) => setPartId(e.target.value)}>
            {parts.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <InputField
          label="Amount"
          name="amount"
          inputMode="decimal"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setError("");
          }}
          prefix={currency}
          required
          error={error}
          autoComplete="off"
          autoFocus
        />
        <SubmitButton text="Assign" />
      </div>
    </form>
  );
}
