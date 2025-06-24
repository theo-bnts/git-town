export function FieldWrapper({ label, error, children }) {
  return (
    <div>
      <p className="mb-1 font-medium">{label}</p>
      {children}
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}