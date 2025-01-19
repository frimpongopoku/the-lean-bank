import React from "react";

function FreeMoneySummary({
  freeMoney,
  balance,
  sumOfAllPartitionBalance,
  isValid = true,
}) {
  return (
    <div className="">
      <h3 className="font-bold underline">Undesignated (A.K.A Free Money)</h3>
      <span className="text-sm">
        This is money you have in your account <br />
        that you have not assigned to any particular task!
      </span>
      <br />
      <span className="text-sm">
        If this is is a{" "}
        <span className="text-red-700 font-semibold">negative number</span>,{" "}
        <br />
        it means you have assigned more money than you have in your account.
      </span>

      <h4 className={`font-bold underline`}>Formular</h4>
      <p className="italic text-sm font-semibold border p-2 rounded-md">
        <span>Undesignated(Free Money)</span> = Real Account Balance - Sum of
        All Partitions
      </p>
      <div className="mt-2">
        <h4
          className={`font-bold underline ${
            isValid ? "text-green-600" : "text-red-600"
          }`}
        >
          Status Check
        </h4>
        <p>
          <span className={` ${isValid ? "text-green-600" : "text-red-600"}`}>
            {isValid
              ? "  Currently, you are fine!"
              : "You have assigned more than you have!"}
          </span>
          <br />
          You have{" "}
          <span
            className={`font-bold mr-2 ${
              isValid ? "text-green-600" : "text-red-600"
            }`}
          >
            {Number(freeMoney)?.toLocaleString()}
          </span>
          worth of free money to blow!
        </p>
      </div>
    </div>
  );
}

export default FreeMoneySummary;
