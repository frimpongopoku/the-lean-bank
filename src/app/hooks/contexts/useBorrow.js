"use client";
import { updateBorrowsInFirestore } from "@/app/auth/utils/firestore-utils";
import { createContext, useContext, useEffect, useState } from "react";

const BorrowContext = createContext();

export const BorrowProvider = ({ children }) => {
  const [borrowState, setBorrowState] = useState({
    key: "",
    borrows: [],
  });

  useEffect(() => {
    if (borrowState?.borrows?.length > 0) {
      updateBorrowsInFirestore(borrowState?.key, borrowState);
    }
  }, [JSON.stringify(borrowState)]);

  // Set the entire borrow state
  const setBorrows = (newBorrowState) => {
    setBorrowState(newBorrowState);
  };

  // Add a new borrow record
  const addBorrow = (newBorrow) => {
    setBorrowState((prevState) => ({
      ...prevState,
      borrows: [...(prevState?.borrows || []), newBorrow],
    }));
  };

  // Update an existing borrow item by ID
  const updateBorrow = (id, updatedData) => {
    setBorrowState((prevState) => ({
      ...prevState,
      borrows: prevState.borrows.map((borrow) =>
        borrow.id === id ? { ...borrow, ...updatedData } : borrow
      ),
    }));
  };

  // Delete a borrow record by ID
  const deleteBorrow = (id) => {
    setBorrowState((prevState) => ({
      ...prevState,
      borrows: prevState.borrows.filter((borrow) => borrow.id !== id),
    }));
  };

  // Get a specific borrow item by ID
  const getBorrowById = (id) => {
    return borrowState.borrows.find((borrow) => borrow.id === id);
  };

  // Mark a borrow item as paid
  const markAsPaid = (id) => {
    updateBorrow(id, { paid: true });
  };

  // Record a (partial) repayment; marks paid:true when fully settled
  const recordRepayment = (id, amount) => {
    setBorrowState((prevState) => ({
      ...prevState,
      borrows: prevState.borrows.map((borrow) => {
        if (borrow.id !== id) return borrow;
        const newPaidAmount = Number(borrow.paid_amount || 0) + amount;
        const fullyPaid = newPaidAmount >= Number(borrow.amount);
        return { ...borrow, paid_amount: newPaidAmount, paid: fullyPaid };
      }),
    }));
  };

  return (
    <BorrowContext.Provider
      value={{
        key: borrowState.key,
        borrows: borrowState.borrows,
        setBorrows,
        addBorrow,
        updateBorrow,
        deleteBorrow,
        getBorrowById,
        markAsPaid,
        recordRepayment,
      }}
    >
      {children}
    </BorrowContext.Provider>
  );
};

export const useBorrow = () => {
  return useContext(BorrowContext);
};
