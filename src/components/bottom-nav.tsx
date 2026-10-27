import { Link } from "@tanstack/react-router";
import { History, MessageCircle, Settings2 } from "lucide-react";

const ITEMS = [
  { to: "/" as const, label: "Assistant", icon: MessageCircle },
  { to: "/history" as const, label: "History", icon: History },
  { to: "/settings" as const, label: "Settings", icon: Settings2 },
];

export function BottomNav() {
  return (
    <nav className="pb-safe glass-strong mx-4 mb-3 flex items-center justify-around rounded-3xl px-2 pt-2">
      {ITEMS.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className="flex min-w-[76px] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-semibold text-muted-foreground transition data-[status:active]:bg-electric/10 data-[status:active]:text-electric"
          activeProps={{ "data-status": "active" }}
          activeOptions={{ exact: item.to === "/" }}
        >
          <item.icon className="size-5" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
