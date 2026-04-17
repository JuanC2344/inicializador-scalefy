"use client";

import { useActionState, useEffect } from "react";
import { crearMesa } from "@/app/dashboard/mesas/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useState } from "react";
import type { MesaState } from "@/app/dashboard/mesas/actions";

const initial: MesaState = {};

export function NuevaMesaDialog() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(crearMesa, initial);

  useEffect(() => {
    if (state.success) {
      toast.success("Mesa creada");
      setOpen(false);
    }
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Nueva mesa
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar mesa</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre / número</Label>
            <Input
              id="nombre"
              name="nombre"
              placeholder="Ej: Mesa 1, Barra, VIP"
              required
              disabled={pending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="capacidad">Capacidad (personas)</Label>
            <Input
              id="capacidad"
              name="capacidad"
              type="number"
              min={1}
              defaultValue={4}
              disabled={pending}
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Guardando..." : "Crear mesa"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
