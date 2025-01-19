"use client";
import {
  faEdit,
  faExternalLink,
  faPlus,
  faTrash,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import CenteredWrapper from "../components/CenteredWrapper";
import { useModal } from "../pot/[id]/components/EBModal";
import CreateOrEditPotForm from "./CreateOrEditPotForm";
import { PotsProvider, usePots } from "../hooks/contexts/usePots";
import ConfirmPotDeletion from "./ConfirmPotDeletion";

// const banks = [
//   { id: 1, name: "GCB Ghana Cedi", balance: "14,500" },
//   { id: 2, name: "First Atlantic USD", balance: "14,500" },
// ];

const PotHome = () => {
  const { Modal, openModal, closeModal } = useModal();

  const { pots, addPot, editPot, removePot } = usePots();

  const createOrEditPot = (pot) => {
    openModal(
      <CreateOrEditPotForm
        isEdit={pot}
        data={pot}
        onSubmit={(content) => {
          closeModal();
          if (pot) return editPot(content);
          addPot(content);
        }}
      />
    );
  };

  const handleDelete = (pot) => {
    openModal(
      <ConfirmPotDeletion
        onConfirm={() => {
          removePot(pot?.id);
          closeModal();
        }}
        pot={pot}
        onCancel={closeModal}
      />
    );
  };

  // const deletePot = (id) => {
  //   console.log("Deleting pot with id", id);
  // };

  const navigateToPot = (id) => {
    window.open(`/pot/${id}`, "_blank");
  };

  // if (!pots?.length)
  //   return (
  //     <div className="text-center text-gray-500 mt-8">
  //       <p className="text-lg">
  //         No pots yet. Start by creating your first pot!
  //       </p>
  //       <FontAwesomeIcon
  //         icon={faPlus}
  //         className="text-4xl mt-4 text-gray-300"
  //       />
  //     </div>
  //   );

  const noPots = !pots?.length;
  return (
    <CenteredWrapper>
      <Modal />
      <h1 className="text-6xl font-bold mb-4 text-center">Pots</h1>
      <p className="text-gray-600 mb-6 text-center">
        Manage your pots here! Create, edit, or delete pots. "Pot" can be
        anything you want it to be!
      </p>

      <div className="flex justify-center mb-6">
        <button
          onClick={createOrEditPot}
          className="font-bold hover:bg-green-600 bg-green-500 text-white px-4 py-2 rounded"
        >
          Add a New Pot
        </button>
      </div>
      {noPots && (
        <div className="text-center text-gray-500 mt-8 mb-2">
          <p className="text-lg">
            No pots yet. Start by creating your first pot!
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pots?.map((bank) => (
          <div
            key={bank.id}
            className="shadow-md group hover:bg-green-600 cursor-pointer border-green-500 rounded p-4 flex flex-col justify-between bg-white"
          >
            <h2 className=" group-hover:text-white font-semibold mb-2 text-lmd">
              {bank.name}
            </h2>
            <p
              onClick={() => navigateToPot(bank.id)}
              className="text-green-500 hover:underline group-hover:text-green-50 font-bold mb-4 text-3xl"
            >
              {Number(bank.balance)?.toLocaleString()}
            </p>
            <div className="flex flex-row items-center">
              <span
                onClick={() => navigateToPot(bank.id)}
                className="ml-1 font-bold group-hover:text-white text-sm hover:underline text-green-500"
              >
                <FontAwesomeIcon
                  icon={faExternalLink}
                  className="text-green-500 group-hover:text-white w-5 h-5"
                />
                Manage
                {/* <FontAwesomeIcon icon={faExternalLink} className="  w-7 h-7" /> */}
              </span>
              <span
                onClick={() => createOrEditPot(bank)}
                className="ml-3 font-bold group-hover:text-white text-sm hover:underline text-cyan-600"
              >
                <FontAwesomeIcon icon={faEdit} className="  w-5 h-5" />
                Edit
              </span>
              <span
                onClick={() => handleDelete(bank)}
                className="ml-auto font-bold group-hover:text-white text-md hover:scale-125 text-red-200"
              >
                <FontAwesomeIcon icon={faTrash} className="  w-7 h-7" />
                {/* <span>Remove</span>{" "} */}
              </span>
            </div>
          </div>
        ))}

        {!noPots && (
          <div className="border group hover:border-2 hover:border-green-500 border-gray-300 rounded p-4 flex flex-col items-center justify-center text-gray-400 cursor-pointer shadow-sm">
            {/* <span className="text-4xl">+</span> */}
            <FontAwesomeIcon
              icon={faPlus}
              className="text-4xl text-gray-300 group-hover:text-green-500"
            />
          </div>
        )}
      </div>
    </CenteredWrapper>
  );
};

export default PotHome;
