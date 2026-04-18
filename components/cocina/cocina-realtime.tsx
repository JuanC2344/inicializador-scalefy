"use client";

import { useState } from "react";
import { ChefHat, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { useComandasRealtime } from "@/hooks/use-comandas-realtime";
import { ComandaCard } from "./comanda-card";

interface CocinaRealtimeProps {
  embedded?: boolean;
}

export function CocinaRealtime({ embedded = false }: CocinaRealtimeProps) {
  const { comandas, loading } = useComandasRealtime(true);
  const [listasOpen, setListasOpen] = useState(false);

  const enCurso = comandas.filter((c) =>
    ["pendiente", "en_preparacion"].includes(c.estado),
  );
  const listas = comandas.filter((c) => c.estado === "listo");

  return (
    <div className={embedded ? "space-y-6" : "min-h-screen bg-background p-4 space-y-8"}>
      {/* Header — solo en vista standalone */}
      {!embedded && (
        <header className="flex items-center gap-2">
          <ChefHat className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Cocina</h1>
          {!loading && (
            <span className="ml-auto text-sm text-muted-foreground">
              {enCurso.length} en curso · {listas.length} lista{listas.length !== 1 ? "s" : ""}
            </span>
          )}
        </header>
      )}
      {embedded && !loading && (
        <p className="text-sm text-muted-foreground">
          {enCurso.length} en curso · {listas.length} lista{listas.length !== 1 ? "s" : ""}
        </p>
      )}

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">Cargando comandas…</div>
      ) : (
        <>
          {/* ── Comandas en curso ── */}
          {enCurso.length === 0 ? (
            <div className="rounded-lg border border-dashed p-16 text-center text-muted-foreground text-lg">
              ✓ Sin comandas pendientes
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {enCurso.map((comanda) => (
                <ComandaCard key={comanda.id} comanda={comanda} />
              ))}
            </div>
          )}

          {/* ── Sección "Comandas listas" colapsable ── */}
          <div className="border rounded-xl overflow-hidden">
            <button
              onClick={() => setListasOpen((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-4 bg-green-50 hover:bg-green-100 transition-colors"
            >
              <div className="flex items-center gap-2 text-green-800 font-semibold">
                <CheckCircle2 className="h-5 w-5" />
                Comandas listas para entregar
                <span className="rounded-full bg-green-200 text-green-900 text-xs px-2 py-0.5">
                  {listas.length}
                </span>
              </div>
              {listasOpen ? (
                <ChevronUp className="h-5 w-5 text-green-700" />
              ) : (
                <ChevronDown className="h-5 w-5 text-green-700" />
              )}
            </button>

            {listasOpen && (
              <div className="p-4 bg-background">
                {listas.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-6">
                    No hay comandas listas aún.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {listas.map((comanda) => (
                      <ComandaCard key={comanda.id} comanda={comanda} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
