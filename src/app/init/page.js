import React from "react";

import InitializeAccount from "./InitializeAccount";
import AuthGuard from "../auth/AuthGuard";
import { AuthProvider } from "../auth/context/AuthContext";

AuthGuard;
function Init() {
  return (
    <AuthProvider>
      <AuthGuard signout>
        <InitializeAccount />
      </AuthGuard>
    </AuthProvider>
  );
}

export default Init;
