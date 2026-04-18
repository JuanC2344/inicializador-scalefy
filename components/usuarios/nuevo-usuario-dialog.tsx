"use client";

import { useActionState, useEffect, useState } from "react";
import { crearUsuario } from "@/app/dashboard/usuarios/actions";
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

const initialState = { error: undefined, success: false };

interface Props {
  trigger?: React.ReactNode;
}

export function NuevoUsuarioDialog({ trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(crearUsuario, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success("Mozo creado correctamente");
      setOpen(false);
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Nuevo mozo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar mozo</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" name="nombre" placeholder="Ej: Juan García" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="numero">Número (0-999)</Label>
            <Input
              id="numero"
              name="numero"
              type="number"
              min={0}
              max={999}
              placeholder="Ej: 1"
              required
            />
            <p className="text-xs text-muted-foreground">
              El mozo usará este número para ingresar al sistema.
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Creando..." : "Crear mozo"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
