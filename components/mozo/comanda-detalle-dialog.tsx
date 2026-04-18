"use client";

import { useState } from "react";
import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface ItemDetalle {
  id: string;
  cantidad: number;
  precio_unitario: number;
  nota: string | null;
  producto_nombre: string;
}

export interface PedidoDetalle {
  id: string;
  estado: string;
  total: number;
  creado_en: string;
  mozo_nombre: string;
  items: ItemDetalle[];
}

interface Props {
  pedidos: PedidoDetalle[];
  mesaNombre: string;
}

const estadoBadge: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-800 border-yellow-200",
  en_preparacion: "bg-blue-100 text-blue-800 border-blue-200",
  listo: "bg-green-100 text-green-800 border-green-200",
  entregado: "bg-gray-100 text-gray-700 border-gray-200",
};

const estadoLabel: Record<string, string> = {
  pendiente: "Pendiente",
  en_preparacion: "En preparación",
  listo: "Listo",
  entregado: "Entregado",
};

export function ComandaDetalleDialog({ pedidos, mesaNombre }: Props) {
  const [open, setOpen] = useState(false);

  if (pedidos.length === 0) return null;

  const totalGeneral = pedidos.reduce((s, p) => s + p.total, 0);
  const totalItems = pedidos.reduce(
    (s, p) => s + p.items.reduce((si, i) => si + i.cantidad, 0),
    0,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <ClipboardList className="h-4 w-4" />
          Ver comanda ({totalItems} item{totalItems !== 1 ? "s" : ""})
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Comanda — {mesaNombre}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-1">
          {pedidos.map((pedido, idx) => (
            <div key={pedido.id} className="space-y-2">
              {pedidos.length > 1 && (
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Ronda {idx + 1}
                </p>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Mozo: <span className="text-foreground font-medium">{pedido.mozo_nombre}</span>
                </span>
                <Badge className={cn("text-xs border", estadoBadge[pedido.estado] ?? "")}>
                  {estadoLabel[pedido.estado] ?? pedido.estado}
                </Badge>
              </div>

              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 text-xs text-muted-foreground">
                      <th className="text-left px-3 py-2">Producto</th>
                      <th className="text-center px-2 py-2">Cant.</th>
                      <th className="text-right px-3 py-2">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedido.items.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="px-3 py-2">
                          <p className="font-medium">{item.producto_nombre}</p>
                          {item.nota && (
                            <p className="text-xs text-muted-foreground italic">{item.nota}</p>
                          )}
                        </td>
                        <td className="px-2 py-2 text-center text-muted-foreground">
                          ×{item.cantidad}
                        </td>
                        <td className="px-3 py-2 text-right">
                          ${(item.precio_unitario * item.cantidad).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t bg-muted/30">
                      <td colSpan={2} className="px-3 py-2 text-sm font-semibold">
                        Total ronda
                      </td>
                      <td className="px-3 py-2 text-right font-semibold">
                        ${pedido.total.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ))}

          {pedidos.length > 1 && (
            <div className="flex justify-between items-center border-t pt-3 font-bold text-base">
              <span>Total general</span>
              <span>${totalGeneral.toFixed(2)}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
