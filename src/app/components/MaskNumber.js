import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const MaskNumber = ({ number, className }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Convert number to string to calculate length
  const numberString = number.toString();

  return (
    <span className={`flex items-center space-x-2 flex-row  `}>
      <span className={`font-bold ${className || ""}`}>
        {isVisible ? numberString : ".".repeat(numberString.length)}
      </span>
      {/* <span
        onClick={() => setIsVisible(!isVisible)}
        className="focus:outline-none cursor-pointer hover:text-green-600"
      > */}
      <FontAwesomeIcon
        onClick={() => setIsVisible(!isVisible)}
        icon={isVisible ? faEye : faEyeSlash}
        className={`text-gray-400 text-lg cursor-pointer hover:text-green-600 ${className}`}
      />
      {/* </span> */}
    </span>
  );
};

export default MaskNumber;
