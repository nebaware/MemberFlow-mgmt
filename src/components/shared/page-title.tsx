import type React from 'react';

interface PageTitleProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageTitle({ title, description, children }: PageTitleProps) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="sm:ml-auto flex items-center gap-2">{children}</div>}
    </div>
  );
}
