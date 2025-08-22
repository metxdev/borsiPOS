import { EyeClosed } from "lucide-react";

function PasswordField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm text-muted mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2 pr-10 bg-neutral-900 border border-neutral-700 rounded-lg text-light focus:ring-2 focus:ring-accent focus:outline-none"
        />
        <EyeClosed className="absolute right-3 top-2.5 text-muted" size={18} />
      </div>
    </div>
  );
}

export default PasswordField