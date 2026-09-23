"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import * as whatsapp from "@/lib/whatsapp/api";
import type { WhatsAppAutomationSettings } from "@/lib/whatsapp/types";

/**
 * Phase 12, section 29 — every automation type defaults to off
 * (whatsapp.service.ts's getAutomationSettings) and is toggled here by
 * an authorized user (gated by whatsapp.manage_settings one level up, in
 * settings/page.tsx, matching how the Accounts section there is gated).
 */
const TOGGLES: { key: keyof WhatsAppAutomationSettings; label: string; description: string }[] = [
  { key: "saleConfirmationEnabled", label: "Sale confirmation", description: "Send automatically when a sale is created" },
  { key: "paymentReceiptEnabled", label: "Payment receipt", description: "Send automatically when a payment is recorded" },
  { key: "outstandingReminderEnabled", label: "Outstanding reminder", description: "Daily reminder for customers above the outstanding threshold" },
];

export function WhatsAppSettingsSection() {
  const [settings, setSettings] = useState<WhatsAppAutomationSettings | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    whatsapp
      .getAutomationSettings()
      .then(setSettings)
      .catch((err) => setError(err.message || "Could not load WhatsApp settings."));
  }, []);

  async function toggle(key: keyof WhatsAppAutomationSettings) {
    if (!settings) return;
    setBusyKey(key);
    setError("");
    const next = !settings[key];
    try {
      const updated = await whatsapp.updateAutomationSettings({ [key]: next });
      setSettings(updated);
    } catch (err: any) {
      setError(err.message || "Could not update this setting.");
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <section className="bg-card border rounded-xl overflow-hidden">
      <div className="p-4 border-b bg-muted/20">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">WhatsApp</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Automatic messages — every type is off until you turn it on
        </p>
      </div>

      {error && <div className="px-4 py-3 text-sm text-destructive border-b bg-destructive/5">{error}</div>}

      <div>
        {TOGGLES.map((toggle_, index) => (
          <div key={toggle_.key} className={`flex items-center justify-between p-4 ${index > 0 ? "border-t" : ""}`}>
            <div>
              <p className="text-sm font-medium">{toggle_.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{toggle_.description}</p>
            </div>
            <button
              onClick={() => toggle(toggle_.key)}
              disabled={!settings || busyKey === toggle_.key}
              role="switch"
              aria-checked={settings?.[toggle_.key] ?? false}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
                settings?.[toggle_.key] ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  settings?.[toggle_.key] ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
