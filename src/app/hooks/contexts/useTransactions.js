"use client";
import { makeDate } from "@/app/lib/utils";
import { createContext, useContext, useReducer } from "react";

const generateTransactionId = (pre = "txn_") => {
  const timestamp = Date.now().toString(36); // Convert current timestamp to base 36
  const randomStr = Math.random().toString(36).substring(2, 8); // Generate random alphanumeric string
  return `${pre}${timestamp}_${randomStr}`;
};

export const generateUniqueId = generateTransactionId;

// Define initial transactions state
const initialTransactions = [
  {
    id: "txn001",
    date: "02/01/2025",
    type: "Deposit",
    amount: 500,
    source: "Savings",
    description: "New Fibre Installations",
  },
  {
    id: "txn002",
    date: "03/01/2025",
    type: "Withdrawal",
    amount: 200,
    source: "Bank",
    description: "Grocery Shopping",
  },
];

// Reducer function to manage transactions
const transactionReducer = (state, action) => {
  switch (action.type) {
    case "ADD_TRANSACTION":
      return [...state, action.payload];

    case "REMOVE_TRANSACTION":
      return state.filter((txn) => txn.id !== action.payload);

    case "ADD_DEPOSIT":
      return [
        {
          id: generateTransactionId("dep_"),
          date: action.payload.date || makeDate(),
          type: "Deposit",
          amount: action.payload.amount,
          source: action.payload.source,
          description: action.payload.description,
        },
        ...state,
      ];

    case "ADD_WITHDRAWAL":
      return [
        {
          id: generateTransactionId("wit_"),
          date: action.payload.date || makeDate(),
          type: "Withdrawal",
          amount: action.payload.amount,
          source: action.payload.source,
          description: action.payload.description,
        },
        ...state,
      ];

    default:
      return state;
  }
};

// Create context
const TransactionContext = createContext();

// Provider component
export const TransactionProvider = ({ children }) => {
  const [transactions, dispatch] = useReducer(transactionReducer, []);

  // Actions
  const addTransaction = (transaction) => {
    dispatch({ type: "ADD_TRANSACTION", payload: transaction });
  };

  const removeTransaction = (id) => {
    dispatch({ type: "REMOVE_TRANSACTION", payload: id });
  };

  const addDeposit = (data) => {
    dispatch({
      type: "ADD_DEPOSIT",
      payload: data,
    });
  };

  const addWithdrawal = (data) => {
    dispatch({
      type: "ADD_WITHDRAWAL",
      payload: data,
    });
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
        removeTransaction,
        addDeposit,
        addWithdrawal,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

// Custom hook to use transaction context
export const useTransactions = () => {
  return useContext(TransactionContext);
};
