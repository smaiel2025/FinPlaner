"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { FlaskConical, Menu, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useCopilot } from "@/components/providers/CopilotProvider";
import { useTenant } from "@/components/providers/TenantProvider";
import { ActionSheet } from "@/components/insights/ActionSheet";
import { WhyDrawer } from "@/components/insights/WhyDrawer";
import { DemoDirector } from "@/components/layout/DemoDirector";
import { Drawer } from "@/components/ui/Drawer";
import { weekdayName } from "@/lib/utils/dates";
import { shortDate } from "@/lib/utils/format";
import { BrandMark } from "./BrandMark";
import { BACKSTAGE, NAV } from "./nav";

function TopNavLinks() {
  const pathname = usePathname();
  return (
    <nav className="hidden items-center gap-1 lg:flex">
      {[...NAV, ...BACKSTAGE].map(({ href, label }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link key={href} href={href} className={clsx("border-b-2 px-2 py-2 text-[13px]", active ? "border-brand font-semibold text-brand" : "border-transparent text-ink hover:text-brand")}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

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
  const { snapshot, toast, updatePreferences, notify } = useCopilot();
  const { tenant } = useTenant();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const today = snapshot?.context.today;
  const ai = snapshot?.ai;
  const copilotOn = snapshot?.context.preferences.copilotEnabled !== false;
  const firstName = snapshot?.context.profile.firstName;
  const topnav = tenant.layout === "topnav";

  const toggleCopilot = async () => {
    try {
      await updatePreferences({ copilotEnabled: !copilotOn });
    } catch (e) {
      notify((e as Error).message, "risk");
    }
  };

  const aiBadge = ai && (
    <span className={clsx("hidden rounded-full px-2.5 py-1 text-[11px] font-medium sm:inline-flex", ai.mode === "llm" ? "bg-growth-50 text-growth" : "bg-brand-50 text-brand")}>
      {ai.mode === "llm" ? `LLM phrasing: ${ai.provider.split(":")[1]}` : "Deterministic AI mode"}
    </span>
  );

  return (
    <div className="min-h-screen overflow-x-hidden">
      {!topnav && <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-line bg-white px-4 py-5 lg:flex">
        <div className="flex-1">
          <NavLinks />
        </div>
        <div className="rounded-xl bg-surface p-3 text-[12px] leading-relaxed text-muted">
          <div className="mb-1 flex items-center gap-1.5 font-medium text-ink">
            <FlaskConical size={13} /> Synthetic data
          </div>
          Not financial advice. Scores are demo metrics.
        </div>
      </aside>}

      <div className={topnav ? "" : "lg:pl-64"}>
        {topnav ? (
          <header className={clsx("sticky top-0 z-30 border-b border-line", tenant.header === "soft" ? "bg-[#f3f5f4]" : "bg-white")}>
            {tenant.header === "rule" ? <div className="h-0.5 bg-ink" /> : tenant.header !== "utility" && tenant.header !== "soft" && <div className="h-1 bg-brand" />}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2.5 sm:px-6">
              <div className="flex min-w-0 items-center gap-2 overflow-x-auto">
                <button className="rounded-lg p-1.5 text-ink hover:bg-surface lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu">
                  <Menu size={20} />
                </button>
                <BrandMark />
              </div>
              <TopNavLinks />
              <div className="ml-auto">{aiBadge}</div>
            </div>
          </header>
        ) : (
        <header className="sticky top-0 z-30 flex min-h-14 items-center justify-between gap-2 border-b border-line bg-white/85 px-4 py-2 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button className="rounded-lg p-1.5 text-ink hover:bg-surface lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
            <BrandMark />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {today && (
              <span className="hidden text-[13px] text-muted lg:inline">
                Demo date: <span className="font-medium text-ink">{weekdayName(today)} {shortDate(today)} 2026</span>
              </span>
            )}
            {aiBadge}
          </div>
        </header>
        )}

        <main key={pathname} className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:pb-12">
          {snapshot && !copilotOn ? (
            <div className="mx-auto max-w-lg rounded-2xl border border-line bg-white p-8 text-center shadow-card">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-surface text-muted"><Sparkles size={20} /></div>
              <h1 className="mt-4 text-xl font-semibold text-ink">{tenant.productName} is off</h1>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">
                {firstName ? `${firstName}'s bank app would look unchanged.` : "The bank app would look unchanged."} Turn it back on to open the assistant.
              </p>
              <button type="button" onClick={toggleCopilot} className="mt-5 rounded-full bg-brand px-4 py-2 text-sm font-medium text-white">
                Turn on
              </button>
            </div>
          ) : (
            children
          )}
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
