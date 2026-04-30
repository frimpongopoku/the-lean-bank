import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUnlock, faLock } from "@fortawesome/free-solid-svg-icons";

function FreeMoneySummary({ freeMoney, isValid = true }) {
  return (
    <div className="p-6 min-w-[300px]">
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isValid ? "bg-brand-cyan/12" : "bg-brand-rose/12"
          }`}
        >
          <FontAwesomeIcon
            icon={isValid ? faUnlock : faLock}
            className={`text-lg ${
              isValid ? "text-brand-cyan" : "text-brand-rose"
            }`}
          />
        </div>
        <div>
          <h3 className="font-bold text-white">Free Money</h3>
          <p
            className={`text-xs font-semibold ${
              isValid ? "text-brand-cyan" : "text-brand-rose"
            }`}
          >
            {isValid ? "Unassigned balance" : "Over-allocated!"}
          </p>
        </div>
      </div>

      <p className="text-white/55 text-sm mb-5 leading-relaxed">
        Money in your account that hasn&apos;t been assigned to any partition
        yet. A negative value means you&apos;ve allocated more than you actually
        have.
      </p>

      <div
        className="rounded-xl p-3 mb-5 text-xs font-mono"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <span className="text-white/40">Free Money</span>
        <span className="text-white/70"> = Account Balance − Sum of Partitions</span>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-white/55 text-sm">Available</span>
        <span
          className={`text-2xl font-bold tabular-nums ${
            isValid ? "text-gradient-cyan" : "text-gradient-rose"
          }`}
          style={
            isValid
              ? {
                  background: "linear-gradient(135deg,#22d3ee,#67e8f9)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }
              : {
                  background: "linear-gradient(135deg,#f43f5e,#fb7185)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }
          }
        >
          {Number(freeMoney)?.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

export default FreeMoneySummary;
