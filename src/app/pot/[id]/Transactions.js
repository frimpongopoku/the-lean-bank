import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faSearch } from "@fortawesome/free-solid-svg-icons";
import TransactionsTable from "./components/TransactionTable"; // Adjust the path as needed
import Loading from "@/app/components/Loading";

import "jspdf-autotable";
import { formatDateTime, generatePDF } from "@/app/lib/utils";
import { TRANSACTIONS } from "@/app/seed/transaction-seed";
import { useState } from "react";
import { saveAs } from "file-saver";

export default function Transactions({ data, potId }) {
  const [selectedWallet, setSelectedWallet] = useState("");
  const renderType = (data) => {
    if (data?.type === "Deposit") {
      return <span className="text-green-600 font-semibold">Deposit</span>;
    }
    return <span className="text-red-600 font-semibold">Withdrawal</span>;
  };
  const renderAmount = (data) => {
    if (data?.type === "Deposit") {
      return (
        <span className="text-green-600 font-semibold">{data?.amount}</span>
      );
    }
    return <span className="text-red-600 font-semibold">{data?.amount}</span>;
  };
  const transformToTableFormat = (transactions) => {
    return transactions?.map((txn) => [
      // { value: txn.id },
      { value: formatDateTime(txn.date) },
      { func: () => renderType(txn) },
      // { value: txn.type },
      // { value: txn.amount },
      { func: () => renderAmount(txn) },
      // { value: txn.amount },
      { value: txn.source },
      { value: txn.description },
    ]);
  };

  const filtered = (data?.filter((txn) => txn?.pot_id === potId) || [])
    .filter((txn) => (selectedWallet ? txn.source === selectedWallet : true))
    .slice(0, 100);

  const transactions = transformToTableFormat(filtered);

  const tableHeadings = [
    // "ID",
    "Date",
    "Type",
    "Amount",
    "Source",
    "Description",
  ];

  const uniqueWallets = [
    ...new Set(data?.map((txn) => txn.source).filter(Boolean)),
  ];

  const totalAmount = filtered.reduce(
    (sum, txn) => sum + (Number(txn.amount) || 0),
    0
  );

  const downloadAsCSV = () => {
    const csvContent = [
      ["Date", "Type", "Amount", "Source", "Description"],
      ...filtered.map((txn) => [
        formatDateTime(txn.date),
        txn.type,
        txn.amount,
        txn.source,
        txn.description,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${formatDateTime(new Date())}-transactions.csv`);
  };
  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold mb-4">Transactions</h1>

      {/* <div className="flex gap-4 mb-6">
        <select className="border p-2 rounded">
          <option>LTF</option>
        </select>
        <input type="date" className="border p-2 rounded" />
        <input type="date" className="border p-2 rounded" />
        <button className="bg-black text-white px-4 py-2 rounded flex items-center gap-2">
          <FontAwesomeIcon icon={faSearch} /> Search
        </button>
      </div> */}

      <div className="flex gap-4 mb-4">
        <button
          onClick={() =>
            generatePDF(
              "Transactions",
              `${formatDateTime(new Date())}-transactions`
            )
          }
          className="text-green-600 font-bold flex items-center gap-2 cursor-pointer"
        >
          <FontAwesomeIcon icon={faDownload} /> Download All
        </button>
        <button
          onClick={() => downloadAsCSV()}
          className="text-green-600 font-bold cursor-pointer"
        >
          <FontAwesomeIcon icon={faDownload} /> Download as CSV
        </button>
        {/* <a href="#" className="text-green-600 font-bold">
          Show All
        </a> */}
      </div>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex gap-4  mr-2">
          <select
            className="border p-2 rounded"
            value={selectedWallet}
            onChange={(e) => setSelectedWallet(e.target.value)}
          >
            <option value="">All Wallets</option>
            {uniqueWallets.map((wallet) => (
              <option key={wallet} value={wallet}>
                {wallet}
              </option>
            ))}
          </select>
        </div>
        <p className="text-lg font-semibold">
          Total Amount:{" "}
          <span className="text-red-600">¢{totalAmount?.toFixed(2)}</span>
        </p>
      </div>
      {selectedWallet ? (
        <></>
      ) : (
        <p className="text-gray-500 text-sm mb-2">
          Only shows the most recent 100. Download all to see all transactions
        </p>
      )}

      <div className="printable-area shadow-xl bg-white rounded-lg p-4">
        <TransactionsTable data={transactions} head={tableHeadings} />
      </div>
    </div>
  );
}
