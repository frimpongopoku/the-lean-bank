import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faSearch } from "@fortawesome/free-solid-svg-icons";
import TransactionsTable from "./components/TransactionTable"; // Adjust the path as needed
import { useModal } from "./components/EBModal";
import PayUpConfirmation from "./components/PayUpConfirmation";

export default function Transactions() {
  const { Modal, openModal } = useModal();

  const payUp = () => {
    openModal(<PayUpConfirmation />);
  };
  const renderPay = (data) => {
    return (
      <button
        onClick={payUp}
        className="bg-green-500 text-white font-bold text-sm px-3 py-1 rounded"
      >
        Pay
      </button>
    );
  };
  const transactions = [
    [
      { value: "Deposit" },
      { value: 500 },
      { value: "2nd January 2025" },
      { value: "New Fibre Installations" },
      { func: renderPay },
    ],
    [
      { value: "Spend" },
      { value: 500 },
      { value: "2nd January 2025" },
      { value: "New Fibre Installations" },
      { func: renderPay },
    ],
    [
      { value: "Deposit" },
      { value: 500 },
      { value: "2nd January 2025" },
      { value: "New Fibre Installations" },
      { func: renderPay },
    ],
    [
      { value: "Spend" },
      { value: 500 },
      { value: "2nd January 2025" },
      { value: "New Fibre Installations" },
      { func: renderPay },
    ],
    [
      { value: "Spend" },
      { value: 500 },
      { value: "2nd January 2025" },
      { value: "New Fibre Installations" },
      { func: renderPay },
    ],
    [
      { value: "LTF" },
      { value: 500 },
      { value: "2nd January 2025" },
      { value: "New Fibre Installations" },
      { func: renderPay },
    ],
    [
      { value: "LTF" },
      { value: 500 },
      { value: "2nd January 2025" },
      { value: "New Fibre Installations" },
      { func: renderPay },
    ],
    [
      { value: "LTF" },
      { value: 500 },
      { value: "2nd January 2025" },
      { value: "New Fibre Installations" },
      { func: renderPay },
    ],
    [
      { value: "LTF" },
      { value: 500 },
      { value: "2nd January 2025" },
      { value: "New Fibre Installations" },
      { func: renderPay },
    ],
    [
      { value: "LTF" },
      { value: 500 },
      { value: "2nd January 2025" },
      { value: "New Fibre Installations" },
      { func: renderPay },
    ],
  ];

  const tableHeadings = [
    "Wallet Source",
    "Amount",
    "Date",
    "Description",
    "Action",
  ];

  return (
    <div className="py-8">
      <Modal />
      <h1 className="text-2xl font-bold mb-4">Transactions</h1>

      <div className="flex gap-4 mb-6">
        <select className="border p-2 rounded">
          <option>LTF</option>
        </select>
        <input type="date" className="border p-2 rounded" />
        <input type="date" className="border p-2 rounded" />
        <button className="bg-black text-white px-4 py-2 rounded flex items-center gap-2">
          <FontAwesomeIcon icon={faSearch} /> Search
        </button>
      </div>

      <div className="flex gap-4 mb-4">
        <a href="#" className="text-green-600 font-bold">
          <FontAwesomeIcon icon={faDownload} /> Download
        </a>
        <a href="#" className="text-green-600 font-bold">
          Show All
        </a>
      </div>

      <div className=" shadow-xl bg-white rounded-lg p-4">
        <TransactionsTable
          data={transactions}
          head={tableHeadings}
          cColor="bg-orange-50"
        />
      </div>
    </div>
  );
}
