function InputField({
  id,
  label,
  type,
  value,
  onChange,
}: {
  id: string;
  label: string;
  type: "text" | "email";
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm text-muted mb-1">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-light focus:ring-2 focus:ring-accent focus:outline-none"
      />
    </div>
  );
}

export default InputField;