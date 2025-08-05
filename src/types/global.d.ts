interface MenuItem {
  path: string;
  pathname?: string;
  icon?: string;
  title: string;
  component?: () => Promise<DefineComponent>;
  children?: MenuItem[];
}

interface Window {
  __graph?: import('@antv/g6').Graph;
}
