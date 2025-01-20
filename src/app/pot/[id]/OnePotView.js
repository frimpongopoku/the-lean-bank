"use client";
import React, { useCallback, useMemo } from "react";
import CenteredWrapper from "@/app/components/CenteredWrapper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWallet,
  faPlus,
  faEdit,
  faBook,
  faMoneyBillTransfer,
  faArrowAltCircleLeft,
  faArrowCircleLeft,
  faLongArrowAltLeft,
} from "@fortawesome/free-solid-svg-icons";
import Partitions from "./Partitions";
import Transactions from "./Transactions";
import Borrowed from "./Borrowed";
import { TabViewer } from "@/app/components/TabViewer";
import { useModal } from "./components/EBModal";
import Loading from "@/app/components/Loading";
import CreateOrEditPartition from "../forms/CreateOrEditPartition";
import CreateOrEditPotForm from "@/app/home/CreateOrEditPotForm";
import { useParams } from "next/navigation";
import { usePots } from "@/app/hooks/contexts/usePots";
import Fallback from "@/app/components/Fallback";
import FreeMoneySummary from "./components/FreeMoneySummary";
import ChecksumSummary from "./components/ChecksumSummary";
import {
  generateUniqueId,
  useTransactions,
} from "@/app/hooks/contexts/useTransactions";
import { useBorrow } from "@/app/hooks/contexts/useBorrow";
import AuthGuard from "@/app/auth/AuthGuard";

function OnePotView({ potId }) {
  const { Modal, openModal, closeModal } = useModal();
  const {
    pots,
    editPot,
    addPartToPot,
    updatePartInPot,
    removePartFromPot,
    updatePotWithDeposit,
    updatePotWithWithdrawal,
  } = usePots();

  const { transactions, addDeposit, addWithdrawal } = useTransactions();

  const { borrows, addBorrow, markAsPaid } = useBorrow();

  const targetPot = pots.find((pot) => pot.id?.toString() === potId);

  const editPotContent = () => {
    openModal(
      <CreateOrEditPotForm
        isEdit={targetPot}
        data={targetPot}
        onSubmit={(content) => {
          closeModal();
          editPot(content);
        }}
      />
    );
  };

  //  ------------------- 0. Loading -------------------
  if (!targetPot) return <Loading full />;

  //   ------------------- 1. IF Not Found -------------------

  if (!potId || !targetPot)
    return <Fallback message="Pot not found" backUrl="/home" />;

  //   ------------------- -------------------

  const { name, parts, balance } = targetPot;

  const sumOfAllPartitionBalance = useMemo(
    () => parts.reduce((acc, part) => acc + Number(part?.balance), 0),
    [targetPot, parts, balance]
  );

  const createOrEditPartition = (content) => {
    openModal(
      <CreateOrEditPartition
        mode={content?.id ? "edit" : "create"}
        data={content}
        onSubmit={(formData) => {
          closeModal();
          if (content)
            return updatePartInPot(targetPot?.id, { ...content, ...formData });
          addPartToPot(targetPot?.id, {
            ...formData,
            id: generateUniqueId(),
            date: new Date().toLocaleString(),
          });
        }}
      />
    );
  };

  const removePartition = (id) => {
    removePartFromPot(targetPot?.id, id);
  };
  // -------------------------------------------- Transactions & Borrowing Functions ----------------

  const createDeposit = (content, partition) => {
    // Add transaction
    addDeposit({ ...content, source: partition?.name });
    // Update partition balance
    const amount = Number(content?.amount);
    updatePotWithDeposit(targetPot?.id, partition?.id, amount);
  };

  const createWithdrawal = (content, partition) => {
    addWithdrawal({ ...content, source: partition?.name });
    // Update partition balance
    const amount = Number(content?.amount);
    updatePotWithWithdrawal(targetPot?.id, partition?.id, amount);
  };

  const doBorrow = (content, partition) => {
    addBorrow({ ...content, id: generateUniqueId("bor_") });
    // Update partition balance
    const amount = Number(content?.amount);
    // updatePotWithWithdrawal(targetPot?.id, partition?.id, amount);
    createWithdrawal(
      { description: `Borrowed: ${content?.description}`, amount },
      partition
    );
  };

  const payUpIntoSource = (partId, amount) => {
    // Update partition balance
    const partition = parts.find((part) => part.id === partId);
    createDeposit({ description: `Paid Up, after borrow!`, amount }, partition);
  };

  // -------------------------------------------------------------------------------------------

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
        />
      ),
    },
    {
      label: "Transactions",
      icon: faBook,
      content: <Transactions data={transactions} />,
    },
    {
      label: "Borrowed",
      icon: faMoneyBillTransfer,
      content: <Borrowed data={borrows} payUpIntoSource={payUpIntoSource} />,
    },
  ];
  // --------------------------------------------

  const freeMoney = balance - sumOfAllPartitionBalance;
  const freeMoneyIsInvalid = freeMoney < 0;
  const onlySumValidity =
    sumOfAllPartitionBalance + freeMoney === Number(balance);
  const checkSumIsValid = onlySumValidity && !freeMoneyIsInvalid;

  const summarizeFreeMoney = () => {
    openModal(
      <FreeMoneySummary freeMoney={freeMoney} isValid={!freeMoneyIsInvalid} />
    );
  };
  const summarizeChecksum = () => {
    openModal(
      <ChecksumSummary
        balance={balance}
        freeMoney={freeMoney}
        sumOfAllPartitionBalance={sumOfAllPartitionBalance}
        freeMoneyIsInvalid={freeMoneyIsInvalid}
        isValid={checkSumIsValid}
        onlySumValidity={onlySumValidity}
      />
    );
  };
  // --------------------------------------------------------------

  return (
    <AuthGuard signout>
      <CenteredWrapper>
        <Modal />
        <div className="w-full max-w-4xl p-4 md:p-8">
          {/* Header */}
          <div className="text-xl md:text-2xl font-bold mb-6 flex flex-col   ">
            <p className="text-gray-800 text-5xl mb-2 flex flex-row items-center">
              <FontAwesomeIcon
                onClick={() => router.push("/home")}
                icon={faLongArrowAltLeft}
                className="text-4xl mr-4 text-gray-600 hover:text-green-500 cursor-pointer"
              />
              {name || "..."}
            </p>
            <div className="my-4 bg-white border-green-600 flex flex-row items-center justify-between  shadow-md rounded-md mx-2 p-5">
              <div className="flex flex-row items-center">
                <p className="text-green-700 flex flex-col ml-2 text-3xl mr-2">
                  <span className="flex flex-row items-center">
                    {Number(balance)?.toLocaleString()}
                    <FontAwesomeIcon
                      onClick={editPotContent}
                      icon={faEdit}
                      className="ml-2 text-2xl text-green-700 hover:text-green-600 cursor-pointer"
                    />
                  </span>

                  <span className="text-sm">Actual Account Value</span>
                </p>
              </div>
              <div className="flex flex-row items-center mx-6">
                <p
                  className={`${
                    freeMoneyIsInvalid ? "text-red-500" : "text-cyan-600"
                  } flex flex-col ml-2 text-3xl mr-2  cursor-pointer`}
                >
                  <span
                    className="hover:underline"
                    onClick={summarizeFreeMoney}
                  >
                    {freeMoney?.toLocaleString()}
                  </span>

                  <span className="text-sm">
                    {freeMoneyIsInvalid
                      ? "You are owing!"
                      : "Unassigned (A.k.a Free Money)"}
                  </span>
                </p>
              </div>
              <div className="flex flex-row items-center  mx-6">
                <p
                  className={`${
                    checkSumIsValid ? "text-green-500" : "text-red-500"
                  } flex flex-col ml-2 text-3xl mr-2   cursor-pointer`}
                >
                  <span className="hover:underline" onClick={summarizeChecksum}>
                    {checkSumIsValid ? "Valid" : "Invalid"}
                  </span>

                  <span className="text-sm">Checksum</span>
                </p>
              </div>
            </div>

            {/* Add Partition */}
            <button
              onClick={() => createOrEditPartition()}
              className="mt-4 md:mt-0 inline-flex hover:text-green-600 hover:underline  items-center text-lg text-green-700"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2 h-5 w-5" />
              Add Partition
            </button>
          </div>

          {/* Tabs */}
          <TabViewer tabs={tabs} />
        </div>
      </CenteredWrapper>
    </AuthGuard>
  );
}

export default OnePotView;
