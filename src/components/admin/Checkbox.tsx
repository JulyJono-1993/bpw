interface CheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  className?: string;
}

export default function Checkbox({ checked, indeterminate = false, onChange, className = '' }: CheckboxProps) {
  const active = checked || indeterminate;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onChange();
      }}
      className={`shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
        active ? 'bg-primary text-on-primary-container border-primary' : 'bg-surface-container-high border-outline-variant/50'
      } ${className}`}
    >
      {active && (
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
          {indeterminate ? 'remove' : 'check'}
        </span>
      )}
    </button>
  );
}
