import React from "react";

function CenteredWrapper({ children }) {
  return (
    <div className="flex items-start justify-center min-h-screen">
      <div className="p-4 sm:p-6 w-full max-w-5xl">{children}</div>
    </div>
  );
}

export default CenteredWrapper;
