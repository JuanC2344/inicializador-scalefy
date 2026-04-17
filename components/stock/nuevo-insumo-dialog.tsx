"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
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
import { crearInsumo, type StockState } from "@/app/dashboard/stock/actions";

const initialState: StockState = {};

export function NuevoInsumoDialog() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(
    async (prev: StockState, formData: FormData) => {
      const result = await crearInsumo(prev, formData);
      if (result.success) setOpen(false);
      return result;
    },
    initialState,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Nuevo insumo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Nuevo insumo</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" name="nombre" placeholder="ej: Harina" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="unidad">Unidad</Label>
            <Input id="unidad" name="unidad" placeholder="ej: kg, litros, unidades" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="stock_actual">Stock actual</Label>
              <Input
                id="stock_actual"
                name="stock_actual"
                type="number"
                min="0"
                step="0.01"
                defaultValue="0"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="stock_minimo">Stock mínimo</Label>
              <Input
                id="stock_minimo"
                name="stock_minimo"
                type="number"
                min="0"
                step="0.01"
                defaultValue="0"
              />
            </div>
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Guardando…" : "Crear insumo"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
