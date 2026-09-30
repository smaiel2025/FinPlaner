/** KBC-inspired demo mark (not the official KBC logo). */
export function BrandMark({ inverted = false }: { inverted?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`grid h-9 w-9 place-items-center rounded-xl ${inverted ? "bg-white/10" : "bg-ink"}`}>
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
          <path d="M4 17c3-6 6-9 9-9s5 2 7 5" fill="none" stroke="#22b5e8" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="13" cy="8" r="2.2" fill="#ffffff" />
        </svg>
      </div>
      <div className="leading-tight">
        <div className={`whitespace-nowrap text-[14px] font-semibold tracking-tight ${inverted ? "text-white" : "text-ink"}`}>Financial Co-Pilot</div>
        <div className={`text-[11px] ${inverted ? "text-white/60" : "text-muted"}`}>KBC · hackathon prototype</div>
      </div>
    </div>
  );
}
