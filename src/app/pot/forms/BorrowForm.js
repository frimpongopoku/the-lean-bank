// forms/BorrowForm.js
import SpendForm from "./SpendForm";

const BorrowForm = ({ onSubmit }) => {
  return (
    <SpendForm
      title="Borrow"
      subtitle="How much are you borrowing? "
      onSubmit={onSubmit}
    />
  );
};

export default BorrowForm;
