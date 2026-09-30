import { Activity, Award, Cpu, LayoutDashboard, Lightbulb, MessageCircle, SlidersHorizontal, Sparkles, Target } from "lucide-react";

export const NAV = [
  { href: "/", label: "Overview", icon: LayoutDashboard, mobile: true },
  { href: "/copilot", label: "Co-Pilot", icon: Sparkles, mobile: true },
  { href: "/goals", label: "Goals & journey", icon: Target, mobile: true },
  { href: "/health", label: "Health & momentum", icon: Activity, mobile: false },
  { href: "/progress", label: "Your progress", icon: Award, mobile: false },
  { href: "/insights", label: "Insights", icon: Lightbulb, mobile: true },
  { href: "/channels", label: "Messaging preview", icon: MessageCircle, mobile: false },
  { href: "/settings", label: "AI controls", icon: SlidersHorizontal, mobile: false },
] as const;

export const BACKSTAGE = [{ href: "/intelligence", label: "Intelligence view", icon: Cpu }] as const;
