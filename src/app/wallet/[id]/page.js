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
} from "@fortawesome/free-solid-svg-icons";
import Partitions from "./Partitions";
import Transactions from "./Transactions";
import Borrowed from "./Borrowed";
import { TabViewer } from "@/app/components/TabViewer";
import { useModal } from "./components/EBModal";
import Loading from "@/app/components/Loading";
import CreateOrEditPartition from "../forms/CreateOrEditPartition";
import CreateOrEditPotForm from "@/app/home/CreateOrEditPotForm";

function WalletService() {
  const { Modal, openModal } = useModal();
  const tabs = [
    {
      label: "Partitions",
      icon: faWallet,
      content: <Partitions />,
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

  const edit = () => {
    openModal(<CreateOrEditPotForm />);
  };
  const addPartition = () => {
    openModal(<CreateOrEditPartition />);
  };

  return (
    <CenteredWrapper>
      <Modal />
      <div className="w-full max-w-4xl p-4 md:p-8">
        {/* Header */}
        <div className="text-xl md:text-2xl font-bold mb-6 flex flex-col   ">
          <p className="text-gray-800 text-6xl mb-2">GCB Ghana Cedi</p>
          <div className="flex flex-row items-center">
            <p className="text-green-500 ml-2 text-4xl mr-2">GHS 12,456</p>
            <FontAwesomeIcon
              onClick={edit}
              icon={faEdit}
              className="ml-2 h-5 w-5 text-green-500 hover:text-green-600 cursor-pointer"
            />
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

export default WalletService;
