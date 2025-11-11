export default 
function Card({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: React.ReactNode;
}) {
  return (
    <button className="w-full h-full flex flex-col items-center justify-center rounded-2xl bg-sky-50 px-4 py-6 text-center shadow-[0_1px_0_#e6eef9_inset] transition active:scale-[0.98]">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
        {icon}
      </div>
      <span className="text-[15px] font-semibold leading-5 text-neutral-900">
        {label}
      </span>
    </button>
  );
}
