interface SwitchFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function SwitchField({ label, checked, onChange }: SwitchFieldProps) {
  return (
    <button
      type="button"
      className="switch"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
    >
      <span>{label}</span>
      <span className="switch-track" aria-hidden="true" />
    </button>
  );
}
