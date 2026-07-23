export function PageHeader({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="sticky top-14 z-10 flex h-16 items-center justify-between gap-3 border-b border-gray-200 bg-white px-5 lg:top-0 lg:px-8">
      <h1 className="text-lg font-bold tracking-tight">{title}</h1>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </header>
  );
}
