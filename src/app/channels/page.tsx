"use client";

import { ArrowRight, Bell, MessageCircle, Route, Smartphone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PhoneMockup, WaBubble } from "@/components/channels/PhoneMockup";
import { useCopilot } from "@/components/providers/CopilotProvider";
import { PageHeader } from "@/components/ui/PageStates";
import { Badge, Button, Card, SectionTitle } from "@/components/ui/primitives";
import { api } from "@/lib/api/client";
import type { ChatMessage } from "@/lib/types/chat";

const time = (iso: string) => new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

const ROUTING = [
  { icon: Bell, label: "In-app", rule: "Default for insights, trade-offs and anything that needs detail." },
  { icon: MessageCircle, label: "WhatsApp", rule: "Only urgent risks (urgency 80+) or milestones on high-priority goals, if you opted in and it passes the stricter messaging score." },
  { icon: Smartphone, label: "Push / email", rule: "Supported by the channel layer; disabled for this customer in the demo." },
];

export default function ChannelsPage() {
  const router = useRouter();
  const { snapshot, trigger, feedback, notify, version } = useCopilot();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<{ messages: ChatMessage[] }>("/api/chat")
      .then((r) => setMessages(r.messages.filter((m) => m.channel === "whatsapp")))
      .catch((e) => notify(e.message, "risk"));
  }, [version, notify]);

  const notifications = snapshot?.context.notifications ?? [];
  const latestRisk = [...notifications].reverse().find((n) => n.kind === "risk");
  const messagingOn = snapshot ? snapshot.context.preferences.channels.whatsapp && snapshot.context.preferences.consent.messagingChannel : true;

  const simulate = async () => {
    setBusy(true);
    try {
      notify(await trigger("insurance_invoice"), "info");
    } catch (e) {
      notify((e as Error).message, "risk");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Messaging preview" subtitle={`How the Co-Pilot reaches ${snapshot?.context.profile.firstName ?? "the customer"} outside the app. One conversation, continued across channels.`} />
      <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
        <PhoneMockup
          footer={
            latestRisk ? (
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => router.push("/copilot?thread=insurance")} className="rounded-lg bg-white py-2 text-[13px] font-medium text-[#008069] shadow-sm">Show options</button>
                <button onClick={() => feedback(latestRisk.opportunityKey, "dismissed")} className="rounded-lg bg-white py-2 text-[13px] font-medium text-[#008069] shadow-sm">Not now</button>
              </div>
            ) : undefined
          }
        >
          <div className="mx-auto rounded-md bg-[#fff3c4] px-2.5 py-1 text-center text-[10px] text-slate-600">Messages are simulated for the demo.</div>
          {messages.length === 0 ? (
            <div className="mt-auto flex flex-col items-center gap-3 pb-6 text-center">
              <p className="px-6 text-[12px] text-slate-500">No messages yet. The Co-Pilot stays quiet until something is genuinely worth your attention.</p>
              <Button size="sm" onClick={simulate} disabled={busy || !messagingOn}>Simulate insurer payment request</Button>
            </div>
          ) : (
            messages.map((m) => <WaBubble key={m.id} text={m.text} time={time(m.createdAt)} fromUser={m.role === "user"} />)
          )}
        </PhoneMockup>

        <div className="space-y-5">
          <Card className="p-6">
            <SectionTitle title="Why this message was sent" />
            {latestRisk ? (
              <div className="space-y-2 text-[14px] text-slate-600">
                <p><span className="font-medium text-ink">{latestRisk.title}.</span> The insurer confirmed the payment request, so certainty jumped and the payment is due within 3 days.</p>
                <p>Relevance was high enough to justify an interruption, {snapshot?.context.profile.firstName ?? "the customer"} prefers WhatsApp and gave consent for messaging. Anything less urgent would have waited in the app.</p>
                <Link href="/copilot?thread=insurance" className="inline-flex items-center gap-1 pt-1 text-[13px] font-medium text-brand hover:underline">
                  Continue in the app with full context <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <p className="text-[14px] text-muted">
                {messagingOn ? "Nothing has passed the messaging threshold yet. Use the button in the phone or the demo director to trigger the insurer event." : "Messaging is switched off in AI controls, so all insights stay in the app."}
              </p>
            )}
          </Card>

          <Card className="p-6">
            <SectionTitle title="Channel routing rules" />
            <ul className="space-y-3">
              {ROUTING.map(({ icon: Icon, label, rule }) => (
                <li key={label} className="flex gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface text-ink"><Icon size={15} /></span>
                  <div>
                    <div className="text-[14px] font-medium text-ink">{label}</div>
                    <div className="text-[13px] text-muted">{rule}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <SectionTitle title="Notification log" action={<Badge tone="neutral"><Route size={11} /> {notifications.length} sent</Badge>} />
            {notifications.length ? (
              <ul className="divide-y divide-line">
                {notifications.map((n) => (
                  <li key={n.id} className="flex items-center justify-between py-2.5 text-[13px]">
                    <span className="text-ink">{n.title}</span>
                    <span className="text-muted">{n.channel} · {n.date}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[13px] text-muted">No outbound messages. Fewer, better interruptions is the point.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
