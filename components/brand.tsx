export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      {!compact && <span className="relative size-10 overflow-hidden rounded-[14px] bg-[#efe5d5] shadow-[0_7px_20px_rgba(30,63,56,.16)] ring-1 ring-black/5"><img src="/brand/kurtes-coach.png" alt="" className="absolute left-1/2 top-0 h-[155%] max-w-none -translate-x-1/2" /></span>}
      <span className="font-heading text-xl font-bold tracking-[-0.04em]">Kurt<span className="brand-es">ES</span></span>
    </span>
  );
}
