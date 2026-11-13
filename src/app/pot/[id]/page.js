import { PotsProvider } from "@/app/hooks/contexts/usePots";
import React from "react";
import OnePotView from "./OnePotView";
import { TransactionProvider } from "@/app/hooks/contexts/useTransactions";
import { BorrowProvider } from "@/app/hooks/contexts/useBorrow";
import { AuthProvider } from "@/app/auth/context/AuthContext";
import AuthGuard from "@/app/auth/AuthGuard";
import { ToastProvider } from "@/app/components/ToastProvider";
import ErrorBoundary from "@/app/components/ErrorBoundary";

async function PotView({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;

  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <PotsProvider>
            <TransactionProvider>
              <BorrowProvider>
                <AuthGuard>
                  <OnePotView potId={id} userId={sp?.c} initialTab={sp?.tab} focusLoanId={sp?.loan} />
                </AuthGuard>
              </BorrowProvider>
            </TransactionProvider>
          </PotsProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default PotView;
