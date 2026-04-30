const TransactionsTable = ({ data, head, variant = "default" }) => {
  const renderData = (cell) => {
    if (cell?.func) return cell.func(cell);
    return cell?.value;
  };

  if (!data?.length) {
    return (
      <div className="py-12 text-center">
        <p className="text-white/30 text-sm">No records found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            {head?.map((h, i) => (
              <th
                key={i}
                className="text-left text-xs font-semibold uppercase tracking-wider text-white/35 pb-3 px-3 first:pl-0 last:pr-0"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className="group transition-colors duration-150"
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.03)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              {row.map((cell, cellIdx) => (
                <td
                  key={cellIdx}
                  className="py-3 px-3 first:pl-0 last:pr-0 text-white/70 align-middle"
                >
                  {renderData(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionsTable;
