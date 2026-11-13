"use client";
import { useState } from "react";
import InputField, { FormHeader, parseAmount } from "./InputField";
import SubmitButton from "./SubmitButton";
import { formatAmount } from "@/app/components/ui/money";

/* Create or edit an envelope (stored as a "partition"). */
const CreateOrEditPartition = ({ onSubmit, mode = "create", data, onClose, currency, unassigned = 0 }) => {
  const isEdit = mode === "edit";
  const [form, setForm] = useState({
    name: data?.name ?? "",
    balance: data?.balance !== undefined ? String(data.balance) : "",
    description: "",
  });
  const [errors, setErrors] = useState({});

  const set = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((x) => ({ ...x, [name]: undefined }));
  };

  const submit = (e) => {
    e.preventDefault();
    const amount = form.balance === "" ? 0 : parseAmount(form.balance);
    const next = {};
    if (!form.name.trim()) next.name = "Give the envelope a name.";
    if (!Number.isFinite(amount) || amount < 0) next.balance = "Enter an amount of 0 or more.";
    setErrors(next);
    if (Object.keys(next).length) return;
    onSubmit({
      name: form.name.trim(),
      abbreviation: data?.abbreviation || form.name.trim().slice(0, 3).toUpperCase(),
      balance: amount,
      ...(isEdit && form.description.trim() ? { description: form.description.trim() } : {}),
    });
  };

  const canFill = !isEdit && unassigned > 0;

  return (
    <form onSubmit={submit} noValidate>
      <FormHeader
        title={isEdit ? `Edit ${data?.name}` : "New envelope"}
        subtitle={isEdit ? "Rename it or set what it holds." : "An envelope holds money for one purpose: rent, food, savings."}
        onClose={onClose}
      />
      <div className="px-5 sm:px-6 py-5 flex flex-col gap-4">
        <InputField
          label="Name"
          name="name"
          value={form.name}
          onChange={set}
          placeholder="e.g. Rent"
          maxLength={28}
          required
          autoFocus
          error={errors.name}
          autoComplete="off"
        />
        <div>
          <InputField
            label={isEdit ? "Holds" : "Put in"}
            name="balance"
            inputMode="decimal"
            value={form.balance}
            onChange={set}
            placeholder="0.00"
            required={isEdit}
            prefix={currency}
            error={errors.balance}
            autoComplete="off"
            hint={
              canFill ? undefined : isEdit ? "Changing this moves money in or out of Unassigned." : undefined
            }
          />
          {canFill && (
            <p className="m-0 mt-1.5 text-[13px] text-muted">
              <span className="num">{formatAmount(unassigned)}</span> is unassigned.{" "}
              <button
                type="button"
                className="text-mint font-medium underline-offset-2 hover:underline"
                onClick={() => setForm((f) => ({ ...f, balance: String(unassigned) }))}
              >
                Use all of it
              </button>
            </p>
          )}
        </div>
        {isEdit && (
          <InputField
            label="Reason"
            name="description"
            value={form.description}
            onChange={set}
            placeholder="Why the change?"
            maxLength={80}
          />
        )}
        <SubmitButton text={isEdit ? "Save changes" : "Create envelope"} />
      </div>
    </form>
  );
};

export default CreateOrEditPartition;
