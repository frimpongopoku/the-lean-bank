"use client";
import React from "react";
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

function OnePotView({ potId }) {
  const { Modal, openModal, closeModal } = useModal();
  const { pots, editPot, addPartToPot, updatePartInPot, removePartFromPot } =
    usePots();

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

  if (!targetPot) return <Loading full />;

  //   ------------------- 1. Fallback -------------------

  if (!potId || !targetPot)
    return <Fallback message="Pot not found" backUrl="/home" />;

  //   ------------------- -------------------

  const { name, parts, balance } = targetPot;

  const sumOfAllPartitionBalance = parts.reduce(
    (acc, part) => acc + Number(part?.balance),
    0
  );

  const createOrEditPartition = (content) => {
    console.log("content", content);
    openModal(
      <CreateOrEditPartition
        mode={content ? "edit" : "create"}
        data={content}
        onSubmit={(formData) => {
          closeModal();
          if (content) return updatePartInPot(targetPot?.id, content);
          addPartToPot(targetPot?.id, formData);
        }}
      />
    );
  };

  const removePartition = (id) => {
    removePartFromPot(targetPot?.id, id);
  };

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
        />
      ),
    },
    {
      label: "Transactions",
      icon: faBook,
      content: <Transactions />,
    },
    {
      label: "Borrowed",
      icon: faMoneyBillTransfer,
      content: <Borrowed />,
    },
  ];
  // --------------------------------------------

  const freeMoney = balance - sumOfAllPartitionBalance;
  const checkSumIsValid = sumOfAllPartitionBalance + freeMoney === balance;
  const freeMoneyIsInvalid = freeMoney < 0;

  return (
    <CenteredWrapper>
      <Modal />
      <div className="w-full max-w-4xl p-4 md:p-8">
        {/* Header */}
        <div className="text-xl md:text-2xl font-bold mb-6 flex flex-col   ">
          <p className="text-gray-800 text-5xl mb-2 flex flex-row items-center">
            <FontAwesomeIcon
              onClick={() => router.back()}
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
                } flex flex-col ml-2 text-3xl mr-2"`}
              >
                <span>{freeMoney?.toLocaleString()}</span>

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
                } flex flex-col ml-2 text-3xl mr-2`}
              >
                <span>{checkSumIsValid ? "Valid" : "Invalid"}</span>

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
  );
}

export default OnePotView;
