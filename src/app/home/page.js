import React from "react";
import { PotsProvider } from "../hooks/contexts/usePots";
import PotHome from "./PotHome";
import { TransactionProvider } from "../hooks/contexts/useTransactions";
import { AuthProvider } from "../auth/context/AuthContext";
import AuthGuard from "../auth/AuthGuard";

function HomeServerEntry() {
  return (
    <PotsProvider>
      <TransactionProvider>
        <AuthProvider>
          <AuthGuard>
            <PotHome />
          </AuthGuard>
        </AuthProvider>
      </TransactionProvider>
    </PotsProvider>
  );
}

export default HomeServerEntry;
