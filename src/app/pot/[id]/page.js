import { PotsProvider } from "@/app/hooks/contexts/usePots";
import React from "react";
import OnePotView from "./OnePotView";
import { TransactionProvider } from "@/app/hooks/contexts/useTransactions";
import { BorrowProvider } from "@/app/hooks/contexts/useBorrow";
import { AuthProvider } from "@/app/auth/context/AuthContext";

async function PotView({ params }) {
  const { id } = params;
  return (
    <PotsProvider>
      <TransactionProvider>
        <BorrowProvider>
          <AuthProvider>
            <OnePotView potId={id} />
          </AuthProvider>
        </BorrowProvider>
      </TransactionProvider>
    </PotsProvider>
  );
}

export default PotView;
