// src/components/common/ToggleSwitch.tsx
type Props = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export default function ToggleSwitch({ label, checked, onChange }: Props) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#95C11F] focus:ring-offset-2
          ${checked ? 'bg-[#95C11F]' : 'bg-gray-200'}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${checked ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
  );
}