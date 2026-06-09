import { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "./button";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  backHref?: string;
};

export function PageHeader({ title, subtitle, actions, backHref }: PageHeaderProps) {
  return (
    <div className="animate-fade-in-up flex items-center justify-between">
      <div className="flex items-center gap-4">
        {backHref && (
          <Link href={backHref}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900 dark:text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-navy-300 dark:text-white/40">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ icon, message }: { icon: ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-navy-300 dark:text-white/30">
      {icon}
      <p className="text-sm">{message}</p>
    </div>
  );
}
