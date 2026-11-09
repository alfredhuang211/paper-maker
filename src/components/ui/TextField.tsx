interface TextFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  maxLength?: number;
  mono?: boolean;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

export function TextField({
  label,
  value,
  placeholder,
  maxLength,
  mono = false,
  onChange,
  onBlur,
}: TextFieldProps) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input
        className={mono ? 'text-input seed-input' : 'text-input'}
        type="text"
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
      />
    </label>
  );
}
