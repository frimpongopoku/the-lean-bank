import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faSearch } from "@fortawesome/free-solid-svg-icons";
import TransactionsTable from "./components/TransactionTable"; // Adjust the path as needed
import { useModal } from "./components/EBModal";
import PayUpConfirmation from "./components/PayUpConfirmation";

export default function Transactions({ data }) {
  const { Modal, openModal } = useModal();

  // const b = [
  //   {
  //     date: "2nd January 2025",
  //     type: "Deposit",
  //     amount: 500,
  //     source: "Savings",
  //     source_id: "part_savings001",
  //     description: "New Fibre Installations",
  //   },
  // ];
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

  const transformToTableFormat = (b) => {
    return b.map((txn) => [
      // { value: txn.id },
      { value: txn.source },
      { value: txn.amount },
      { value: txn.date },
      { value: txn.description },
      { func: renderPay },
    ]);
  };
  const borrows = transformToTableFormat(data);
  

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
          data={borrows}
          head={tableHeadings}
          cColor="bg-orange-50"
        />
      </div>
    </div>
  );
}
