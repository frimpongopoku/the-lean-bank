"use client";
import { updateTransactionsInFirestore } from "@/app/auth/utils/firestore-utils";
import { makeDate } from "@/app/lib/utils";
import { createContext, useContext, useEffect, useReducer } from "react";

const generateTransactionId = (pre = "txn_") => {
  const timestamp = Date.now().toString(36); // Convert current timestamp to base 36
  const randomStr = Math.random().toString(36).substring(2, 8); // Generate random alphanumeric string
  return `${pre}${timestamp}_${randomStr}`;
};

export const generateUniqueId = generateTransactionId;

// Define initial state with key and transactions array
const initialState = {
  key: "CcMYY13GJaNliVoRN1oHPxxb25U2",
  transactions: [
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
  ],
};

// Reducer function to manage transactions
const transactionReducer = (state, action) => {
  switch (action.type) {
    case "SET_TRANSACTIONS":
      return {
        ...state,
        key: action.payload.key,
        transactions: action.payload.transactions,
      };

    case "ADD_TRANSACTION":
      return {
        ...state,
        transactions: [...state.transactions, action.payload],
      };

    case "REMOVE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.filter(
          (txn) => txn.id !== action.payload
        ),
      };

    case "ADD_DEPOSIT":
      return {
        ...state,
        transactions: [
          {
            id: generateTransactionId("dep_"),
            date: action.payload.date || makeDate(),
            type: "Deposit",
            amount: action.payload.amount,
            source: action.payload.source,
            description: action.payload.description,
          },
          ...state.transactions,
        ],
      };

    case "ADD_WITHDRAWAL":
      return {
        ...state,
        transactions: [
          {
            id: generateTransactionId("wit_"),
            date: action.payload.date || makeDate(),
            type: "Withdrawal",
            amount: action.payload.amount,
            source: action.payload.source,
            description: action.payload.description,
          },
          ...state.transactions,
        ],
      };

    default:
      return state;
  }
};

// Create context
const TransactionContext = createContext();

// Provider component
export const TransactionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(transactionReducer, {});

  useEffect(() => {
    if (state?.transactions?.length > 0)
      updateTransactionsInFirestore(state?.key, state);
  }, [JSON.stringify(state)]);

  // Actions
  const setTransactions = (newTransactionObject) => {
    dispatch({ type: "SET_TRANSACTIONS", payload: newTransactionObject });
  };

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
        key: state.key,
        transactions: state.transactions,
        setTransactions,
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
