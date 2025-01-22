import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faSearch } from "@fortawesome/free-solid-svg-icons";
import TransactionsTable from "./components/TransactionTable"; // Adjust the path as needed
import Loading from "@/app/components/Loading";

import "jspdf-autotable";
import { formatDateTime, generatePDF } from "@/app/lib/utils";
import { TRANSACTIONS } from "@/app/seed/transaction-seed";

export default function Transactions({ data }) {
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

  const transactions = transformToTableFormat(data);

  const tableHeadings = [
    // "ID",
    "Date",
    "Type",
    "Amount",
    "Source",
    "Description",
  ];

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
          <FontAwesomeIcon icon={faDownload} /> Download
        </button>
        {/* <a href="#" className="text-green-600 font-bold">
          Show All
        </a> */}
      </div>

      <div className="printable-area shadow-xl bg-white rounded-lg p-4">
        <TransactionsTable data={transactions} head={tableHeadings} />
      </div>
    </div>
  );
}
