import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";

function ChecksumSummary({
  isValid = true,
  freeMoneyIsInvalid,
  freeMoney,
  balance,
  sumOfAllPartitionBalance,
  onlySumValidity,
}) {
  return (
    <div className="p-6 min-w-[300px]">
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isValid ? "bg-brand-emerald/12" : "bg-brand-rose/12"
          }`}
        >
          <FontAwesomeIcon
            icon={isValid ? faCircleCheck : faCircleXmark}
            className={`text-lg ${
              isValid ? "text-brand-emerald" : "text-brand-rose"
            }`}
          />
        </div>
        <div>
          <h3 className="font-bold text-white">Sensibility Check</h3>
          <p className={`text-xs font-semibold ${isValid ? "text-brand-emerald" : "text-brand-rose"}`}>
            {isValid ? "Everything checks out" : "Something isn't right"}
          </p>
        </div>
      </div>

      <p className="text-white/55 text-sm mb-5 leading-relaxed">
        Verifies that your free money and all partitions resolve to your actual
        account balance — ensuring no money is pulled from thin air.
      </p>

      <div
        className="rounded-xl p-3 mb-4 text-xs font-mono"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <span className="text-white/40">Balance</span>
        <span className="text-white/70"> = Partitions + Free Money</span>
      </div>

      <div className="space-y-2">
        <Row
          label="Account Balance"
          value={Number(balance)?.toLocaleString()}
          valid
        />
        <Row
          label="Sum of Partitions"
          value={Number(sumOfAllPartitionBalance)?.toLocaleString()}
          valid={onlySumValidity}
        />
        <Row
          label="Free Money"
          value={Number(freeMoney)?.toLocaleString()}
          valid={!freeMoneyIsInvalid}
        />
        <div
          className="border-t mt-2 pt-2"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
        >
          <Row
            label="Checksum"
            value={isValid ? "Valid ✓" : "Invalid ✗"}
            valid={isValid}
            bold
          />
        </div>
      </div>
    </div>
  );
}

const Row = ({ label, value, valid, bold }) => (
  <div className="flex justify-between items-center text-sm">
    <span className="text-white/50">{label}</span>
    <span
      className={`font-semibold ${bold ? "text-base" : ""} ${
        valid ? "text-brand-emerald" : "text-brand-rose"
      }`}
    >
      {value}
    </span>
  </div>
);

export default ChecksumSummary;
