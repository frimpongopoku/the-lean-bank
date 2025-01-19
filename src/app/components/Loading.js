import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

function Loading({ className, full, ...props }) {
  if (full) return <FullScreenLoader {...props} />;

  return (
    <FontAwesomeIcon
      icon={faSpinner}
      {...props}
      className={`animate-spin text-2xl text-green-600 ${className || ""}`}
    />
  );
}

const FullScreenLoader = ({ message = "Loading, please wait..." }) => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center p-6 bg-white rounded shadow-md">
        <FontAwesomeIcon
          icon={faSpinner}
          spin
          className="text-green-600 text-4xl mb-4"
        />
        <p className="text-gray-700 text-lg">{message}</p>
      </div>
    </div>
  );
};

export default Loading;
