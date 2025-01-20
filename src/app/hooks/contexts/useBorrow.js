"use client";
import { createContext, useContext, useState } from "react";

const BorrowContext = createContext();

export const BorrowProvider = ({ children }) => {
  const [borrows, setBorrows] = useState([]);

  // Add a new borrow record
  const addBorrow = (newBorrow) => {
    setBorrows((prevBorrows) => [...prevBorrows, newBorrow]);
  };

  // Update an existing borrow item by ID
  const updateBorrow = (id, updatedData) => {
    setBorrows((prevBorrows) =>
      prevBorrows.map((borrow) =>
        borrow.id === id ? { ...borrow, ...updatedData } : borrow
      )
    );
  };

  // Delete a borrow record by ID
  const deleteBorrow = (id) => {
    setBorrows((prevBorrows) =>
      prevBorrows.filter((borrow) => borrow.id !== id)
    );
  };

  // Get a specific borrow item by ID
  const getBorrowById = (id) => {
    return borrows.find((borrow) => borrow.id === id);
  };

  // Mark a borrow item as paid
  const markAsPaid = (id) => {
    updateBorrow(id, { paid: true });
  };

  return (
    <BorrowContext.Provider
      value={{
        borrows,
        addBorrow,
        updateBorrow,
        deleteBorrow,
        getBorrowById,
        markAsPaid,
      }}
    >
      {children}
    </BorrowContext.Provider>
  );
};

export const useBorrow = () => {
  return useContext(BorrowContext);
};
