import React from "react";

function ChecksumSummary({
  isValid = true,
  freeMoneyIsInvalid,
  freeMoney,
  balance,
  sumOfAllPartitionBalance,
  onlySumValidity,
}) {
  return (
    <div className="">
      <h3 className="font-bold underline">Sensibility Check</h3>
      <span className="text-sm">
        This makes sure you are not pulling money out of thin air!
      </span>
      <br />
      <span className="text-sm">
        It makes sure your
        <span className="text-cyan-700 font-semibold ml-2">
          free money & partitions
        </span>
        , <br />
        resolve to the value of your actual account balance.
      </span>

      <h4 className={`font-bold underline`}>Formular</h4>
      <p className="italic text-sm font-semibold border p-2 rounded-md">
        <span>Valid</span> = Actual Account Balance = Sum of All Partitions +
        Free Money(& is not negative)
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
            {isValid ? "  Currently, you are fine!" : "Something aint right!"}
          </span>
          <br />
          <span
            className={`${
              freeMoneyIsInvalid ? "text-red-600" : "text-green-600"
            }`}
          >
            Free Money ={" "}
            <b className="underline">{Number(freeMoney)?.toLocaleString()}</b>{" "}
            <br />
          </span>{" "}
          <span
            className={`${onlySumValidity ? "text-green-600" : "text-red-600"}`}
          >
            Balance Check = {Number(sumOfAllPartitionBalance)?.toLocaleString()}{" "}
            + {Number(freeMoney)?.toLocaleString()} =
            <b className="underline"> {Number(balance)?.toLocaleString()}</b>
          </span>{" "}
          Should be{" "}
          <b className="underline">
            {Number(sumOfAllPartitionBalance + freeMoney)?.toLocaleString()}
          </b>
          <br />
        </p>
      </div>
    </div>
  );
}

export default ChecksumSummary;
