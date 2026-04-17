"use client";

import { useActionState } from "react";
import { Trash2, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { eliminarInsumo, registrarMovimiento, type StockState } from "@/app/dashboard/stock/actions";

interface StockItem {
  id: string;
  nombre: string;
  unidad: string;
  stock_actual: number;
  stock_minimo: number;
}

interface Props {
  item: StockItem;
}

const initialState: StockState = {};

export function InsumoRow({ item }: Props) {
  const [state, action, pending] = useActionState(registrarMovimiento, initialState);
  const esCritico = item.stock_actual <= item.stock_minimo;

  return (
    <div
      className={`rounded-lg border p-4 space-y-3 ${
        esCritico ? "border-red-300 bg-red-50" : "bg-card"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold">{item.nombre}</p>
            {esCritico && (
              <span className="flex items-center gap-1 text-xs text-red-700 font-medium">
                <AlertTriangle className="h-3.5 w-3.5" />
                Stock bajo
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Stock actual:{" "}
            <span className={`font-mono font-bold ${esCritico ? "text-red-700" : ""}`}>
              {item.stock_actual}
            </span>{" "}
            {item.unidad} · Mínimo: {item.stock_minimo} {item.unidad}
          </p>
        </div>
        <form action={eliminarInsumo.bind(null, item.id)}>
          <Button type="submit" variant="ghost" size="icon" aria-label={`Eliminar ${item.nombre}`} className="h-8 w-8 text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* Movimiento rápido */}
      <form action={action} className="flex flex-wrap items-end gap-2">
        <input type="hidden" name="stock_item_id" value={item.id} />

        <div className="space-y-1">
          <Label htmlFor={`tipo-${item.id}`} className="text-xs">Movimiento</Label>
          <Select name="tipo" defaultValue="entrada">
            <SelectTrigger id={`tipo-${item.id}`} className="w-32 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entrada">
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-green-600" /> Entrada
                </span>
              </SelectItem>
              <SelectItem value="salida">
                <span className="flex items-center gap-1">
                  <TrendingDown className="h-3.5 w-3.5 text-red-600" /> Salida
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor={`cant-${item.id}`} className="text-xs">Cantidad</Label>
          <Input
            id={`cant-${item.id}`}
            name="cantidad"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0"
            className="w-24 h-8 text-sm"
            required
          />
        </div>

        <div className="space-y-1 flex-1 min-w-[120px]">
          <Label htmlFor={`nota-${item.id}`} className="text-xs">Nota (opcional)</Label>
          <Input
            id={`nota-${item.id}`}
            name="nota"
            placeholder="ej: compra semanal"
            className="h-8 text-sm"
          />
        </div>

        <Button type="submit" size="sm" className="h-8" disabled={pending}>
          {pending ? "…" : "Registrar"}
        </Button>
      </form>

      {state.error && (
        <p className="text-xs text-destructive">{state.error}</p>
      )}
    </div>
  );
}
