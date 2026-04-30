import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faFilter,
  faHandHoldingDollar,
  faCircleCheck,
  faMagnifyingGlass,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import TransactionsTable from "./components/TransactionTable";
import { useModal } from "./components/EBModal";
import PayUpConfirmation from "./components/PayUpConfirmation";
import { useBorrow } from "@/app/hooks/contexts/useBorrow";
import { formatDateTime, generatePDF } from "@/app/lib/utils";
import { useState } from "react";
import { saveAs } from "file-saver";

export default function Borrowed({ data, potId, payUpIntoSource }) {
  const { Modal, openModal, closeModal } = useModal();
  const { markAsPaid, recordRepayment } = useBorrow();
  const [selectedWallet, setSelectedWallet] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const payUp = (borrow) => {
    openModal(
      <PayUpConfirmation
        borrow={borrow}
        onConfirm={({ option, amount, isFullRepayment }) => {
          recordRepayment(borrow?.id, amount);
          closeModal();
          if (option === "source_wallet") payUpIntoSource(borrow?.source_id, amount);
        }}
        onClose={closeModal}
      />
    );
  };

  const renderAmount = (txn) => {
    const total = Number(txn?.amount);
    const paid = Number(txn?.paid_amount || 0);
    const remaining = total - paid;
    return (
      <div>
        <span className="text-brand-amber font-bold tabular-nums text-sm block">{total.toLocaleString()}</span>
        {paid > 0 && !txn?.paid && (
          <span className="text-white/35 text-xs tabular-nums">{remaining.toLocaleString()} left</span>
        )}
      </div>
    );
  };

  const renderStatus = (txn) => {
    if (txn?.paid) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-emerald px-2.5 py-1 rounded-full"
          style={{ background: "rgba(16,185,129,0.1)" }}>
          <FontAwesomeIcon icon={faCircleCheck} className="text-xs" />
          Paid
        </span>
      );
    }
    const paid = Number(txn?.paid_amount || 0);
    const label = paid > 0 ? "Repay more" : "Mark Paid";
    return (
      <button
        onClick={() => payUp(txn)}
        className="text-xs font-bold px-3 py-1.5 rounded-xl text-brand-emerald transition-all duration-150"
        style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}
        onMouseOver={(e) => { e.currentTarget.style.background = "rgba(16,185,129,0.18)"; }}
        onMouseOut={(e) => { e.currentTarget.style.background = "rgba(16,185,129,0.1)"; }}
      >
        {label}
      </button>
    );
  };

  const transformToTableFormat = (borrows) =>
    borrows.map((txn) => [
      { value: txn.source },
      { func: () => renderAmount(txn) },
      { value: formatDateTime(txn.date) },
      { value: txn.description },
      { func: () => renderStatus(txn) },
    ]);

  const potFiltered = (data?.filter((txn) => txn?.pot_id === potId) || []).reverse();

  const filtered = potFiltered
    .filter((txn) => (selectedWallet ? txn.source === selectedWallet : true))
    .filter((txn) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        txn.description?.toLowerCase().includes(q) ||
        txn.source?.toLowerCase().includes(q)
      );
    })
    .filter((txn) => (dateFrom ? new Date(txn.date) >= new Date(dateFrom) : true))
    .filter((txn) => (dateTo ? new Date(txn.date) <= new Date(dateTo + "T23:59:59") : true))
    .filter((txn) => {
      if (statusFilter === "paid") return txn.paid;
      if (statusFilter === "unpaid") return !txn.paid;
      return true;
    })
    .slice(0, 100);

  const hasFilters = selectedWallet || search || dateFrom || dateTo || statusFilter;

  const clearFilters = () => {
    setSelectedWallet("");
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setStatusFilter("");
  };

  const borrows = transformToTableFormat(filtered);

  const tableHeadings = ["Partition", "Amount", "Date", "Description", "Status"];

  const uniqueWallets = [...new Set(potFiltered.map((txn) => txn.source).filter(Boolean))];

  const totalOwed = filtered
    .filter((t) => !t.paid)
    .reduce((s, t) => s + (Number(t.amount) || 0) - (Number(t.paid_amount) || 0), 0);
  const totalPaid = filtered
    .filter((t) => t.paid)
    .reduce((s, t) => s + (Number(t.amount) || 0), 0);

  const downloadAsCSV = () => {
    const csvContent = [
      ["Partition", "Amount", "Date", "Description", "Paid"],
      ...filtered.map((txn) => [
        txn.source, txn.amount, formatDateTime(txn.date), txn.description,
        txn.paid ? "Yes" : "No",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${formatDateTime(new Date())}-borrows.csv`);
  };

  return (
    <div className="py-4">
      <Modal />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="glass-sm p-3.5">
          <p className="text-white/40 text-xs mb-1.5 uppercase tracking-wider font-semibold">
            Outstanding
          </p>
          <p className="text-brand-amber font-bold text-xl tabular-nums">
            {totalOwed.toLocaleString()}
          </p>
        </div>
        <div className="glass-sm p-3.5">
          <p className="text-white/40 text-xs mb-1.5 uppercase tracking-wider font-semibold">
            Repaid
          </p>
          <p className="text-brand-emerald font-bold text-xl tabular-nums">
            {totalPaid.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-2 mb-5">
        {/* Row 1: search + partition + status */}
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs pointer-events-none" />
            <input
              type="text"
              placeholder="Search description, partition…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 text-sm rounded-xl text-white/80 w-full"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", outline: "none" }}
            />
          </div>
          <div className="relative">
            <FontAwesomeIcon icon={faFilter} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs pointer-events-none" />
            <select
              value={selectedWallet}
              onChange={(e) => setSelectedWallet(e.target.value)}
              className="pl-8 pr-3 py-2 text-sm rounded-xl text-white/75 appearance-none cursor-pointer"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", outline: "none" }}
            >
              <option value="">All partitions</option>
              {uniqueWallets.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl text-white/75 appearance-none cursor-pointer"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", outline: "none" }}
          >
            <option value="">All statuses</option>
            <option value="unpaid">Outstanding</option>
            <option value="paid">Repaid</option>
          </select>
        </div>

        {/* Row 2: date range + actions */}
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl text-white/70 cursor-pointer"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", outline: "none", colorScheme: "dark" }}
          />
          <span className="text-white/30 text-xs">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl text-white/70 cursor-pointer"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", outline: "none", colorScheme: "dark" }}
          />
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-xs transition-colors">
              <FontAwesomeIcon icon={faXmark} />
              Clear
            </button>
          )}
          <div className="flex gap-2 ml-auto">
            <button onClick={downloadAsCSV} className="btn-ghost text-xs py-2 px-3">
              <FontAwesomeIcon icon={faDownload} className="text-brand-emerald" /> CSV
            </button>
            <button
              onClick={() => generatePDF("Borrows", `${formatDateTime(new Date())}-borrows`, ".printable-borrowed-area")}
              className="btn-ghost text-xs py-2 px-3"
            >
              <FontAwesomeIcon icon={faDownload} className="text-brand-emerald" /> PDF
            </button>
          </div>
        </div>
      </div>

      {!filtered.length && (
        <div className="glass text-center py-12 px-6">
          <div className="w-12 h-12 rounded-xl bg-brand-amber/10 flex items-center justify-center mx-auto mb-3">
            <FontAwesomeIcon icon={faHandHoldingDollar} className="text-brand-amber text-lg" />
          </div>
          <h3 className="text-white font-semibold mb-1">No borrows recorded</h3>
          <p className="text-white/40 text-sm">
            Use the Borrow action on a partition to track informal loans.
          </p>
        </div>
      )}

      {filtered.length > 0 && (
        <div
          className="rounded-2xl p-4 printable-borrowed-area"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <TransactionsTable data={borrows} head={tableHeadings} />
        </div>
      )}
    </div>
  );
}
