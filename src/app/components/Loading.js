import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

function Loading({ className, ...props }) {
  return (
    <FontAwesomeIcon
      icon={faSpinner}
      {...props}
      className={`animate-spin text-2xl text-green-600 ${className || ""}`}
    />
  );
}

export default Loading;
