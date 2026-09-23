"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, XCircle, MessageCircle } from "lucide-react";
import * as whatsapp from "@/lib/whatsapp/api";
import { statusLabel, statusTone, messageLabel } from "@/lib/whatsapp/display";
import type { WhatsAppMessage } from "@/lib/whatsapp/types";

function formatTime(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

/** Section 41 — history only; section 42's reminder that this is not the customer ledger applies just as much here: nothing on this list is a balance or a transaction, only a record that a message was sent about one. */
export function WhatsAppHistory({ customerId }: { customerId: string }) {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    whatsapp
      .listMessages({ customerId })
      .then((res) => !cancelled && setMessages(res.data))
      .catch(() => !cancelled && setMessages([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [customerId]);

  if (loading) return null;
  if (messages.length === 0) return null;

  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b flex items-center gap-2">
        <MessageCircle className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">WhatsApp History</h2>
      </div>
      <div>
        {messages.map((message) => {
          const tone = statusTone(message.status);
          const isOpen = expanded === message.id;
          return (
            <div key={message.id} className="border-b last:border-b-0">
              <button
                onClick={() => setExpanded(isOpen ? null : message.id)}
                className="w-full flex items-center justify-between px-6 py-3 text-left hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {tone === "positive" && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
                  {tone === "negative" && <XCircle className="h-4 w-4 text-destructive shrink-0" />}
                  {tone === "neutral" && <Clock className="h-4 w-4 text-muted-foreground shrink-0" />}
                  <span className="text-sm font-medium truncate">{messageLabel(message.templateName)}</span>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 ml-2">{statusLabel(message.status)}</span>
              </button>
              {isOpen && (
                <div className="px-6 pb-4 text-sm">
                  <p className="text-xs text-muted-foreground mb-2">
                    {formatTime(message.createdAt)}
                    {message.deliveredAt ? ` · Delivered ${formatTime(message.deliveredAt)}` : ""}
                    {message.readAt ? ` · Read ${formatTime(message.readAt)}` : ""}
                  </p>
                  <div className="rounded-lg bg-muted/30 border p-3 whitespace-pre-line text-sm">
                    {message.contentSnapshot}
                  </div>
                  {message.status === "FAILED" && message.failureReason && (
                    <p className="text-xs text-destructive mt-2">{message.failureReason}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
