"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Settings, Sun, Moon, UserPlus, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { NuevoUsuarioDialog } from "@/components/usuarios/nuevo-usuario-dialog";

export function ConfigMenu() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <div className="relative">
      {/* Submenú */}
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-1 rounded-lg border bg-card shadow-lg overflow-hidden">
          {/* Toggle tema */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 shrink-0" />
            ) : (
              <Moon className="h-4 w-4 shrink-0" />
            )}
            {theme === "dark" ? "Modo claro" : "Modo oscuro"}
          </button>

          {/* Agregar mozo — reutiliza NuevoUsuarioDialog */}
          <div className="border-t">
            <div className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground">
              <UserPlus className="h-4 w-4 shrink-0" />
              <NuevoUsuarioDialog trigger={
                <span className="hover:text-foreground transition-colors cursor-pointer">
                  Agregar mozo
                </span>
              } />
            </div>
          </div>
        </div>
      )}

      {/* Botón principal */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
          open
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <Settings className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">Configuración</span>
        <ChevronUp
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            !open && "rotate-180",
          )}
        />
      </button>
    </div>
  );
}
