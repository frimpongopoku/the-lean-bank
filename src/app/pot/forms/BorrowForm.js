import SpendForm from "./SpendForm";

const BorrowForm = ({ onSubmit }) => (
  <SpendForm
    title="Borrow"
    subtitle="How much are you borrowing?"
    accentColor="brand-amber"
    onSubmit={onSubmit}
  />
);

export default BorrowForm;
