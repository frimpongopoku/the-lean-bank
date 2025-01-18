const TransactionsTable = ({ data, head, cColor = "bg-gray-100" }) => {
  const renderData = (data) => {
    if (data?.func) return data?.func(data);
    return data?.value;
  };
  return (
    <table className="table-auto w-full border-collapse border border-gray-300">
      <thead>
        <tr className="bg-gray-100">
          {head?.map((h, index) => (
            <th key={index} className="border border-gray-300 p-2">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data?.map((dataSet, index) => (
          <tr key={index} className={index % 2 === 0 ? cColor : "bg-white"}>
            {dataSet.map((data, index) => (
              <td key={index} className="border border-gray-300 p-2">
                {renderData(data)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TransactionsTable;
