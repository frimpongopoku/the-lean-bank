import SpendForm from "./SpendForm";

const DepositForm = ({ onSubmit }) => (
  <SpendForm
    title="Deposit"
    subtitle="How much are you adding?"
    accentColor="brand-emerald"
    onSubmit={onSubmit}
  />
);

export default DepositForm;
