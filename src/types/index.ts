import type { ReactNode } from "react";

export type NavItem = {
  title: string;
  href: string;
  icon: ReactNode;
  roles?: string[];
  children?: NavItem[];
};

export type DashboardCard = {
  title: string;
  value: string | number;
  description?: string;
  icon: ReactNode;
  href: string;
  color: string;
};
