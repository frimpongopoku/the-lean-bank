// components/SubmitButton.js
const SubmitButton = ({ text }) => {
  return (
    <button
      type="submit"
      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
    >
      {text}
    </button>
  );
};

export default SubmitButton;
