export function Badge({
  children,
  tone = "neutral"
}: {
  children: React.ReactNode;
  tone?: "neutral" | "positive" | "negative" | "warning";
}) {
  const classes = {
    neutral: "bg-muted text-muted-foreground",
    positive: "bg-emerald-50 text-emerald-700",
    negative: "bg-rose-50 text-rose-700",
    warning: "bg-amber-50 text-amber-700"
  }[tone];

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}>
      {children}
    </span>
  );
}
