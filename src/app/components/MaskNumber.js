import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const MaskNumber = ({ number, className }) => {
  const [isVisible, setIsVisible] = useState(false);
  const str = String(number ?? "0");

  return (
    <span className={`inline-flex items-center gap-2 ${className || ""}`}>
      <span className="font-bold tabular-nums">
        {isVisible ? str : "•".repeat(Math.min(str.length, 8))}
      </span>
      <button
        type="button"
        onClick={() => setIsVisible((v) => !v)}
        aria-label={isVisible ? "Hide amount" : "Show amount"}
        aria-pressed={isVisible}
        className="text-white/30 hover:text-white/70 transition-colors cursor-pointer focus:outline-none"
      >
        <FontAwesomeIcon
          icon={isVisible ? faEye : faEyeSlash}
          className="text-sm"
        />
      </button>
    </span>
  );
};

export default MaskNumber;
