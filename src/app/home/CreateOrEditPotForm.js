"use client";
import React, { useState } from "react";
import InputField, { FormHeader, parseAmount } from "../pot/forms/InputField";
import SubmitButton from "../pot/forms/SubmitButton";

const CURRENCY_KEY = "tlb_default_currency";

function CreateOrEditPotForm({ onSubmit, isEdit, data, onClose, focus }) {
  const [form, setForm] = useState(() => {
    let currency = "";
    try {
      currency = localStorage.getItem(CURRENCY_KEY) || "";
    } catch {}
    return {
      name: data?.name ?? "",
      currency: data?.currency ?? currency,
      balance: data?.balance !== undefined && data?.balance !== null ? String(data.balance) : "",
      description: data?.description ?? "",
    };
  });
  const [errors, setErrors] = useState({});

  const set = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === "currency" ? value.toUpperCase() : value }));
    if (errors[name]) setErrors((x) => ({ ...x, [name]: undefined }));
  };

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    const balance = parseAmount(form.balance);
    if (!form.name.trim()) next.name = "Give the pot a name.";
    if (!Number.isFinite(balance)) next.balance = "Enter the amount, e.g. 2,500.00";
    setErrors(next);
    if (Object.keys(next).length) return;
    onSubmit({
      ...(data || {}),
      name: form.name.trim(),
      currency: form.currency.trim(),
      balance,
      description: form.description.trim(),
    });
  };

  return (
    <form onSubmit={submit} noValidate>
      <FormHeader
        title={isEdit ? "Edit pot" : "New pot"}
        subtitle={isEdit ? "Rename it or correct the balance." : "A bank account, wallet or cash stash you want to split into envelopes."}
        onClose={onClose}
      />
      <div className="px-5 sm:px-6 py-5 flex flex-col gap-4">
        <InputField
          label="Name"
          name="name"
          value={form.name}
          onChange={set}
          placeholder="e.g. GCB Savings"
          maxLength={40}
          required
          autoFocus={focus !== "balance"}
          error={errors.name}
          autoComplete="off"
          enterKeyHint="next"
        />
        <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3">
          <InputField
            label="Currency"
            name="currency"
            value={form.currency}
            onChange={set}
            placeholder="GHS"
            maxLength={3}
            required
            autoCapitalize="characters"
            autoComplete="off"
          />
          <InputField
            label={isEdit ? "Balance in the account" : "Balance right now"}
            name="balance"
            inputMode="decimal"
            value={form.balance}
            onChange={set}
            placeholder="0.00"
            required
            autoFocus={focus === "balance"}
            error={errors.balance}
            autoComplete="off"
          />
        </div>
        {isEdit && (
          <p className="m-0 -mt-1 text-[13px] text-muted">A change to the balance is logged in Activity as an adjustment.</p>
        )}
        <InputField
          textarea
          label="Note"
          name="description"
          value={form.description}
          onChange={set}
          placeholder="What is this account for?"
          maxLength={100}
        />
        <SubmitButton text={isEdit ? "Save changes" : "Create pot"} />
      </div>
    </form>
  );
}

export default CreateOrEditPotForm;
