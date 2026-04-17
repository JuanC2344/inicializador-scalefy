"use client";

import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/(auth)/actions";

interface UserMenuProps {
  nombre: string | null;
  rol: string;
}

export function UserMenu({ nombre, rol }: UserMenuProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-sm">
        <User className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{nombre ?? "Admin"}</span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground capitalize">
          {rol}
        </span>
      </div>
      <form action={logout}>
        <Button variant="ghost" size="sm" type="submit" className="gap-1.5 text-muted-foreground">
          <LogOut className="h-4 w-4" />
          Salir
        </Button>
      </form>
    </div>
  );
}
