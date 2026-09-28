interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  eyebrow?: string;
}

export function PageHeader({
  title,
  description,
  action,
  eyebrow = "WORKSPACE",
}: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#7c8da3] dark:text-[#8292a8]">
          {eyebrow}
        </p>
        <h1 className="text-[28px] font-bold tracking-tight text-[#17263a] dark:text-[#f3f6fb]">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-[#718096] dark:text-[#9aa8ba]">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
