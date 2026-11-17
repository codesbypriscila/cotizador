import {
  BellRing,
  Blocks,
  CalendarCheck,
  Camera,
  Circle,
  Code,
  CreditCard,
  Files,
  Globe,
  LayoutDashboard,
  LayoutTemplate,
  LockKeyhole,
  type LucideIcon,
  type LucideProps,
  Mail,
  MessageCircle,
  Monitor,
  Palette,
  Rocket,
  Search,
  ShoppingBag,
  Smartphone,
  Utensils,
  Wrench,
} from "lucide-react";

// Icons available for catalog items. The admin picks one of these by name.
export const CATALOG_ICONS: Record<string, LucideIcon> = {
  monitor: Monitor,
  "layout-template": LayoutTemplate,
  "shopping-bag": ShoppingBag,
  smartphone: Smartphone,
  "layout-dashboard": LayoutDashboard,
  blocks: Blocks,
  files: Files,
  "calendar-check": CalendarCheck,
  "credit-card": CreditCard,
  "lock-keyhole": LockKeyhole,
  "bell-ring": BellRing,
  globe: Globe,
  wrench: Wrench,
  "message-circle": MessageCircle,
  mail: Mail,
  search: Search,
  palette: Palette,
  camera: Camera,
  utensils: Utensils,
  rocket: Rocket,
  code: Code,
};

export function CatalogIcon({ name, ...props }: { name: string } & LucideProps) {
  const Cmp = CATALOG_ICONS[name] ?? Circle;
  return <Cmp {...props} />;
}
