"use client";

import { useState } from "react";
import { MessageCircle, Send, X, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Can } from "@/components/auth/Can";
import { PERMISSIONS } from "@/lib/permissions";
import * as whatsapp from "@/lib/whatsapp/api";
import type { QuickAction } from "@/lib/whatsapp/types";

/**
 * Phase 12, sections 38-39, 44 — the customer-page WhatsApp entry point.
 * Sale confirmation and payment receipt are deliberately NOT here — this
 * app has no sale/payment detail page to anchor them to unambiguously
 * (which sale? which payment?), so those two live where the transaction
 * itself is created (sales/new, receive-payment) instead — see
 * docs/PHASE-12-WHATSAPP.md, "Where each action lives".
 */

interface WhatsAppPanelProps {
  customerId: string;
  customerName: string;
  hasPhone: boolean;
  optedIn: boolean;
  onOptInChanged: () => void;
}

const ACTIONS: { key: QuickAction; label: string; description: string }[] = [
  { key: "statement", label: "Send Statement", description: "Opening balance, sales, payments and outstanding" },
  { key: "outstanding-reminder", label: "Send Reminder", description: "Current outstanding balance" },
  { key: "custom", label: "Custom Message", description: "Write your own message" },
];

export function WhatsAppPanel({ customerId, customerName, hasPhone, optedIn, onOptInChanged }: WhatsAppPanelProps) {
  const [open, setOpen] = useState(false);
  const [optInBusy, setOptInBusy] = useState(false);
  const [optInError, setOptInError] = useState("");

  async function toggleOptIn(next: boolean) {
    setOptInBusy(true);
    setOptInError("");
    try {
      await whatsapp.setOptIn(customerId, next);
      onOptInChanged();
    } catch (err: any) {
      setOptInError(err.message || "Could not update WhatsApp consent.");
    } finally {
      setOptInBusy(false);
    }
  }

  // Section 44 — no broken send button when there's nothing to send to.
  if (!hasPhone) {
    return (
      <div className="bg-card border rounded-xl p-4 text-sm text-muted-foreground flex items-center gap-2">
        <WifiOff className="h-4 w-4 shrink-0" />
        WhatsApp unavailable — no phone number on file.
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="h-4 w-4 text-emerald-600" />
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">WhatsApp</h2>
      </div>

      {!optedIn ? (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {customerName} hasn&apos;t opted in to WhatsApp messages yet.
          </p>
          {optInError && <p className="text-sm text-destructive">{optInError}</p>}
          <Can permission={PERMISSIONS.WHATSAPP_SEND}>
            <Button size="sm" variant="outline" disabled={optInBusy} onClick={() => toggleOptIn(true)}>
              {optInBusy ? "Saving..." : "Opt in to WhatsApp"}
            </Button>
          </Can>
        </div>
      ) : (
        <div className="space-y-2">
          {ACTIONS.map((action) => (
            <button
              key={action.key}
              onClick={() => setOpen(true)}
              className="w-full text-left flex items-center justify-between rounded-lg border px-3 py-2 hover:bg-muted/50 transition-colors"
            >
              <span>
                <span className="text-sm font-medium block">{action.label}</span>
                <span className="text-xs text-muted-foreground">{action.description}</span>
              </span>
              <Send className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </button>
          ))}
          {optInError && <p className="text-sm text-destructive">{optInError}</p>}
          <button
            onClick={() => toggleOptIn(false)}
            disabled={optInBusy}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            {optInBusy ? "Saving..." : "Opt out of WhatsApp"}
          </button>
        </div>
      )}

      {open && (
        <QuickActionDialog customerId={customerId} customerName={customerName} onClose={() => setOpen(false)} />
      )}
    </div>
  );
}

function QuickActionDialog({
  customerId,
  customerName,
  onClose,
}: {
  customerId: string;
  customerName: string;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<QuickAction>("statement");
  const [customContent, setCustomContent] = useState("");
  const [mutationId] = useState(() => crypto.randomUUID());
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<{ preview: string } | null>(null);
  const [error, setError] = useState("");

  async function handleSend() {
    setSending(true);
    setError("");
    try {
      let message;
      if (tab === "statement") message = await whatsapp.sendStatement(customerId, mutationId);
      else if (tab === "outstanding-reminder") message = await whatsapp.sendOutstandingReminder(customerId);
      else message = await whatsapp.sendCustomMessage(customerId, customContent, mutationId);
      setSent({ preview: message.contentSnapshot });
    } catch (err: any) {
      setError(err.message || "Could not send this message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>WhatsApp — {customerName}</DialogTitle>
        </DialogHeader>

        {sent ? (
          <div className="space-y-3">
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800">
              Queued to send.
            </div>
            <div className="rounded-lg border bg-muted/30 p-3 text-sm whitespace-pre-line">{sent.preview}</div>
            <DialogFooter>
              <Button onClick={onClose}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-1 rounded-lg bg-muted p-1 text-xs">
              {(["statement", "outstanding-reminder", "custom"] as QuickAction[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex-1 rounded-md px-2 py-1.5 font-medium transition-colors ${
                    tab === key ? "bg-background shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  {key === "statement" ? "Statement" : key === "outstanding-reminder" ? "Reminder" : "Custom"}
                </button>
              ))}
            </div>

            {tab === "custom" ? (
              <textarea
                value={customContent}
                onChange={(e) => setCustomContent(e.target.value)}
                placeholder="Write your message..."
                rows={4}
                maxLength={1024}
                className="h-24 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            ) : (
              // Section 39: for an automated/template message, the
              // preview is generated server-side from the real
              // transaction data and only shown after a successful
              // send here — there's nothing to preview beforehand
              // without duplicating the backend's own calculation.
              <p className="text-sm text-muted-foreground">
                {tab === "statement"
                  ? "Sends the current statement — opening balance, sales, payments and outstanding — from RFC's records."
                  : "Sends the current outstanding balance from RFC's records."}
              </p>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                <X className="h-3.5 w-3.5 mr-1.5" /> Cancel
              </Button>
              <Button onClick={handleSend} disabled={sending || (tab === "custom" && !customContent.trim())}>
                <Send className="h-3.5 w-3.5 mr-1.5" /> {sending ? "Sending..." : "Send"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
