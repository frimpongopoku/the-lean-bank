const SubmitButton = ({ text = "Submit" }) => {
  return (
    <button type="submit" className="btn-primary w-full justify-center mt-2">
      {text}
    </button>
  );
};

export default SubmitButton;
