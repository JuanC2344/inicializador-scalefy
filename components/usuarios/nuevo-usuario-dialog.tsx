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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus } from "lucide-react";

const initialState = { error: undefined, success: false };

interface Props {
  trigger?: React.ReactNode;
}

export function NuevoUsuarioDialog({ trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [rol, setRol] = useState("mozo");
  const [state, action, pending] = useActionState(crearUsuario, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success("Usuario creado correctamente");
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
            Nuevo usuario
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear usuario</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" name="nombre" placeholder="Ej: Juan García" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="juan@local.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" placeholder="Mínimo 6 caracteres" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rol">Rol</Label>
            <Select name="rol" value={rol} onValueChange={setRol}>
              <SelectTrigger id="rol">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="mozo">Mozo</SelectItem>
                <SelectItem value="cocina">Cocina</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Creando..." : "Crear usuario"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
