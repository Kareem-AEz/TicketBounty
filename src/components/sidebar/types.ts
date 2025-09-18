export type SidebarItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  separator?: boolean;
  basePath?: string; // For matching active state on sub-routes
};
