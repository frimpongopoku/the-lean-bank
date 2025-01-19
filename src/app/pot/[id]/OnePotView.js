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
  const { Modal, openModal } = useModal();
  const { pots } = usePots();

  const { params } = useParams();

  const targetPot = pots.find((pot) => pot.id?.toString() === potId);
  console.log("targetPot", targetPot);

  const edit = () => {
    openModal(<CreateOrEditPotForm />);
  };
  const addPartition = () => {
    openModal(<CreateOrEditPartition />);
  };

  if (!targetPot) return <Loading full />;

  //   ------------------- 1. Fallback -------------------

  if (!potId || !targetPot)
    return <Fallback message="Pot not found" backUrl="/home" />;

  //   ------------------- -------------------

  const { name, parts, balance } = targetPot;
  const tabs = [
    {
      label: "Partitions",
      icon: faWallet,
      content: <Partitions data={parts} />,
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

  const sumOfAllPartitionBalance = parts.reduce(
    (acc, part) => acc + part?.balance,
    0
  );
  const freeMoney = balance - sumOfAllPartitionBalance;

  const checkSumIsValid = sumOfAllPartitionBalance + freeMoney === balance;
  const freeMoneyIsInvalid = freeMoney < 0;

  console.log("checkSumIsValid", checkSumIsValid);

  //   console.log("partsSum", partsSum);

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
                  {balance?.toLocaleString()}
                  <FontAwesomeIcon
                    onClick={edit}
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
                <span>Valid</span>

                <span className="text-sm">Checksum</span>
              </p>
            </div>
          </div>

          {/* Add Partition */}
          <button
            onClick={addPartition}
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
