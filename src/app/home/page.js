import { faWallet } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import CenteredWrapper from "../components/CenteredWrapper";

const banks = [
  { id: 1, name: "GCB Ghana Cedi", balance: "GHS 14,500" },
  { id: 2, name: "First Atlantic USD", balance: "GHS 14,500" },
];

const Home = () => {
  return (
    <CenteredWrapper>
      <h1 className="text-6xl font-bold mb-4 text-center">Banks</h1>
      <p className="text-gray-600 mb-6 text-center">
        Manage your bank accounts here
      </p>

      <div className="flex justify-center mb-6">
        <button className="bg-green-500 text-white px-4 py-2 rounded">
          Add a New Bank
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {banks.map((bank) => (
          <div
            key={bank.id}
            className="border border-green-500 rounded p-4 flex flex-col justify-between bg-white shadow-sm"
          >
            <h2 className=" font-semibold mb-2 text-lg">{bank.name}</h2>
            <p className="text-green-500 font-bold mb-4 text-3xl">
              {bank.balance}
            </p>
            <FontAwesomeIcon
              icon={faWallet}
              className="text-green-500 w-8 h-8"
            />
            {/* <button className="text-red-500">Remove</button> */}
          </div>
        ))}

        <div className="border border-gray-300 rounded p-4 flex flex-col items-center justify-center text-gray-400 cursor-pointer bg-white shadow-sm">
          <span className="text-4xl">+</span>
        </div>
      </div>
    </CenteredWrapper>
  );
};

export default Home;
