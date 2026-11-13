import Icon from "./Icon";

/* Round icon for a ledger row: money in (mint), out (neutral), move, loan (amber). */
export default function TxnIcon({ incoming, move, loan }) {
  const name = move ? "move" : loan ? "loan" : incoming ? "arrowIn" : "arrowOut";
  const tone =
    incoming && !move
      ? "bg-[rgba(94,230,176,0.12)] text-mint"
      : loan
      ? "bg-[rgba(242,180,90,0.12)] text-amber"
      : "bg-raised text-muted";
  return (
    <span className={`w-8 h-8 rounded-full inline-flex items-center justify-center flex-none ${tone}`}>
      <Icon name={name} size={15} strokeWidth={2} />
    </span>
  );
}
