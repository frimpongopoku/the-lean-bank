import { PotsProvider } from "@/app/hooks/contexts/usePots";
import React from "react";
import OnePotView from "./OnePotView";

async function PotView({ params }) {
  const { id } = params;
  return (
    <PotsProvider>
      <OnePotView potId={id} />
    </PotsProvider>
  );
}

export default PotView;
