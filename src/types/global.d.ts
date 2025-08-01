interface MenuItem {
  path: string;
  pathname?: string;
  icon?: string;
  title?: string;
  children?: MenuItem[];
}
