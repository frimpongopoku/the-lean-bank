import SpendForm from "./SpendForm";

const DepositForm = ({ onSubmit }) => {
  return (
    <div>
      <SpendForm
        title={"Deposit"}
        subtitle="How much are you adding? "
        onSubmit={onSubmit}
      />{" "}
    </div>
  );
};

export default DepositForm;
