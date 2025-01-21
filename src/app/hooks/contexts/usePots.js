"use client";

import { UNDEFINED } from "@/app/auth/context/AuthContext";
import { updatePotsInFirestore } from "@/app/auth/utils/firestore-utils";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

// export const POTS = [
//   {
//     name: "GCB Ghana Cedi",
//     balance: 12456,
//     id: 1,
//     currency: "GHS",
//     parts: [
//       { name: "Savings", balance: 8456, id: 1, currency: "GHS" },
//       { name: "Investment", balance: 34456, id: 2, currency: "GHS" },
//       { name: "Emergency", balance: 50456, id: 3, currency: "GHS" },
//     ],
//   },
//   {
//     name: "First Atlantic USD",
//     balance: 12456,
//     id: 2,
//     currency: "USD",
//     parts: [
//       { name: "Savings", balance: 10456, id: 1, currency: "USD" },
//       { name: "Investment", balance: 102456, id: 2, currency: "USD" },
//       { name: "Emergency", balance: 9456, id: 3, currency: "USD" },
//     ],
//   },
//   // Add more pots here...
// ];

const PotsContext = createContext();

export const PotsProvider = ({ children }) => {
  const [potData, setPotData] = useState({ key: UNDEFINED, pots: null });
  const firstRender = useRef(true);
  // const searchParams = useSearchParams();
  // const collectionId = searchParams.get("c"); // Get collection ID from URL

  // Sync potData to Firestore whenever it changes
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (potData?.pots?.length > 0) {
      updatePotsInFirestore(potData?.key, potData);
    }
  }, [JSON.stringify(potData)]);

  const addPot = (newPot) => {
    setPotData((prevPotData) => ({
      ...prevPotData,
      pots: [...prevPotData.pots, newPot],
    }));
  };

  const removePot = (potId) => {
    setPotData((prevPotData) => ({
      ...prevPotData,
      pots: prevPotData.pots.filter((pot) => pot.id !== potId),
    }));
  };

  const editPot = (updatedPot) => {
    setPotData((prevPotData) => ({
      ...prevPotData,
      pots: prevPotData.pots.map((pot) =>
        pot.id === updatedPot.id ? { ...pot, ...updatedPot } : pot
      ),
    }));
  };

  const addPartToPot = (potId, newPart) => {
    setPotData((prevPotData) => ({
      ...prevPotData,
      pots: prevPotData.pots.map((pot) => {
        if (pot.id === potId) {
          return {
            ...pot,
            parts: [...(pot?.parts || []), newPart],
          };
        }
        return pot;
      }),
    }));
  };

  const removePartFromPot = (potId, partId) => {
    setPotData((prevPotData) => ({
      ...prevPotData,
      pots: prevPotData.pots.map((pot) => {
        if (pot.id === potId) {
          return {
            ...pot,
            parts: pot.parts.filter((part) => part.id !== partId),
          };
        }
        return pot;
      }),
    }));
  };

  const updatePartInPot = (potId, updatedPart) => {
    setPotData((prevPotData) => ({
      ...prevPotData,
      pots: prevPotData.pots.map((pot) => {
        if (pot.id === potId) {
          return {
            ...pot,
            parts: pot.parts.map((part) =>
              part.id === updatedPart.id ? { ...part, ...updatedPart } : part
            ),
          };
        }
        return pot;
      }),
    }));
  };

  const updatePotWithDeposit = (potId, partId, amount) => {
    setPotData((prevPotData) => ({
      ...prevPotData,
      pots: prevPotData.pots.map((pot) => {
        if (pot.id === potId) {
          const updatedParts = pot.parts.map((part) =>
            part.id === partId
              ? { ...part, balance: Number(part.balance) + amount }
              : part
          );

          return {
            ...pot,
            balance: Number(pot.balance) + amount,
            parts: updatedParts,
          };
        }
        return pot;
      }),
    }));
  };

  const updatePotWithWithdrawal = (potId, partId, amount) => {
    console.log("I was in here");
    setPotData((prevPotData) => ({
      ...prevPotData,
      pots: prevPotData.pots.map((pot) => {
        if (pot.id === potId) {
          const updatedParts = pot.parts.map((part) =>
            part.id === partId
              ? { ...part, balance: Number(part.balance) - amount }
              : part
          );

          return {
            ...pot,
            balance: Number(pot.balance) - amount,
            parts: updatedParts,
          };
        }
        console.log("Lets see POT", pot);
        return pot;
      }),
    }));
  };

  return (
    <PotsContext.Provider
      value={{
        potData,
        setPotData,
        addPot,
        removePot,
        editPot,
        addPartToPot,
        removePartFromPot,
        updatePartInPot,
        updatePotWithDeposit,
        updatePotWithWithdrawal,
      }}
    >
      {children}
    </PotsContext.Provider>
  );
};

export const usePots = () => {
  const context = useContext(PotsContext);
  if (!context) {
    throw new Error("usePots must be used within a PotsProvider");
  }
  return context;
};
