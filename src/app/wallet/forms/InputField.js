// components/InputField.js
import PropTypes from "prop-types";

const InputField = ({
  label,
  type = "text",
  value,
  onChange,
  maxLength,
  required = false,
  textarea,
}) => {
  const labelJsx = (
    <label
      className="block text-gray-700 text-sm font-bold mb-2"
      htmlFor={label}
    >
      {label}
    </label>
  );

  if (textarea)
    return (
      <div className="mb-4">
        {labelJsx}
        <textarea
          id={label}
          type={type}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          required={required}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        ></textarea>
      </div>
    );
  return (
    <div className="mb-4">
      {labelJsx}
      <input
        id={label}
        type={type}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        required={required}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      />
    </div>
  );
};

InputField.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  maxLength: PropTypes.number,
  required: PropTypes.bool,
};

export default InputField;
