export type NavItem = {
  title: string;
  href: string;
  icon: string;
  roles?: string[];
};

export type DashboardCard = {
  title: string;
  value: string | number;
  description?: string;
  icon: string;
  href: string;
  color: string;
};
