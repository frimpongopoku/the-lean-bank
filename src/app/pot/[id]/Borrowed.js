import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faSearch } from "@fortawesome/free-solid-svg-icons";
import TransactionsTable from "./components/TransactionTable"; // Adjust the path as needed
import { useModal } from "./components/EBModal";
import PayUpConfirmation from "./components/PayUpConfirmation";
import { useBorrow } from "@/app/hooks/contexts/useBorrow";
import { formatDateTime, generatePDF } from "@/app/lib/utils";

export default function Transactions({ data, potId, payUpIntoSource }) {
  const { Modal, openModal, closeModal } = useModal();
  const { borrow, markAsPaid } = useBorrow();

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
  const payUp = (data) => {
    openModal(
      <PayUpConfirmation
        onConfirm={(content) => {
          const depositBackIntoSource = content === "source_wallet";
          markAsPaid(data?.id);
          closeModal();
          if (!depositBackIntoSource) return;
          payUpIntoSource(data?.source_id, data?.amount);
        }}
        onClose={() => closeModal()}
      />
    );
  };

  const renderAmount = (data) => {
    return <span className="text-red-600 font-semibold">{data?.amount}</span>;
  };
  const renderPay = (data) => {
    if (data?.paid)
      return <span className="text-green-700 font-semibold">Paid</span>;
    return (
      <button
        onClick={() => payUp(data)}
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
      { func: () => renderAmount(txn) },
      { value: formatDateTime(txn.date) },
      { value: txn.description },
      { func: () => renderPay(txn) },
    ]);
  };

  const filtered = (data?.filter((txn) => txn?.pot_id === potId) || []).slice(
    0,
    50
  );
  const borrows = transformToTableFormat(filtered);

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
      <h1 className="text-2xl font-bold mb-4">Borrows</h1>

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
              "Borrows",
              `${formatDateTime(new Date())}-borrows`,
              ".printable-borrowed-area"
            )
          }
          className="text-green-600 font-bold cursor-pointer"
        >
          <FontAwesomeIcon icon={faDownload} /> Download All
        </button>
        {/* <a href="#" className="text-green-600 font-bold">
          Show All
        </a> */}
      </div>
      <p className="text-gray-500 text-sm mb-2">
        Only shows the most recent 50. Download all to see all borrowed
        transactions
      </p>

      <div className=" printable-borrowed-area shadow-xl bg-white rounded-lg p-4">
        <TransactionsTable
          data={borrows}
          head={tableHeadings}
          cColor="bg-orange-50"
        />
      </div>
    </div>
  );
}
