import Icon from "@/app/components/ui/Icon";

/* Dialog header shared by every form: title, optional line under it, close button. */
export function FormHeader({ title, subtitle, onClose }) {
  return (
    <div className="flex items-start gap-3 px-5 sm:px-6 pt-3 sm:pt-5">
      <div className="flex-1 min-w-0">
        <h2 className="m-0 text-base font-semibold text-ink">{title}</h2>
        {subtitle && <p className="m-0 mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {onClose && (
        <button type="button" onClick={() => onClose()} className="icon-btn -mr-2 -mt-1" aria-label="Close">
          <Icon name="x" />
        </button>
      )}
    </div>
  );
}

/* Parses "1,200.50" → 1200.5; returns NaN for anything that isn't a number. */
export const parseAmount = (v) => {
  const cleaned = String(v ?? "").replace(/[,\s]/g, "");
  if (!cleaned || !/^-?\d*\.?\d*$/.test(cleaned)) return NaN;
  return Math.round(Number(cleaned) * 100) / 100;
};

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
  hint,
  inputMode,
  autoFocus,
  prefix,
  error,
  className = "",
  ...rest
}) => {
  const id = `f-${name}`;
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  const shared = {
    id,
    name,
    value: value ?? "",
    onChange,
    maxLength,
    required,
    placeholder: placeholder || "",
    autoFocus,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    "data-autofocus": autoFocus ? "" : undefined,
    ...rest,
  };

  return (
    <div className={className}>
      <label className="field-label" htmlFor={id}>
        {label}
        {!required && <span className="text-faint"> (optional)</span>}
      </label>
      {textarea ? (
        <textarea {...shared} rows={2} className="field" />
      ) : prefix ? (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-faint text-sm pointer-events-none">{prefix}</span>
          <input {...shared} type={type} inputMode={inputMode} className="field num" style={{ paddingLeft: `${prefix.length * 9 + 22}px` }} />
        </div>
      ) : (
        <input {...shared} type={type} inputMode={inputMode} className="field" />
      )}
      {error ? (
        <p id={`${id}-err`} className="m-0 mt-1.5 text-[13px] text-danger">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="m-0 mt-1.5 text-[13px] text-muted">{hint}</p>
      ) : null}
    </div>
  );
};

export default InputField;
