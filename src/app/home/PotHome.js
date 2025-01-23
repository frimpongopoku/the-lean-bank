"use client";
import {
  faEdit,
  faExternalLink,
  faPlus,
  faTrash,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import CenteredWrapper from "../components/CenteredWrapper";
import { useModal } from "../pot/[id]/components/EBModal";
import CreateOrEditPotForm from "./CreateOrEditPotForm";
import { PotsProvider, usePots } from "../hooks/contexts/usePots";
import ConfirmPotDeletion from "./ConfirmPotDeletion";
import AuthGuard from "../auth/AuthGuard";
import { UNDEFINED, useAuth } from "../auth/context/AuthContext";
import { getAllPots, NOT_FOUND } from "../auth/utils/firestore-utils";
import { generateUniqueId } from "../hooks/contexts/useTransactions";
import { makeDate } from "../lib/utils";
import Loading from "../components/Loading";
import MaskNumber from "../components/MaskNumber";
import { useRouter } from "next/navigation";
import Image from "next/image";
import image from "./../images/pnb2.webp";
import LogoArea from "../components/LogoArea";
const PotHome = () => {
  const { Modal, openModal, closeModal } = useModal();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { potData, addPot, editPot, removePot, setPotData } = usePots();

  const pots = potData?.pots;

  const createOrEditPot = (pot) => {
    openModal(
      <CreateOrEditPotForm
        isEdit={pot?.id}
        data={pot}
        onSubmit={(content) => {
          closeModal();
          if (pot) return editPot({ ...pot, ...content });
          addPot({
            ...content,
            id: generateUniqueId("pot_"),
            createdAt: makeDate(),
            user_id: user?.uid,
          });
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

  const navigateToPot = (id) => {
    window.open(`/pot/${id}?c=${user?.uid}`, "_blank");
  };

  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);
    getAllPots(user?.uid).then((response) => {
      setLoading(false);
      if (response === NOT_FOUND) return router.push("/init");
      setPotData(response);
    });
  }, [user?.uid]);

  if (potData?.key === UNDEFINED)
    return <Loading full message="fetching content..." />;

  const noPots = !pots?.length;

  return (
    <AuthGuard signout>
      <CenteredWrapper>
        <Modal />
        <LogoArea />
        <h1 className="text-6xl font-bold mb-4 text-center">Pots</h1>
        <p className="text-gray-600 mb-6 text-center text-lg">
          <span className="text-xl">👋</span> Hello{" "}
          <b className="text-green-600">{user?.displayName || ""}</b>
        </p>

        <p className="text-gray-600 mb-6 text-center">
          Manage your pots here! Create, edit, or delete pots. "Pot" can be
          anything you want it to be!
        </p>

        <div className="flex justify-center mb-6">
          {/* <button
            onClick={() => initUserCollection(user.uid)}
            className="font-bold hover:bg-green-700 bg-green-600 text-white px-4 py-2 rounded"
          >
            Setup Collection
          </button> */}
          {loading ? (
            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
          ) : (
            <button
              onClick={() => createOrEditPot()}
              className="font-bold hover:bg-green-700 bg-green-600 text-white px-4 py-2 rounded"
            >
              Add a New Pot
            </button>
          )}
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
                // onClick={() => navigateToPot(bank.id)}
                className="text-green-600  group-hover:text-green-50 font-bold mb-4 text-3xl"
              >
                <MaskNumber
                  className={"group-hover:text-white"}
                  number={Number(bank.balance)?.toLocaleString()}
                />
                {/* {Number(bank.balance)?.toLocaleString()} */}
              </p>
              <div className="flex flex-row items-center">
                <span
                  onClick={() => navigateToPot(bank.id)}
                  className="ml-1 font-bold group-hover:text-white text-sm hover:underline text-green-600"
                >
                  <FontAwesomeIcon
                    icon={faExternalLink}
                    className="text-green-600 group-hover:text-white text-sm mr-1"
                  />
                  Manage
                  {/* <FontAwesomeIcon icon={faExternalLink} className="  w-7 h-7" /> */}
                </span>
                <span
                  onClick={() => createOrEditPot(bank)}
                  className="ml-3 font-bold group-hover:text-white text-sm hover:underline text-cyan-600"
                >
                  <FontAwesomeIcon icon={faEdit} className="  text-sm mr-1" />
                  Edit
                </span>
                <span
                  onClick={() => handleDelete(bank)}
                  className="ml-auto font-bold group-hover:text-white text-md hover:scale-125 text-red-200"
                >
                  <FontAwesomeIcon icon={faTrash} className="  text-lg" />
                  {/* <span>Remove</span>{" "} */}
                </span>
              </div>
            </div>
          ))}

          {!noPots && (
            <div
              onClick={() => createOrEditPot()}
              className="border group hover:border-2 hover:border-green-500 border-gray-300 rounded p-4 flex flex-col items-center justify-center text-gray-400 cursor-pointer shadow-sm"
            >
              {/* <span className="text-4xl">+</span> */}
              <FontAwesomeIcon
                icon={faPlus}
                className="text-4xl text-gray-300 group-hover:text-green-500"
              />
            </div>
          )}
        </div>
      </CenteredWrapper>
    </AuthGuard>
  );
};

export default PotHome;
