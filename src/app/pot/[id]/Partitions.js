import {
  faBook,
  faDeleteLeft,
  faEdit,
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
function Partitions({ data }) {
  const { Modal, openModal } = useModal();
  // const partitions = [
  //   {
  //     title: "Long Term Funds",
  //     amount: "GHS 10,456",
  //     description: "Long Term Funds",
  //   },
  //   {
  //     title: "Short Term Funds",
  //     amount: "GHS 10,456",
  //     description: "Short Term Funds",
  //   },
  //   {
  //     title: "Savings",
  //     amount: "GHS 10,456",
  //     description: "Savings",
  //   },
  // ];

  const deposit = () => {
    openModal(<DepositForm />);
  };
  const spend = () => {
    openModal(<SpendForm />);
  };
  const borrow = () => {
    openModal(<BorrowForm />);
  };

  const remove = () => {
    openModal(<WalletDeleteConfirmation />);
  };
  return (
    <div className="py-6">
      <Modal />
      {data?.map((partition, index) => (
        <Card
          deposit={deposit}
          spend={spend}
          borrow={borrow}
          remove={remove}
          key={index}
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
              {balance?.toLocaleString()}
            </span>
            <FontAwesomeIcon
              icon={faEdit}
              className="text-green-500 h-5 w-5 cursor-pointer ml-2 md:mt-0"
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
