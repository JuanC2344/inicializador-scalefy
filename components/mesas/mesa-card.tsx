"use client";

import { useTransition } from "react";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cambiarEstadoMesa, eliminarMesa } from "@/app/dashboard/mesas/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Mesa {
  id: string;
  nombre: string;
  capacidad: number;
  estado: "libre" | "ocupada" | "en_cuenta";
}

const estadoConfig = {
  libre: { label: "Libre", className: "bg-green-100 text-green-800 border-green-200" },
  ocupada: { label: "Ocupada", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  en_cuenta: { label: "En cuenta", className: "bg-red-100 text-red-800 border-red-200" },
};

const borderColor = {
  libre: "border-green-300",
  ocupada: "border-yellow-300",
  en_cuenta: "border-red-300",
};

export function MesaCard({ mesa }: { mesa: Mesa }) {
  const [pending, startTransition] = useTransition();
  const config = estadoConfig[mesa.estado];

  const siguienteEstado: Record<Mesa["estado"], Mesa["estado"]> = {
    libre: "ocupada",
    ocupada: "en_cuenta",
    en_cuenta: "libre",
  };

  function handleCambiarEstado() {
    startTransition(async () => {
      const res = await cambiarEstadoMesa(mesa.id, siguienteEstado[mesa.estado]);
      if (res.error) toast.error(res.error);
    });
  }

  function handleEliminar() {
    startTransition(async () => {
      const res = await eliminarMesa(mesa.id);
      if (res.error) toast.error(res.error);
      else toast.success(`Mesa "${mesa.nombre}" eliminada`);
    });
  }

  return (
    <div
      className={cn(
        "rounded-xl border-2 bg-card p-4 shadow-sm flex flex-col gap-3 transition-opacity",
        borderColor[mesa.estado],
        pending && "opacity-50",
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-base">{mesa.nombre}</h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <Users className="h-3 w-3" />
            {mesa.capacidad} personas
          </div>
        </div>
        <Badge className={cn("text-xs border", config.className)}>
          {config.label}
        </Badge>
      </div>

      <div className="flex gap-2 mt-auto">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 text-xs"
          onClick={handleCambiarEstado}
          disabled={pending}
        >
          → {estadoConfig[siguienteEstado[mesa.estado]].label}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-xs text-destructive hover:text-destructive"
          onClick={handleEliminar}
          disabled={pending}
        >
          Eliminar
        </Button>
      </div>
    </div>
  );
}
