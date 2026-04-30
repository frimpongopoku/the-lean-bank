import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload, faArrowDown, faArrowUp, faFilter, faMagnifyingGlass, faXmark,
} from "@fortawesome/free-solid-svg-icons";
import TransactionsTable from "./components/TransactionTable";
import "jspdf-autotable";
import { formatDateTime, generatePDF } from "@/app/lib/utils";
import { useState } from "react";
import { saveAs } from "file-saver";

export default function Transactions({ data, potId }) {
  const [selectedWallet, setSelectedWallet] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const renderType = (txn) => {
    const isDeposit = txn?.type === "Deposit";
    return (
      <span
        className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
        style={{
          color: isDeposit ? "#10b981" : "#f43f5e",
          background: isDeposit ? "rgba(16,185,129,0.1)" : "rgba(244,63,94,0.1)",
        }}
      >
        <FontAwesomeIcon icon={isDeposit ? faArrowDown : faArrowUp} className="text-xs" />
        {txn?.type}
      </span>
    );
  };

  const renderAmount = (txn) => {
    const isDeposit = txn?.type === "Deposit";
    return (
      <span className="font-bold tabular-nums text-sm" style={{ color: isDeposit ? "#10b981" : "#f43f5e" }}>
        {isDeposit ? "+" : "−"}{txn?.amount?.toLocaleString?.() ?? txn?.amount}
      </span>
    );
  };

  const transformToTableFormat = (transactions) =>
    transactions?.map((txn) => [
      { value: formatDateTime(txn.date) },
      { func: () => renderType(txn) },
      { func: () => renderAmount(txn) },
      { value: txn.source },
      { value: txn.description },
    ]);

  const potFiltered = (data?.filter((txn) => txn?.pot_id === potId) || []);

  const filtered = potFiltered
    .filter((txn) => (selectedWallet ? txn.source === selectedWallet : true))
    .filter((txn) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        txn.description?.toLowerCase().includes(q) ||
        txn.source?.toLowerCase().includes(q) ||
        txn.type?.toLowerCase().includes(q)
      );
    })
    .filter((txn) => (dateFrom ? new Date(txn.date) >= new Date(dateFrom) : true))
    .filter((txn) => (dateTo ? new Date(txn.date) <= new Date(dateTo + "T23:59:59") : true))
    .slice(0, 100);

  const transactions = transformToTableFormat(filtered);
  const tableHeadings = ["Date", "Type", "Amount", "Source", "Description"];
  const uniqueWallets = [...new Set(potFiltered.map((txn) => txn.source).filter(Boolean))];

  const totalDeposits = filtered.filter((t) => t.type === "Deposit").reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const totalWithdrawals = filtered.filter((t) => t.type !== "Deposit").reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const hasFilters = selectedWallet || search || dateFrom || dateTo;

  const clearFilters = () => {
    setSelectedWallet("");
    setSearch("");
    setDateFrom("");
    setDateTo("");
  };

  const downloadAsCSV = () => {
    const csvContent = [
      ["Date", "Type", "Amount", "Source", "Description"],
      ...filtered.map((txn) => [
        formatDateTime(txn.date), txn.type, txn.amount, txn.source, txn.description,
      ]),
    ].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${formatDateTime(new Date())}-transactions.csv`);
  };

  return (
    <div className="py-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="glass-sm p-3.5">
          <p className="text-white/40 text-xs mb-1.5 uppercase tracking-wider font-semibold">Total In</p>
          <p className="text-brand-emerald font-bold text-xl tabular-nums">+{totalDeposits.toLocaleString()}</p>
        </div>
        <div className="glass-sm p-3.5">
          <p className="text-white/40 text-xs mb-1.5 uppercase tracking-wider font-semibold">Total Out</p>
          <p className="text-brand-rose font-bold text-xl tabular-nums">−{totalWithdrawals.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-2 mb-5">
        {/* Row 1: search + partition filter */}
        <div className="flex flex-wrap gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs pointer-events-none" />
            <input
              type="text"
              placeholder="Search description, source…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 text-sm rounded-xl text-white/80 w-full"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", outline: "none" }}
            />
          </div>
          {/* Partition filter */}
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
            <button onClick={() => generatePDF("Transactions", `${formatDateTime(new Date())}-transactions`)} className="btn-ghost text-xs py-2 px-3">
              <FontAwesomeIcon icon={faDownload} className="text-brand-emerald" /> PDF
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 100 && (
        <p className="text-white/30 text-xs mb-3">Showing 100 most recent. Download for full history.</p>
      )}

      <div className="rounded-2xl p-4 printable-area" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <TransactionsTable data={transactions} head={tableHeadings} />
      </div>
    </div>
  );
}
