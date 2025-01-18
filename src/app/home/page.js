import React from "react";
import { PotsProvider } from "../hooks/contexts/usePots";
import PotHome from "./PotHome";

function HomeServerEntry() {
  return (
    <PotsProvider>
      <PotHome />
    </PotsProvider>
  );
}

export default HomeServerEntry;
