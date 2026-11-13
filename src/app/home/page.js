import React from "react";
import { PotsProvider } from "../hooks/contexts/usePots";
import PotHome from "./PotHome";
import { TransactionProvider } from "../hooks/contexts/useTransactions";
import { BorrowProvider } from "../hooks/contexts/useBorrow";
import { AuthProvider } from "../auth/context/AuthContext";
import AuthGuard from "../auth/AuthGuard";
import { ToastProvider } from "../components/ToastProvider";
import ErrorBoundary from "../components/ErrorBoundary";

function HomeServerEntry() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <PotsProvider>
            <TransactionProvider>
              <BorrowProvider>
                <AuthGuard>
                  <PotHome />
                </AuthGuard>
              </BorrowProvider>
            </TransactionProvider>
          </PotsProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default HomeServerEntry;
