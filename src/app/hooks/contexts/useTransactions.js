import { createContext, useContext, useReducer } from "react";

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
        ...state,
        {
          id: `txn${Date.now()}`,
          date: action.payload.date,
          type: "Deposit",
          amount: action.payload.amount,
          source: action.payload.source,
          description: action.payload.description,
        },
      ];

    case "ADD_WITHDRAWAL":
      return [
        ...state,
        {
          id: `txn${Date.now()}`,
          date: action.payload.date,
          type: "Withdrawal",
          amount: action.payload.amount,
          source: action.payload.source,
          description: action.payload.description,
        },
      ];

    default:
      return state;
  }
};

// Create context
const TransactionContext = createContext();

// Provider component
export const TransactionProvider = ({ children }) => {
  const [transactions, dispatch] = useReducer(transactionReducer, initialTransactions);

  // Actions
  const addTransaction = (transaction) => {
    dispatch({ type: "ADD_TRANSACTION", payload: transaction });
  };

  const removeTransaction = (id) => {
    dispatch({ type: "REMOVE_TRANSACTION", payload: id });
  };

  const addDeposit = (date, amount, source, description) => {
    dispatch({
      type: "ADD_DEPOSIT",
      payload: { date, amount, source, description },
    });
  };

  const addWithdrawal = (date, amount, source, description) => {
    dispatch({
      type: "ADD_WITHDRAWAL",
      payload: { date, amount, source, description },
    });
  };

  return (
    <TransactionContext.Provider
      value={{ transactions, addTransaction, removeTransaction, addDeposit, addWithdrawal }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

// Custom hook to use transaction context
export const useTransactions = () => {
  return useContext(TransactionContext);
};
