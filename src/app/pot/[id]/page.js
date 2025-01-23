import { PotsProvider } from "@/app/hooks/contexts/usePots";
import React, { Suspense } from "react";
import OnePotView from "./OnePotView";
import { TransactionProvider } from "@/app/hooks/contexts/useTransactions";
import { BorrowProvider } from "@/app/hooks/contexts/useBorrow";
import { AuthProvider } from "@/app/auth/context/AuthContext";
import AuthGuard from "@/app/auth/AuthGuard";

async function PotView({ params, searchParams }) {
  const { id } = params;
  const userId = searchParams?.c;

  return (
    // <Suspense fallback={<Loading full />}>
    <PotsProvider>
      <TransactionProvider>
        <BorrowProvider>
          <AuthProvider>
            <AuthGuard>
              <OnePotView
                potId={id}
                // targetPot={targetPot}
                // potData={potData}
                userId={userId}
              />
            </AuthGuard>
          </AuthProvider>
        </BorrowProvider>
      </TransactionProvider>
    </PotsProvider>
    // </Suspense>
  );
}

export default PotView;
