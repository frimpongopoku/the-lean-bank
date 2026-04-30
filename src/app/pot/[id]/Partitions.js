import {
  faEdit,
  faPlus,
  faTrash,
  faWallet,
  faArrowDown,
  faArrowUp,
  faHandHoldingDollar,
  faRightLeft,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { useModal } from "./components/EBModal";
import DepositForm from "../forms/DepositForm";
import SpendForm from "../forms/SpendForm";
import BorrowForm from "../forms/BorrowForm";
import WalletDeleteConfirmation from "./components/WalletDeleteConfirmation";
import { makeDate } from "@/app/lib/utils";
import MaskNumber from "@/app/components/MaskNumber";

function Partitions({
  data,
  pot,
  totalSum,
  editPartition,
  onRemove,
  createPartition,
  createDeposit,
  createWithdrawal,
  doBorrow,
  doTransfer,
}) {
  const { Modal, openModal, closeModal } = useModal();

  const deposit = (partition) => {
    openModal(
      <DepositForm
        onSubmit={(content) => { createDeposit(content, partition); closeModal(); }}
      />
    );
  };

  const spend = (partition) => {
    openModal(
      <SpendForm
        onSubmit={(content) => { createWithdrawal(content, partition); closeModal(); }}
      />
    );
  };

  const borrow = (partition) => {
    openModal(
      <BorrowForm
        onSubmit={(content) => {
          doBorrow(
            { ...content, source: partition?.name, source_id: partition?.id, paid: false, date: makeDate() },
            partition
          );
          closeModal();
        }}
      />
    );
  };

  const remove = (id) => {
    openModal(
      <WalletDeleteConfirmation
        onCancel={closeModal}
        onConfirm={() => { onRemove(id); closeModal(); }}
      />
    );
  };

  return (
    <div className="py-4">
      <Modal />

      {/* Summary row */}
      {totalSum > 0 && (
        <div className="flex items-center justify-between mb-4 px-1">
          <span className="text-white/40 text-xs uppercase tracking-wider font-semibold">
            Total allocated
          </span>
          <MaskNumber
            number={Number(totalSum)?.toLocaleString()}
            className="text-brand-emerald font-bold text-lg"
          />
        </div>
      )}

      {/* Empty state */}
      {!data?.length && (
        <div className="glass text-center py-12 px-6">
          <div className="w-12 h-12 rounded-xl bg-brand-violet/10 flex items-center justify-center mx-auto mb-3">
            <FontAwesomeIcon icon={faWallet} className="text-brand-violet text-lg" />
          </div>
          <h3 className="text-white font-semibold mb-1">No partitions yet</h3>
          <p className="text-white/40 text-sm mb-5">
            Slice your pot into purpose-built envelopes — savings, rent, fun money, anything.
          </p>
          <button onClick={createPartition} className="btn-primary text-sm">
            <FontAwesomeIcon icon={faPlus} />
            Create first partition
          </button>
        </div>
      )}

      {/* Partition cards */}
      <div className="space-y-3">
        {data?.map((partition) => (
          <PartitionCard
            key={partition.id}
            partition={partition}
            potBalance={pot?.balance}
            totalSum={totalSum}
            onDeposit={() => deposit(partition)}
            onSpend={() => spend(partition)}
            onBorrow={() => borrow(partition)}
            onTransfer={() => doTransfer && doTransfer(partition)}
            onRemove={() => remove(partition.id)}
            onEdit={() => editPartition(partition)}
          />
        ))}
      </div>
    </div>
  );
}

const PartitionCard = ({
  partition,
  potBalance,
  totalSum,
  onDeposit,
  onSpend,
  onBorrow,
  onTransfer,
  onRemove,
  onEdit,
}) => {
  const { name, balance, abbreviation } = partition;
  const pct =
    totalSum > 0
      ? Math.min((Number(balance) / totalSum) * 100, 100)
      : 0;

  return (
    <div
      className="rounded-2xl p-4 sm:p-5 transition-all duration-200"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.06)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.11)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Left: identity */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {abbreviation && (
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-brand-emerald flex-shrink-0"
              style={{ background: "rgba(16,185,129,0.1)" }}
            >
              {abbreviation.slice(0, 3)}
            </div>
          )}
          {!abbreviation && (
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <FontAwesomeIcon icon={faWallet} className="text-white/35 text-xs" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-white/90 font-semibold text-sm truncate">{name}</p>
              <button
                onClick={onEdit}
                aria-label="Edit partition"
                className="text-white/25 hover:text-brand-cyan transition-colors flex-shrink-0"
              >
                <FontAwesomeIcon icon={faEdit} className="text-xs" />
              </button>
            </div>
            <MaskNumber
              number={Number(balance)?.toLocaleString()}
              className="text-xl font-bold text-white"
            />
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Primary: Deposit */}
          <button
            onClick={onDeposit}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-brand-emerald transition-all duration-150"
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.18)" }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(16,185,129,0.18)";
              e.currentTarget.style.boxShadow = "0 0 16px rgba(16,185,129,0.2)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(16,185,129,0.1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <FontAwesomeIcon icon={faArrowDown} className="text-xs" />
            Deposit
          </button>

          {/* Primary: Spend */}
          <button
            onClick={onSpend}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-brand-rose transition-all duration-150"
            style={{ background: "rgba(244,63,94,0.09)", border: "1px solid rgba(244,63,94,0.18)" }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(244,63,94,0.17)";
              e.currentTarget.style.boxShadow = "0 0 16px rgba(244,63,94,0.18)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(244,63,94,0.09)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <FontAwesomeIcon icon={faArrowUp} className="text-xs" />
            Spend
          </button>

          {/* Secondary: Borrow */}
          <button
            onClick={onBorrow}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-brand-amber transition-all duration-150"
            style={{ background: "rgba(245,158,11,0.09)", border: "1px solid rgba(245,158,11,0.17)" }}
            onMouseOver={(e) => { e.currentTarget.style.background = "rgba(245,158,11,0.17)"; }}
            onMouseOut={(e) => { e.currentTarget.style.background = "rgba(245,158,11,0.09)"; }}
          >
            <FontAwesomeIcon icon={faHandHoldingDollar} className="text-xs" />
            Borrow
          </button>

          {/* Transfer */}
          <button
            onClick={onTransfer}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-brand-violet transition-all duration-150"
            style={{ background: "rgba(167,139,250,0.09)", border: "1px solid rgba(167,139,250,0.17)" }}
            onMouseOver={(e) => { e.currentTarget.style.background = "rgba(167,139,250,0.17)"; }}
            onMouseOut={(e) => { e.currentTarget.style.background = "rgba(167,139,250,0.09)"; }}
          >
            <FontAwesomeIcon icon={faRightLeft} className="text-xs" />
            Transfer
          </button>

          {/* Delete */}
          <button
            onClick={onRemove}
            aria-label="Delete partition"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white/20 hover:text-brand-rose hover:bg-brand-rose/10 transition-colors"
          >
            <FontAwesomeIcon icon={faTrash} className="text-xs" />
          </button>
        </div>
      </div>

      {/* Allocation bar */}
      {totalSum > 0 && (
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1.5 text-white/30">
            <span>{pct.toFixed(1)}% of total allocated</span>
          </div>
          <div className="alloc-bar-track">
            <div
              className="alloc-bar-fill"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg, #a78bfa, #22d3ee)",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Partitions;
