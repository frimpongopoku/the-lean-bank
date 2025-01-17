import { faEdit, faWallet } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
function Partitions() {
  return (
    <div className="py-6">
      <div className="bg-white p-6  rounded-md shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between ">
          {/* Wallet Details */}
          <div className="flex flex-row items-center ">
            <FontAwesomeIcon
              icon={faWallet}
              className="text-green-500 h-10 w-10 mr-3"
            />
            <div>
              <div className="flex flex-row text-2xl items-center font-bold text-green-500">
                <span>GHS 10,456</span>
                <FontAwesomeIcon
                  icon={faEdit}
                  className="text-green-500 h-5 w-5 cursor-pointer ml-2 md:mt-0"
                />
              </div>
              <div className="text-sm text-gray-700 font-bold">
                Long Term Funds
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row font-bold md:items-center gap-4 text-sm">
            <button className="text-blue-500">Transactions</button>
            <button className="text-red-500">Remove</button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 ">
            <button className="flex-1 bg-orange-500 text-white px-4 py-2 rounded">
              Borrow
            </button>
            <button className="flex-1 bg-green-500 text-white px-4 py-2 rounded">
              Deposit
            </button>
            <button className="flex-1 bg-red-500 text-white px-4 py-2 rounded">
              Spend
            </button>
          </div>
        </div>
        {/* <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm">
      <button className="text-blue-500">Transactions</button>
      <button className="text-red-500">Remove</button>
    </div> */}

        {/* Action Links
    <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm">
      <button className="text-blue-500">Transactions</button>
      <button className="text-red-500">Remove</button>
    </div> 
    
    */}

        {/* Bottom Buttons */}
        {/* <div className="flex flex-col sm:flex-row gap-4 mt-6">
      <button className="flex-1 bg-orange-500 text-white px-4 py-2 rounded">
        Borrow
      </button>
      <button className="flex-1 bg-green-500 text-white px-4 py-2 rounded">
        Deposit
      </button>
      <button className="flex-1 bg-red-500 text-white px-4 py-2 rounded">
        Spend
      </button>
    </div> */}
      </div>
    </div>
  );
}

export default Partitions;
