import { PotsProvider } from "@/app/hooks/contexts/usePots";
import React from "react";
import OnePotView from "./OnePotView";
import { TransactionProvider } from "@/app/hooks/contexts/useTransactions";
import { BorrowProvider } from "@/app/hooks/contexts/useBorrow";

async function PotView({ params }) {
  const { id } = params;
  return (
    <PotsProvider>
      <TransactionProvider>
        <BorrowProvider>
          <OnePotView potId={id} />
        </BorrowProvider>
      </TransactionProvider>
    </PotsProvider>
  );
}

export default PotView;
