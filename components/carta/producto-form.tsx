"use client";

import { useActionState, useEffect } from "react";
import { crearProducto, actualizarProducto, type CartaState } from "@/app/dashboard/carta/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Categoria {
  id: string;
  nombre: string;
}

interface Producto {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  imagen_url: string | null;
  categoria_id: string | null;
  activo: boolean;
}

interface Props {
  categorias: Categoria[];
  producto?: Producto;
  onSuccess?: () => void;
}

const initial: CartaState = {};

export function ProductoForm({ categorias, producto, onSuccess }: Props) {
  // bind solo el id — _prev y formData los maneja useActionState
  const action = producto
    ? actualizarProducto.bind(null, producto.id)
    : crearProducto;

  const [state, formAction, pending] = useActionState(action, initial);

  useEffect(() => {
    if (state.success) {
      toast.success(producto ? "Producto actualizado" : "Producto creado");
      onSuccess?.();
    }
    if (state.error) toast.error(state.error);
  }, [state, onSuccess, producto]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre *</Label>
        <Input
          id="nombre"
          name="nombre"
          defaultValue={producto?.nombre}
          required
          disabled={pending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea
          id="descripcion"
          name="descripcion"
          defaultValue={producto?.descripcion ?? ""}
          rows={2}
          disabled={pending}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="precio">Precio *</Label>
          <Input
            id="precio"
            name="precio"
            type="number"
            step="0.01"
            min={0}
            defaultValue={producto?.precio ?? ""}
            required
            disabled={pending}
          />
        </div>

        <div className="space-y-2">
          <Label>Categoría</Label>
          <Select name="categoria_id" defaultValue={producto?.categoria_id ?? "none"}>
            <SelectTrigger disabled={pending}>
              <SelectValue placeholder="Sin categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin categoría</SelectItem>
              {categorias.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="imagen_url">URL de imagen (opcional)</Label>
        <Input
          id="imagen_url"
          name="imagen_url"
          type="url"
          placeholder="https://..."
          defaultValue={producto?.imagen_url ?? ""}
          disabled={pending}
        />
      </div>

      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending
          ? "Guardando..."
          : producto
            ? "Guardar cambios"
            : "Crear producto"}
      </Button>
    </form>
  );
}
