import { PotsProvider } from "@/app/hooks/contexts/usePots";
import React from "react";
import OnePotView from "./OnePotView";
import { TransactionProvider } from "@/app/hooks/contexts/useTransactions";

async function PotView({ params }) {
  const { id } = params;
  return (
    <PotsProvider>
      <TransactionProvider>
        <OnePotView potId={id} />
      </TransactionProvider>
    </PotsProvider>
  );
}

export default PotView;
