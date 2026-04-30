import PropTypes from "prop-types";

const InputField = ({
  label,
  type = "text",
  value,
  onChange,
  maxLength,
  required = false,
  textarea,
  name,
  placeholder,
}) => {
  const labelJsx = (
    <label className="block text-white/60 text-xs font-semibold mb-2 uppercase tracking-wider" htmlFor={name}>
      {label}
      {required && <span className="text-brand-rose ml-1">*</span>}
    </label>
  );

  const sharedProps = {
    id: name,
    name,
    value: value ?? "",
    onChange,
    maxLength,
    required,
    placeholder: placeholder || "",
    className: "input-glass",
  };

  return (
    <div className="mb-4">
      {labelJsx}
      {textarea ? (
        <textarea {...sharedProps} rows={3} />
      ) : (
        <input {...sharedProps} type={type} />
      )}
    </div>
  );
};

InputField.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  maxLength: PropTypes.number,
  required: PropTypes.bool,
};

export default InputField;
