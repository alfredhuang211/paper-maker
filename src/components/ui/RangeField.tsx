interface RangeFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  help?: string;
  onChange: (value: number) => void;
}

export function RangeField({
  label,
  value,
  min,
  max,
  step = 1,
  help,
  onChange,
}: RangeFieldProps) {
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <div className="range-row">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={label}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <span className="range-value">{value}</span>
      </div>
      {help ? <span className="field-help">{help}</span> : null}
    </div>
  );
}
