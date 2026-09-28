export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "positive" | "negative" | "warning";
}) {
  const classes = {
    neutral:
      "bg-[#eef2f6] text-[#56667b] dark:bg-[#202b3a] dark:text-[#b8c5d5]",
    positive:
      "bg-[#eaf8f1] text-[#16835a] dark:bg-[#103326] dark:text-[#62d6a2]",
    negative:
      "bg-[#fff0f1] text-[#c93e4a] dark:bg-[#3a1d24] dark:text-[#ff8d98]",
    warning:
      "bg-[#fff7e6] text-[#a66a00] dark:bg-[#3b2d12] dark:text-[#f4c55f]",
  }[tone];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide ${classes}`}
    >
      {children}
    </span>
  );
}
