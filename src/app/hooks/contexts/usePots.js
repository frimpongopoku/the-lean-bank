"use client";

import React, { createContext, useContext, useState } from "react";

export const POTS = [
  {
    name: "GCB Ghana Cedi",
    balance: 12456,
    id: 1,
    currency: "GHS",
    parts: [
      { name: "Savings", balance: 8456, id: 1, currency: "GHS" },
      { name: "Investment", balance: 34456, id: 2, currency: "GHS" },
      { name: "Emergency", balance: 50456, id: 3, currency: "GHS" },
    ],
  },
  {
    name: "First Atlantic USD",
    balance: 12456,
    id: 2,
    currency: "USD",
    parts: [
      { name: "Savings", balance: 10456, id: 1, currency: "USD" },
      { name: "Investment", balance: 102456, id: 2, currency: "USD" },
      { name: "Emergency", balance: 9456, id: 3, currency: "USD" },
    ],
  },
  // Add more pots here...
];

const PotsContext = createContext();

export const PotsProvider = ({ children }) => {
  const [pots, setPots] = useState([]);

  const addPot = (newPot) => {
    setPots((prevPots) => [...prevPots, newPot]);
  };

  const removePot = (potId) => {
    setPots((prevPots) => prevPots.filter((pot) => pot.id !== potId));
  };

  const editPot = (updatedPot) => {
    setPots((prevPots) =>
      prevPots.map((pot) =>
        pot.id === updatedPot.id ? { ...pot, ...updatedPot } : pot
      )
    );
  };

  const addPartToPot = (potId, newPart) => {
    setPots((prevPots) =>
      prevPots.map((pot) => {
        if (pot.id === potId) {
          return {
            ...pot,
            parts: [...pot.parts, newPart],
          };
        }
        return pot;
      })
    );
  };

  const removePartFromPot = (potId, partId) => {
    setPots((prevPots) =>
      prevPots.map((pot) => {
        if (pot.id === potId) {
          return {
            ...pot,
            parts: pot.parts.filter((part) => part.id !== partId),
          };
        }
        return pot;
      })
    );
  };

  const updatePartInPot = (potId, updatedPart) => {
    setPots((prevPots) =>
      prevPots.map((pot) => {
        if (pot.id === potId) {
          return {
            ...pot,
            parts: pot.parts.map((part) =>
              part.id === updatedPart.id ? { ...part, ...updatedPart } : part
            ),
          };
        }
        return pot;
      })
    );
  };

  const updatePotWithDeposit = (potId, partId, amount) => {
    setPots((prevPots) => {
      return prevPots.map((pot) => {
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
      });
    });
  };

  const updatePotWithWithdrawal = (potId, partId, amount) => {
    setPots((prevPots) => {
      return prevPots.map((pot) => {
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
        return pot;
      });
    });
  };

  return (
    <PotsContext.Provider
      value={{
        pots,
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
