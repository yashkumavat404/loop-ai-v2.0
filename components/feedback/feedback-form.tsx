"use client";

import { FormEvent, useState } from "react";
import { api } from "@/lib/api";

export function FeedbackForm({ onCreated }: { onCreated?: () => void }) {
  const [text, setText] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [channel, setChannel] = useState("WEB");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    if (!text.trim()) {
      setMessage("Feedback text is required.");
      return;
    }

    try {
      setSaving(true);
      await api.createFeedback({
        text: text.trim(),
        customerName: customerName.trim() || undefined,
        customerEmail: customerEmail.trim() || undefined,
        channel
      });
      setText("");
      setCustomerName("");
      setCustomerEmail("");
      setMessage("Feedback added successfully.");
      onCreated?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to add feedback.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Feedback</label>
        <textarea
          className="input min-h-32 resize-y"
          placeholder="What did the customer say?"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Customer name</label>
          <input className="input" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Customer email</label>
          <input className="input" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Channel</label>
        <select className="input" value={channel} onChange={(e) => setChannel(e.target.value)}>
          <option value="WEB">Web</option>
          <option value="EMAIL">Email</option>
          <option value="SUPPORT">Support</option>
          <option value="SURVEY">Survey</option>
          <option value="APP_STORE">App Store</option>
        </select>
      </div>

      {message && <p className="text-sm text-muted-foreground">{message}</p>}

      <button className="btn-primary" disabled={saving}>
        {saving ? "Saving..." : "Add feedback"}
      </button>
    </form>
  );
}
