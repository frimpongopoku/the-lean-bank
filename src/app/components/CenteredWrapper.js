import React from "react";

function CenteredWrapper({ children }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 w-full max-w-4xl">{children}</div>
    </div>
  );
}

export default CenteredWrapper;
