import { PotsProvider } from "@/app/hooks/contexts/usePots";
import React, { Suspense } from "react";
import OnePotView from "./OnePotView";
import { TransactionProvider } from "@/app/hooks/contexts/useTransactions";
import { BorrowProvider } from "@/app/hooks/contexts/useBorrow";
import { AuthProvider } from "@/app/auth/context/AuthContext";
import Loading from "@/app/components/Loading";
import { getAllPots } from "@/app/auth/utils/firestore-utils";
import Fallback from "@/app/components/Fallback";

async function PotView({ params, searchParams }) {
  const { id } = params;
  const userId = searchParams?.c;

  // const potData = await getAllPots(userId);
  // const pots = potData?.pots;

  // const targetPot = pots.find((pot) => pot.id?.toString() === id) || null;
  // console.log("LE POT DATA", potData);

  // if (!targetPot) return <Fallback message="Pot not found" backUrl="/home" />;

  return (
    // <Suspense fallback={<Loading full />}>
      <PotsProvider>
        <TransactionProvider>
          <BorrowProvider>
            <AuthProvider>
              <OnePotView
                potId={id}
                // targetPot={targetPot}
                // potData={potData}
                userId={userId}
              />
            </AuthProvider>
          </BorrowProvider>
        </TransactionProvider>
      </PotsProvider>
    // </Suspense>
  );
}

export default PotView;
