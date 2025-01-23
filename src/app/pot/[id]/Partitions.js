import {
  faBook,
  faDeleteLeft,
  faEdit,
  faPlus,
  faRemove,
  faTrash,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { useModal } from "./components/EBModal";
import DepositForm from "../forms/DepositForm";
import SpendForm from "../forms/SpendForm";
import BorrowForm from "../forms/BorrowForm";
import WalletDeleteConfirmation from "./components/WalletDeleteConfirmation";
import { usePots } from "@/app/hooks/contexts/usePots";
import { useTransactions } from "@/app/hooks/contexts/useTransactions";
import { makeDate } from "@/app/lib/utils";
import MaskNumber from "@/app/components/MaskNumber";
function Partitions({
  data,
  totalSum,
  targetPot,
  editPartition,
  onRemove,
  createPartition,
  createDeposit,
  createWithdrawal,
  doBorrow,
}) {
  const { Modal, openModal, closeModal } = useModal();

  const deposit = (partition) => {
    openModal(
      <DepositForm
        onSubmit={(content) => {
          createDeposit(content, partition);
          closeModal();
        }}
      />
    );
  };
  const spend = (partition) => {
    openModal(
      <SpendForm
        onSubmit={(content) => {
          createWithdrawal(content, partition);
          closeModal();
        }}
      />
    );
  };
  const borrow = (partition) => {
    openModal(
      <BorrowForm
        onSubmit={(content) => {
          doBorrow(
            {
              ...content,
              source: partition?.name,
              source_id: partition?.id,
              paid: false,
              date: makeDate(),
            },
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
        onCancel={() => closeModal()}
        onConfirm={() => {
          onRemove(id);
          closeModal();
        }}
      />
    );
  };

  return (
    <div className="py-6">
      {totalSum ? (
        <p className="mb-2 flex flex-row items-center">
          <span>Total</span>{" "}
          <span className="ml-2 font-bold text-lg text-green-800">
            <MaskNumber number={Number(totalSum)?.toLocaleString()} />
          </span>
        </p>
      ) : (
        ""
      )}
      {!data?.length && (
        <p className="text-gray-600 mb-4 text-center text-lg">
          No partitions yet,{" "}
          <span
            onClick={() => createPartition()}
            className="text-green-700 font-bold cursor-pointer hover:underline "
          >
            {" "}
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            start slicing!
          </span>
        </p>
      )}
      <Modal />
      {data?.map((partition, index) => (
        <Card
          deposit={() => deposit(partition)}
          spend={() => spend(partition)}
          borrow={() => borrow(partition)}
          remove={() => remove(partition.id)}
          key={index}
          editFxn={() => editPartition(partition)}
          {...partition}
        />
      ))}
    </div>
  );
}

const Card = ({
  name,
  balance,
  description,
  deposit,
  spend,
  borrow,
  remove,
  editFxn,
}) => {
  return (
    <div className="mt-2 flex flex-col md:flex-row md:items-center justify-between bg-white p-6  rounded-md shadow-sm border border-gray-200">
      <div className="flex flex-row items-center ">
        <div>
          <div className="text-md text-gray-700 font-bold">{name}</div>
          <div className="flex flex-row text-2xl items-center font-bold text-green-500">
            <span className="flex flex-row items-center">
              <FontAwesomeIcon
                icon={faWallet}
                className="text-green-500 text-2xl mr-3"
              />
              <MaskNumber number={Number(balance)?.toLocaleString()} />
            </span>
            <FontAwesomeIcon
              onClick={editFxn}
              icon={faEdit}
              className="text-green-500 hover:text-green-700 h-5 w-5 cursor-pointer ml-2 md:mt-0"
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row font-bold md:items-center gap-4 text-sm">
        <button className="text-blue-400">
          {" "}
          <FontAwesomeIcon
            icon={faBook}
            className=" text-xl hover:text-blue-500 hover:scale-125 cursor-pointer ml-2 md:mt-0"
          />
        </button>
        <button className="text-red-400">
          {" "}
          <FontAwesomeIcon
            onClick={remove}
            icon={faTrash}
            className=" text-xl hover:text-red-500 hover:scale-125  cursor-pointer ml-2 md:mt-0"
          />
        </button>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 ">
        <button
          onClick={borrow}
          className="underline flex-1 text-orange-500 hover:text-orange-600 font-bold  text-sm px-3 py-1 rounded"
        >
          Borrow
        </button>
        <button
          onClick={spend}
          className="flex-1 border font-semibold hover:bg-red-500 hover:text-white border-red-500 text-sm text-red-500  px-3 py-1 rounded"
        >
          Spend
        </button>
        <button
          onClick={deposit}
          className="flex-1 font-bold bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded"
        >
          Deposit
        </button>
      </div>
    </div>
  );
};
export default Partitions;
