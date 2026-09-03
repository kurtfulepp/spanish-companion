import { MessageCircle } from 'lucide-react';

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      {!compact && <span className="grid size-10 place-items-center rounded-[14px] bg-primary text-primary-foreground shadow-[0_7px_20px_rgba(30,63,56,.22)]"><MessageCircle className="size-5 fill-current" /></span>}
      <span className="font-heading text-xl font-bold tracking-[-0.04em]">Kurt<span className="brand-es">ES</span></span>
    </span>
  );
}
