"use client";

import { Search, SlidersHorizontal } from "lucide-react";

interface FeedbackFiltersProps {
  search: string;
  status: string;
  sentiment: string;
  channel: string;
  theme: string;
  onSearch: (value: string) => void;
  onStatus: (value: string) => void;
  onSentiment: (value: string) => void;
  onChannel: (value: string) => void;
  onTheme: (value: string) => void;
}

export function FeedbackFilters(props: FeedbackFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef4ff] text-[#2f6fed] dark:bg-[#162b4a] dark:text-[#76a9ff]">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#5f7086] dark:text-[#a2afc0]">
              Filter feedback
            </p>
            <p className="hidden text-[10px] text-[#8a96a7] dark:text-[#7f8da1] sm:block">
              Narrow the workspace feedback stream
            </p>
          </div>
        </div>

        {(props.search ||
          props.status ||
          props.sentiment ||
          props.channel ||
          props.theme) && (
          <span className="rounded-full bg-[#eef4ff] px-2.5 py-1 text-[10px] font-bold text-[#356dc7] dark:bg-[#162b4a] dark:text-[#8db8ff]">
            Filters active
          </span>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        <div className="relative md:col-span-2">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8290a3] dark:text-[#7f8da1]" />
          <input
            className="input h-11 rounded-xl pl-10"
            placeholder="Search feedback..."
            value={props.search}
            onChange={(e) => props.onSearch(e.target.value)}
          />
        </div>

        <select className="input h-11" value={props.status} onChange={(e) => props.onStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="NEW">New</option>
          <option value="REVIEWED">Reviewed</option>
          <option value="ACTIONED">Actioned</option>
        </select>

        <select className="input h-11" value={props.sentiment} onChange={(e) => props.onSentiment(e.target.value)}>
          <option value="">All sentiment</option>
          <option value="POSITIVE">Positive</option>
          <option value="NEUTRAL">Neutral</option>
          <option value="NEGATIVE">Negative</option>
        </select>

        <select className="input h-11" value={props.channel} onChange={(e) => props.onChannel(e.target.value)}>
          <option value="">All channels</option>
          <option value="WEB">Web</option>
          <option value="CSV">CSV</option>
          <option value="EMAIL">Email</option>
          <option value="SUPPORT">Support</option>
          <option value="APP_STORE">App Store</option>
          <option value="SURVEY">Survey</option>
        </select>

        <select className="input h-11 md:col-span-2" value={props.theme} onChange={(e) => props.onTheme(e.target.value)}>
          <option value="">All themes</option>
          <option value="Dashboard & Analytics">Dashboard & Analytics</option>
          <option value="Checkout & Payments">Checkout & Payments</option>
          <option value="Mobile Experience">Mobile Experience</option>
          <option value="Customer Support">Customer Support</option>
          <option value="Search & Discovery">Search & Discovery</option>
          <option value="Billing">Billing</option>
          <option value="Customization">Customization</option>
        </select>
      </div>
    </div>
  );
}
