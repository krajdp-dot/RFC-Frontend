"use client";

import { useState } from "react";
import { CheckCircle2, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Can } from "@/components/auth/Can";
import { PERMISSIONS } from "@/lib/permissions";
import * as whatsapp from "@/lib/whatsapp/api";

/**
 * Phase 12, sections 20-21, 26 — shown only after a LIVE, server-confirmed
 * sale or payment (never for a Phase 11 offline-queued one — see the
 * caller in sales/new and receive-payment, which only reaches this
 * component on result.mode === "live"). Sending is one explicit tap, not
 * automatic, matching this app's manual-by-default posture; automated
 * sending is a separate, opt-in setting (Settings → WhatsApp).
 */
export function PostSaleWhatsAppOffer({
  kind,
  entityId,
  onDone,
}: {
  kind: "sale" | "payment";
  entityId: string;
  onDone: () => void;
}) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function send() {
    setState("sending");
    setError("");
    try {
      if (kind === "sale") await whatsapp.sendSaleConfirmation(entityId);
      else await whatsapp.sendPaymentReceipt(entityId);
      setState("sent");
    } catch (err: any) {
      setState("error");
      setError(err.message || "Could not send this on WhatsApp.");
    }
  }

  const label = kind === "sale" ? "Sale" : "Payment";

  return (
    <div className="bg-card border rounded-xl p-6 text-center space-y-4">
      <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
      <div>
        <h2 className="font-semibold">{label} recorded</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {kind === "sale" ? "The sale has been saved." : "The payment has been recorded."}
        </p>
      </div>

      {state === "sent" ? (
        <p className="text-sm text-emerald-700">Queued to send on WhatsApp.</p>
      ) : (
        <Can permission={PERMISSIONS.WHATSAPP_SEND}>
          <Button variant="outline" className="w-full gap-2" disabled={state === "sending"} onClick={send}>
            <MessageCircle className="h-4 w-4" />
            {state === "sending" ? "Sending..." : `Send ${label.toLowerCase()} confirmation on WhatsApp`}
          </Button>
          {state === "error" && <p className="text-xs text-destructive">{error}</p>}
        </Can>
      )}

      <Button variant="ghost" className="w-full gap-1.5 text-muted-foreground" onClick={onDone}>
        Continue <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
