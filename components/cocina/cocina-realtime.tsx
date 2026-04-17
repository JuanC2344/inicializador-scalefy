"use client";

import { ChefHat } from "lucide-react";
import { useComandasRealtime } from "@/hooks/use-comandas-realtime";
import { ComandaCard } from "./comanda-card";

const ORDEN_ESTADO = ["pendiente", "en_preparacion", "listo"];

export function CocinaRealtime() {
  const { comandas, loading } = useComandasRealtime(true);

  const activas = comandas.filter((c) =>
    ORDEN_ESTADO.includes(c.estado),
  );

  return (
    <div className="min-h-screen bg-background p-4">
      <header className="flex items-center gap-2 mb-6">
        <ChefHat className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Cocina</h1>
        {!loading && (
          <span className="ml-auto text-sm text-muted-foreground">
            {activas.length} comanda{activas.length !== 1 ? "s" : ""} activa{activas.length !== 1 ? "s" : ""}
          </span>
        )}
      </header>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">Cargando comandas…</div>
      ) : activas.length === 0 ? (
        <div className="rounded-lg border border-dashed p-16 text-center text-muted-foreground text-lg">
          ✓ Sin comandas pendientes
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {activas.map((comanda) => (
            <ComandaCard key={comanda.id} comanda={comanda} />
          ))}
        </div>
      )}
    </div>
  );
}
