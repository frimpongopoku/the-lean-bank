const SubmitButton = ({ text = "Save", disabled, tone = "primary" }) => (
  <button
    type="submit"
    disabled={disabled}
    className={`${tone === "danger" ? "btn-danger" : "btn-primary"} btn-lg w-full`}
  >
    {text}
  </button>
);

export default SubmitButton;
