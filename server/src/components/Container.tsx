export function Container({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      {subtitle ? <p className="mt-2 text-muted-foreground">{subtitle}</p> : null}
      <div className="mt-8">{children}</div>
    </div>
  );
}
