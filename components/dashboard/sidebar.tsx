"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutGrid,
  BookOpen,
  ClipboardList,
  CreditCard,
  Package,
  BarChart2,
  ChefHat,
  Users,
  UtensilsCrossed,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfigMenu } from "@/components/dashboard/config-menu";

const links = [
  { href: "/dashboard", label: "Inicio", icon: Home, exact: true },
  { href: "/dashboard/mesas", label: "Mesas", icon: LayoutGrid },
  { href: "/dashboard/mozo", label: "Mozo", icon: UtensilsCrossed },
  { href: "/dashboard/cocina", label: "Cocina", icon: Flame },
  { href: "/dashboard/carta", label: "Carta", icon: BookOpen },
  { href: "/dashboard/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/dashboard/caja", label: "Caja", icon: CreditCard },
  { href: "/dashboard/stock", label: "Stock", icon: Package },
  { href: "/dashboard/usuarios", label: "Usuarios", icon: Users },
  { href: "/dashboard/reportes", label: "Reportes", icon: BarChart2 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-56 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex items-center gap-2 border-b px-4 py-4">
        <ChefHat className="h-6 w-6 text-primary" />
        <span className="font-semibold text-lg">GastroAdmin</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Configuración */}
      <div className="border-t p-2">
        <ConfigMenu />
      </div>
    </aside>
  );
}
