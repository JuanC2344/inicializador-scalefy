"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  cambiarEstadoMesa,
  eliminarMesa,
  asignarMozo,
} from "@/app/dashboard/mesas/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Mesa {
  id: string;
  nombre: string;
  capacidad: number;
  estado: "libre" | "ocupada" | "en_cuenta";
}

interface Mozo {
  id: string;
  email: string;
}

const estadoConfig = {
  libre: {
    label: "Libre",
    badgeClass: "bg-green-100 text-green-800 border-green-200",
    border: "border-green-400",
    hover: "hover:bg-green-50 dark:hover:bg-green-950/20",
  },
  ocupada: {
    label: "Ocupada",
    badgeClass: "bg-red-100 text-red-800 border-red-200",
    border: "border-red-400",
    hover: "hover:bg-red-50 dark:hover:bg-red-950/20",
  },
  en_cuenta: {
    label: "En cuenta",
    badgeClass: "bg-yellow-100 text-yellow-800 border-yellow-200",
    border: "border-yellow-400",
    hover: "hover:bg-yellow-50 dark:hover:bg-yellow-950/20",
  },
};

const siguienteEstado: Record<Mesa["estado"], Mesa["estado"]> = {
  libre: "ocupada",
  ocupada: "en_cuenta",
  en_cuenta: "libre",
};

function nombreMozo(email: string) {
  const match = email.match(/^mozo(\d+)@/);
  return match ? `Mozo ${match[1]}` : email;
}

export function MesaCard({ mesa, mozos }: { mesa: Mesa; mozos: Mozo[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const cfg = estadoConfig[mesa.estado];

  function handleCardClick() {
    if (mesa.estado === "libre") setDialogOpen(true);
  }

  function handleSeleccionarMozo(mozoId: string) {
    startTransition(async () => {
      const res = await asignarMozo(mesa.id, mozoId);
      if (res.error) {
        toast.error(res.error);
      } else {
        setDialogOpen(false);
        router.push(`/dashboard/mozo/mesa/${mesa.id}`);
      }
    });
  }

  function handleCambiarEstado(e: React.MouseEvent) {
    e.stopPropagation();
    startTransition(async () => {
      const res = await cambiarEstadoMesa(mesa.id, siguienteEstado[mesa.estado]);
      if (res.error) toast.error(res.error);
    });
  }

  function handleEliminar(e: React.MouseEvent) {
    e.stopPropagation();
    startTransition(async () => {
      const res = await eliminarMesa(mesa.id);
      if (res.error) toast.error(res.error);
      else toast.success(`Mesa "${mesa.nombre}" eliminada`);
    });
  }

  return (
    <>
      <div
        onClick={handleCardClick}
        className={cn(
          "rounded-xl border-2 bg-card p-4 shadow-sm flex flex-col gap-3 transition-colors",
          cfg.border,
          cfg.hover,
          mesa.estado === "libre" && "cursor-pointer",
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
          <Badge className={cn("text-xs border", cfg.badgeClass)}>
            {cfg.label}
          </Badge>
        </div>

        <div className="flex gap-2 mt-auto">
          {mesa.estado !== "libre" && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs"
              onClick={handleCambiarEstado}
              disabled={pending}
            >
              → {estadoConfig[siguienteEstado[mesa.estado]].label}
            </Button>
          )}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar mozo — {mesa.nombre}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 pt-2">
            {mozos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay mozos disponibles. Creá uno desde Usuarios.
              </p>
            ) : (
              mozos.map((mozo) => (
                <Button
                  key={mozo.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleSeleccionarMozo(mozo.id)}
                  disabled={pending}
                >
                  {nombreMozo(mozo.email)}
                </Button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
