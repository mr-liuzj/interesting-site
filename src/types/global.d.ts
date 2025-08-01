interface MenuItem {
  path: string;
  pathname?: string;
  icon?: string;
  title: string;
  component?: () => Promise<DefineComponent>;
  children?: MenuItem[];
}
