import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { CopilotProvider } from "@/components/providers/CopilotProvider";
import { TenantProvider } from "@/components/providers/TenantProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "KBC Financial Co-Pilot · Hackathon prototype",
  description: "An AI-powered personal financial co-pilot proof of concept using synthetic data.",
};

export const viewport: Viewport = {
  themeColor: "#0b1f3a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TenantProvider>
          <CopilotProvider>
            <AppShell>{children}</AppShell>
          </CopilotProvider>
        </TenantProvider>
      </body>
    </html>
  );
}
