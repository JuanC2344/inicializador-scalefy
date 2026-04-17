"use client";

import { useTransition } from "react";
import { Clock, ChefHat, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cambiarEstadoCocina } from "@/app/mozo/mesa/[id]/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Comanda } from "@/hooks/use-comandas-realtime";

const estadoConfig = {
  pendiente: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  en_preparacion: { label: "En preparación", className: "bg-blue-100 text-blue-800 border-blue-200" },
  listo: { label: "Listo", className: "bg-green-100 text-green-800 border-green-200" },
  entregado: { label: "Entregado", className: "bg-gray-100 text-gray-700 border-gray-200" },
  cerrado: { label: "Cerrado", className: "bg-gray-100 text-gray-500 border-gray-200" },
};

function tiempoTranscurrido(fecha: string) {
  const diff = Math.floor((Date.now() - new Date(fecha).getTime()) / 60000);
  if (diff < 1) return "hace un momento";
  if (diff === 1) return "hace 1 min";
  return `hace ${diff} min`;
}

export function ComandaCard({ comanda }: { comanda: Comanda }) {
  const [pending, startTransition] = useTransition();
  const config = estadoConfig[comanda.estado];

  function handleAvanzar() {
    const siguiente = comanda.estado === "pendiente" ? "en_preparacion" : "listo";
    startTransition(async () => {
      const res = await cambiarEstadoCocina(comanda.id, siguiente);
      if (res.error) toast.error(res.error);
    });
  }

  const puedeAvanzar = comanda.estado === "pendiente" || comanda.estado === "en_preparacion";

  return (
    <div
      className={cn(
        "rounded-xl border-2 bg-card p-4 flex flex-col gap-3 shadow-sm transition-opacity",
        comanda.estado === "pendiente" && "border-yellow-300",
        comanda.estado === "en_preparacion" && "border-blue-300",
        comanda.estado === "listo" && "border-green-300 opacity-70",
        pending && "opacity-40",
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-bold text-lg">{comanda.mesas?.nombre ?? "Mesa?"}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {tiempoTranscurrido(comanda.creado_en)}
          </p>
        </div>
        <Badge className={cn("text-xs border", config.className)}>{config.label}</Badge>
      </div>

      {/* Items */}
      <ul className="space-y-1 border-t pt-2">
        {comanda.pedido_items.map((item) => (
          <li key={item.id} className="flex justify-between text-sm">
            <span>
              <span className="font-semibold">{item.cantidad}×</span>{" "}
              {item.productos?.nombre ?? "Producto"}
            </span>
            {item.nota && (
              <span className="text-xs text-muted-foreground italic ml-2 line-clamp-1">
                {item.nota}
              </span>
            )}
          </li>
        ))}
      </ul>

      {/* Acción */}
      {puedeAvanzar && (
        <Button
          size="sm"
          className="w-full gap-1.5"
          onClick={handleAvanzar}
          disabled={pending}
          variant={comanda.estado === "pendiente" ? "default" : "outline"}
        >
          {comanda.estado === "pendiente" ? (
            <>
              <ChefHat className="h-4 w-4" />
              Comenzar preparación
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Marcar listo
            </>
          )}
        </Button>
      )}
    </div>
  );
}
