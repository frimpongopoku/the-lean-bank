"use client";
import React, { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWallet, faBook, faMoneyBillTransfer, faArrowLeft,
  faEdit, faPlus, faCircleCheck, faCircleXmark, faUnlock,
} from "@fortawesome/free-solid-svg-icons";
import Partitions from "./Partitions";
import Transactions from "./Transactions";
import Borrowed from "./Borrowed";
import { TabViewer } from "@/app/components/TabViewer";
import { useModal } from "./components/EBModal";
import Loading from "@/app/components/Loading";
import CreateOrEditPartition from "../forms/CreateOrEditPartition";
import CreateOrEditPotForm from "@/app/home/CreateOrEditPotForm";
import TransferForm from "../forms/TransferForm";
import { useRouter } from "next/navigation";
import { usePots } from "@/app/hooks/contexts/usePots";
import Fallback from "@/app/components/Fallback";
import FreeMoneySummary from "./components/FreeMoneySummary";
import ChecksumSummary from "./components/ChecksumSummary";
import { generateUniqueId, useTransactions } from "@/app/hooks/contexts/useTransactions";
import { useBorrow } from "@/app/hooks/contexts/useBorrow";
import AuthGuard from "@/app/auth/AuthGuard";
import { makeDate } from "@/app/lib/utils";
import { UNDEFINED, useAuth } from "@/app/auth/context/AuthContext";
import { getUserCollection } from "@/app/auth/utils/firestore-utils";
import MaskNumber from "@/app/components/MaskNumber";
import { useToast } from "@/app/components/ToastProvider";

function OnePotView({ potId, userId }) {
  const { Modal, openModal, closeModal } = useModal();
  const [notFound, setNotFound] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const {
    potData, setPotData, editPot, addPartToPot, updatePartInPot,
    removePartFromPot, updatePotWithDeposit, updatePotWithWithdrawal,
    transferBetweenPartitions,
  } = usePots();

  const { transactions, addDeposit, addWithdrawal, setTransactions } = useTransactions();
  const { borrows, addBorrow, setBorrows } = useBorrow();

  const pots = potData?.pots || [];
  const targetPot = useMemo(
    () => pots.find((p) => p.id?.toString() === potId),
    [pots, potId]
  );

  useEffect(() => {
    getUserCollection(userId).then((data) => {
      if (!data) return setNotFound(true);
      const { TRANSACTIONS, POTS, BORROWED } = data;
      setPotData(POTS);
      setTransactions(TRANSACTIONS);
      setBorrows(BORROWED);
    });
  }, [userId]);

  useEffect(() => {
    if (targetPot?.name) document.title = `${targetPot.name} | The Lean Bank`;
  }, [targetPot?.name]);

  const { name, parts, balance } = targetPot || {};

  const sumOfAllPartitionBalance = useMemo(
    () => (parts || []).reduce((acc, p) => acc + Number(p?.balance), 0),
    [parts]
  );

  if (potData?.key === UNDEFINED) return <Loading full />;
  if (notFound) return <Fallback message="Pot not found" backUrl="/home" />;

  // ── Pot edit ──
  const editPotContent = () => {
    openModal(
      <CreateOrEditPotForm
        isEdit={targetPot}
        data={targetPot}
        onSubmit={(content) => {
          closeModal();
          const oldBalance = Number(targetPot.balance);
          const newBalance = Number(content.balance);
          editPot(content);
          if (newBalance !== oldBalance) {
            const diff = newBalance - oldBalance;
            const isIncrease = diff > 0;
            const fn = isIncrease ? addDeposit : addWithdrawal;
            fn({
              description: "Manual balance adjustment",
              amount: Math.abs(diff),
              source: "Adjustment",
              pot_id: targetPot.id,
              part_id: null,
            });
            toast.success(
              `Balance ${isIncrease ? "increased" : "decreased"} by ${Math.abs(diff).toLocaleString()} — adjustment recorded`
            );
          } else {
            toast.success("Pot updated");
          }
        }}
      />
    );
  };

  // ── Partitions ──
  const createOrEditPartition = (content) => {
    openModal(
      <CreateOrEditPartition
        mode={content?.id ? "edit" : "create"}
        data={content}
        onSubmit={(formData) => {
          closeModal();
          if (content) {
            updatePartInPot(targetPot?.id, { ...content, ...formData });
            toast.success(`"${formData.name || content.name}" updated`);
          } else {
            addPartToPot(targetPot?.id, {
              ...formData,
              id: generateUniqueId("prt_"),
              date: makeDate(),
              pot_id: targetPot?.id,
            });
            toast.success(`"${formData.name}" created`);
          }
        }}
      />
    );
  };

  const removePartition = (id) => {
    const part = (parts || []).find((p) => p.id === id);
    removePartFromPot(targetPot?.id, id);
    // MF-09: undo within 5 seconds
    toast.success(`"${part?.name}" removed`, {
      duration: 5000,
      undo: () => {
        addPartToPot(targetPot?.id, part);
        toast.info(`"${part?.name}" restored`);
      },
    });
  };

  // ── Transactions ──
  const createDeposit = (content, partition) => {
    addDeposit({ ...content, source: partition?.name, pot_id: targetPot?.id, part_id: partition?.id });
    updatePotWithDeposit(targetPot?.id, partition?.id, Number(content?.amount));
    toast.success(`+${Number(content.amount).toLocaleString()} deposited to ${partition?.name}`);
  };

  const createWithdrawal = (content, partition) => {
    addWithdrawal({ ...content, source: partition?.name, pot_id: targetPot?.id, part_id: partition?.id });
    updatePotWithWithdrawal(targetPot?.id, partition?.id, Number(content?.amount));
    toast.success(`−${Number(content.amount).toLocaleString()} spent from ${partition?.name}`);
  };

  const doBorrow = (content, partition) => {
    addBorrow({ ...content, id: generateUniqueId("bor_"), pot_id: targetPot?.id, part_id: partition?.id });
    // create withdrawal without toast (the borrow toast covers it)
    addWithdrawal({
      description: `Borrowed: ${content?.description}`,
      amount: Number(content?.amount),
      source: partition?.name,
      pot_id: targetPot?.id,
      part_id: partition?.id,
    });
    updatePotWithWithdrawal(targetPot?.id, partition?.id, Number(content?.amount));
    toast.info(`Borrow of ${Number(content.amount).toLocaleString()} recorded from ${partition?.name}`);
  };

  // MF-06: Transfer between partitions
  const doTransfer = (formData, fromPartition) => {
    const amount = Number(formData.amount);
    const toPartition = (parts || []).find((p) => p.id === formData.toPartId);
    if (!toPartition || !amount) return;

    transferBetweenPartitions(targetPot?.id, fromPartition?.id, toPartition?.id, amount);

    addWithdrawal({
      description: `Transfer → ${toPartition.name}${formData.description ? ": " + formData.description : ""}`,
      amount,
      source: fromPartition.name,
      pot_id: targetPot?.id,
      part_id: fromPartition.id,
    });
    addDeposit({
      description: `Transfer ← ${fromPartition.name}${formData.description ? ": " + formData.description : ""}`,
      amount,
      source: toPartition.name,
      pot_id: targetPot?.id,
      part_id: toPartition.id,
    });

    toast.success(`${amount.toLocaleString()} transferred from ${fromPartition.name} to ${toPartition.name}`);
  };

  const payUpIntoSource = (partId, amount) => {
    const partition = (parts || []).find((p) => p.id === partId);
    createDeposit({ description: "Borrow repaid", amount }, partition);
  };

  // ── Financials ──
  const freeMoney = balance - sumOfAllPartitionBalance;
  const freeMoneyIsInvalid = freeMoney < 0;
  const onlySumValidity = sumOfAllPartitionBalance + freeMoney === Number(balance);
  const checkSumIsValid = onlySumValidity && !freeMoneyIsInvalid;

  const tabs = [
    {
      label: "Partitions",
      icon: faWallet,
      content: (
        <Partitions
          data={parts}
          pot={targetPot}
          totalSum={sumOfAllPartitionBalance}
          editPartition={createOrEditPartition}
          createPartition={createOrEditPartition}
          onRemove={removePartition}
          createDeposit={createDeposit}
          createWithdrawal={createWithdrawal}
          doBorrow={doBorrow}
          doTransfer={(partition) =>
            openModal(
              <TransferForm
                fromPartition={partition}
                allPartitions={parts}
                onSubmit={(formData) => { closeModal(); doTransfer(formData, partition); }}
              />
            )
          }
        />
      ),
    },
    {
      label: "Transactions",
      icon: faBook,
      content: <Transactions potId={targetPot?.id} data={transactions || []} />,
    },
    {
      label: "Borrowed",
      icon: faMoneyBillTransfer,
      content: (
        <Borrowed data={borrows || []} potId={targetPot?.id} payUpIntoSource={payUpIntoSource} />
      ),
    },
  ];

  return (
    <AuthGuard signout>
      <Modal />
      <div className="min-h-screen px-4 sm:px-6 py-8 max-w-5xl mx-auto">

        {/* ── Back + title ── */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push("/home")}
            aria-label="Back to dashboard"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/45 hover:text-white transition-colors"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-sm" />
          </button>
          <h1 className="text-2xl font-bold text-white">{name || "…"}</h1>
        </div>

        {/* ── Metric cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {/* Balance */}
          <div className="glass-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white/40 text-xs uppercase tracking-wider font-semibold">Account Balance</p>
              <button
                onClick={editPotContent}
                aria-label="Edit pot"
                className="w-6 h-6 rounded-md flex items-center justify-center text-white/30 hover:text-brand-emerald hover:bg-brand-emerald/10 transition-colors"
              >
                <FontAwesomeIcon icon={faEdit} className="text-xs" />
              </button>
            </div>
            <MaskNumber number={Number(balance)?.toLocaleString()} className="text-2xl font-bold text-white" />
          </div>

          {/* Free money */}
          <button
            onClick={() => openModal(<FreeMoneySummary freeMoney={freeMoney} isValid={!freeMoneyIsInvalid} />)}
            className="glass-sm p-4 text-left w-full transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-white/40 text-xs uppercase tracking-wider font-semibold">Free Money</p>
              <FontAwesomeIcon icon={faUnlock} className={`text-xs ${freeMoneyIsInvalid ? "text-brand-rose" : "text-brand-cyan"}`} />
            </div>
            <p className={`text-2xl font-bold tabular-nums ${freeMoneyIsInvalid ? "text-brand-rose" : "text-brand-cyan"}`}>
              {freeMoney?.toLocaleString()}
            </p>
            {freeMoneyIsInvalid && <p className="text-brand-rose text-xs mt-1 font-medium">Over-allocated</p>}
          </button>

          {/* Checksum */}
          <button
            onClick={() => openModal(
              <ChecksumSummary
                balance={balance}
                freeMoney={freeMoney}
                sumOfAllPartitionBalance={sumOfAllPartitionBalance}
                freeMoneyIsInvalid={freeMoneyIsInvalid}
                isValid={checkSumIsValid}
                onlySumValidity={onlySumValidity}
              />
            )}
            className="glass-sm p-4 text-left w-full transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-white/40 text-xs uppercase tracking-wider font-semibold">Checksum</p>
              <FontAwesomeIcon
                icon={checkSumIsValid ? faCircleCheck : faCircleXmark}
                className={`text-sm ${checkSumIsValid ? "text-brand-emerald" : "text-brand-rose"}`}
              />
            </div>
            <p className={`text-2xl font-bold ${checkSumIsValid ? "text-brand-emerald" : "text-brand-rose"}`}>
              {checkSumIsValid ? "Valid" : "Invalid"}
            </p>
            <p className="text-white/30 text-xs mt-1">
              {checkSumIsValid ? "All allocations balance" : "Tap to see details"}
            </p>
          </button>
        </div>

        {/* ── Add partition ── */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-white/35 text-sm">
            {(parts || []).length} partition{(parts || []).length !== 1 ? "s" : ""}
          </p>
          <button onClick={() => createOrEditPartition()} className="btn-ghost text-sm">
            <FontAwesomeIcon icon={faPlus} className="text-brand-emerald" />
            Add Partition
          </button>
        </div>

        <TabViewer tabs={tabs} />
      </div>
    </AuthGuard>
  );
}

export default OnePotView;
