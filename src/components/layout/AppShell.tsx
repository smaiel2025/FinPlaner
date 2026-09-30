"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { FlaskConical, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useCopilot } from "@/components/providers/CopilotProvider";
import { ActionSheet } from "@/components/insights/ActionSheet";
import { WhyDrawer } from "@/components/insights/WhyDrawer";
import { DemoDirector } from "@/components/layout/DemoDirector";
import { Drawer } from "@/components/ui/Drawer";
import { weekdayName } from "@/lib/utils/dates";
import { shortDate } from "@/lib/utils/format";
import { BrandMark } from "./BrandMark";
import { BACKSTAGE, NAV } from "./nav";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const item = (href: string, label: string, Icon: typeof NAV[number]["icon"]) => (
    <Link
      key={href}
      href={href}
      onClick={onNavigate}
      className={clsx(
        "flex items-center gap-3 rounded-xl px-3 py-2 text-[14px] transition-colors",
        active(href) ? "bg-brand-50 font-medium text-brand" : "text-slate-600 hover:bg-surface hover:text-ink",
      )}
    >
      <Icon size={17} strokeWidth={1.9} />
      {label}
    </Link>
  );
  return (
    <nav className="flex flex-col gap-0.5">
      {NAV.map((n) => item(n.href, n.label, n.icon))}
      <div className="mt-5 px-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">Behind the scenes</div>
      {BACKSTAGE.map((n) => item(n.href, n.label, n.icon))}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { snapshot, toast } = useCopilot();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const today = snapshot?.context.today;
  const ai = snapshot?.ai;

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-line bg-white px-4 py-5 lg:flex">
        <div className="px-2">
          <BrandMark />
        </div>
        <div className="mt-8 flex-1">
          <NavLinks />
        </div>
        <div className="rounded-xl bg-surface p-3 text-[12px] leading-relaxed text-muted">
          <div className="mb-1 flex items-center gap-1.5 font-medium text-ink">
            <FlaskConical size={13} /> Prototype
          </div>
          Synthetic customer data. Not financial advice. Scores are demo metrics.
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-line bg-white/85 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-2 lg:hidden">
            <button className="rounded-lg p-1.5 text-ink hover:bg-surface" onClick={() => setMenuOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
            <BrandMark />
          </div>
          <div className="hidden items-center gap-2 text-[13px] text-muted lg:flex">
            {today && (
              <span>
                Demo date: <span className="font-medium text-ink">{weekdayName(today)} {shortDate(today)} 2026</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {ai && (
              <span className={clsx("hidden rounded-full px-2.5 py-1 text-[11px] font-medium sm:inline-flex", ai.mode === "llm" ? "bg-growth-50 text-growth" : "bg-brand-50 text-brand")}>
                {ai.mode === "llm" ? `LLM phrasing: ${ai.provider.split(":")[1]}` : "Deterministic AI mode"}
              </span>
            )}
            <span className="whitespace-nowrap rounded-full bg-attention-50 px-2.5 py-1 text-[11px] font-medium text-attention">
              <span className="sm:hidden">Prototype</span>
              <span className="hidden sm:inline">Hackathon prototype · synthetic data</span>
            </span>
          </div>
        </header>

        <main key={pathname} className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:pb-12">
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {NAV.filter((n) => n.mobile).map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={clsx("flex flex-col items-center gap-0.5 py-2 text-[10px]", active ? "text-brand" : "text-slate-500")}>
              <Icon size={19} strokeWidth={1.9} />
              {label.split(" ")[0]}
            </Link>
          );
        })}
      </nav>

      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu">
        <NavLinks onNavigate={() => setMenuOpen(false)} />
      </Drawer>

      <WhyDrawer />
      <ActionSheet />
      <DemoDirector />

      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className={clsx(
              "fixed bottom-20 left-1/2 z-[60] -translate-x-1/2 rounded-full px-4 py-2 text-[13px] font-medium text-white shadow-lift lg:bottom-6",
              toast.tone === "positive" ? "bg-growth" : toast.tone === "risk" ? "bg-risk" : "bg-ink",
            )}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
