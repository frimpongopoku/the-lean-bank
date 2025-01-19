import React from "react";
import { PotsProvider } from "../hooks/contexts/usePots";
import PotHome from "./PotHome";
import { TransactionProvider } from "../hooks/contexts/useTransactions";

function HomeServerEntry() {
  return (
    <PotsProvider>
      <TransactionProvider>
        <PotHome />
      </TransactionProvider>
    </PotsProvider>
  );
}

export default HomeServerEntry;
