import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";

const PayUpConfirmation = ({ onClose, onConfirm, borrow }) => {
  const [selectedOption, setSelectedOption] = useState("");
  const outstanding = Number(borrow?.amount) - Number(borrow?.paid_amount || 0);
  const [repayAmount, setRepayAmount] = useState(String(outstanding));

  const parsedAmount = Math.min(Math.max(Number(repayAmount) || 0, 0), outstanding);
  const isFullRepayment = parsedAmount >= outstanding;

  const options = [
    {
      value: "source_wallet",
      label: "Refund to source partition",
      description: "Amount returns to the partition it was borrowed from",
    },
    {
      value: "clear_funds",
      label: "Clear funds",
      description: "Mark repaid without returning the amount to a partition",
    },
  ];

  return (
    <div className="p-6 min-w-[320px]">
      <div className="w-12 h-12 rounded-full bg-brand-emerald/10 flex items-center justify-center mb-4">
        <FontAwesomeIcon icon={faCircleCheck} className="text-brand-emerald text-lg" />
      </div>
      <h2 className="text-lg font-bold text-white mb-1">Record Repayment</h2>
      <p className="text-white/50 text-sm mb-5">
        Outstanding:{" "}
        <span className="text-brand-amber font-semibold">{outstanding.toLocaleString()}</span>
      </p>

      {/* Amount field */}
      <div className="mb-5">
        <label className="text-white/50 text-xs uppercase tracking-wider font-semibold block mb-1.5">
          Repayment amount
        </label>
        <input
          type="number"
          min="1"
          max={outstanding}
          value={repayAmount}
          onChange={(e) => setRepayAmount(e.target.value)}
          className="w-full px-3 py-2.5 text-sm rounded-xl text-white/90"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            outline: "none",
          }}
        />
        {!isFullRepayment && parsedAmount > 0 && (
          <p className="text-white/35 text-xs mt-1.5">
            Partial — {(outstanding - parsedAmount).toLocaleString()} still outstanding after this
          </p>
        )}
      </div>

      <div className="space-y-3 mb-6">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
              selectedOption === opt.value
                ? "border-brand-emerald bg-brand-emerald/8"
                : "border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5"
            }`}
          >
            <input
              type="radio"
              value={opt.value}
              checked={selectedOption === opt.value}
              onChange={(e) => setSelectedOption(e.target.value)}
              className="mt-1 accent-brand-emerald"
            />
            <div>
              <p className="text-white/90 text-sm font-medium">{opt.label}</p>
              <p className="text-white/45 text-xs mt-0.5">{opt.description}</p>
            </div>
          </label>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={onClose} className="btn-ghost flex-1 justify-center text-sm py-2.5">
          Cancel
        </button>
        <button
          onClick={() => {
            if (!selectedOption) return alert("Please select an option.");
            if (!parsedAmount) return alert("Enter a valid amount.");
            onConfirm({ option: selectedOption, amount: parsedAmount, isFullRepayment });
          }}
          className="btn-primary flex-1 justify-center text-sm py-2.5"
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default PayUpConfirmation;
