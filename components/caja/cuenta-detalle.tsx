"use client";

import { useState, useTransition } from "react";
import { cerrarCuenta, type MedioPago } from "@/app/dashboard/caja/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CreditCard, Banknote, ReceiptText } from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

// PDF solo en cliente (react-pdf no soporta SSR)
const DescargarTicket = dynamic(
  () => import("@/lib/pdf/ticket").then((m) => m.DescargarTicket),
  { ssr: false, loading: () => <Button variant="outline" disabled>Cargando PDF…</Button> },
);

interface Item {
  id: string;
  cantidad: number;
  precio_unitario: number;
  nota: string | null;
  productos: { nombre: string } | null;
}

interface Pedido {
  id: string;
  total: number;
  creado_en: string;
  pedido_items: Item[];
}

interface Props {
  mesaId: string;
  mesaNombre: string;
  pedidos: Pedido[];
}

const medios: { value: MedioPago; label: string; icon: React.ElementType }[] = [
  { value: "efectivo", label: "Efectivo", icon: Banknote },
  { value: "tarjeta", label: "Tarjeta", icon: CreditCard },
  { value: "otros", label: "Otros", icon: ReceiptText },
];

export function CuentaDetalle({ mesaId, mesaNombre, pedidos }: Props) {
  const [descuento, setDescuento] = useState(0);
  const [medioPago, setMedioPago] = useState<MedioPago>("efectivo");
  const [cerrado, setCerrado] = useState(false);
  const [pending, startTransition] = useTransition();

  const subtotal = pedidos.reduce((s, p) => s + (p.total ?? 0), 0);
  const total = Math.max(0, subtotal - descuento);

  // Todos los items aplanados para el ticket
  const todosLosItems = pedidos.flatMap((p) =>
    p.pedido_items.map((i) => ({
      nombre: i.productos?.nombre ?? "Producto",
      cantidad: i.cantidad,
      precioUnitario: i.precio_unitario,
      nota: i.nota,
    })),
  );

  function handleCerrar() {
    startTransition(async () => {
      const res = await cerrarCuenta(mesaId, descuento, medioPago);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Cuenta cerrada. Mesa liberada ✓");
        setCerrado(true);
      }
    });
  }

  if (cerrado) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-green-50 border border-green-200 p-6 text-center">
          <p className="text-green-800 font-semibold text-lg">✓ Cuenta cerrada</p>
          <p className="text-green-700 text-sm">Mesa {mesaNombre} liberada.</p>
        </div>
        <DescargarTicket
          mesa={mesaNombre}
          items={todosLosItems}
          subtotal={subtotal}
          descuento={descuento}
          total={total}
          medioPago={medioPago}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg">
      {/* Detalle de items */}
      <div className="rounded-lg border overflow-hidden">
        <div className="bg-muted/50 px-4 py-2 text-sm font-medium">
          Items consumidos
        </div>
        <table className="w-full text-sm">
          <tbody className="divide-y">
            {pedidos.map((pedido) =>
              pedido.pedido_items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-2">
                    {item.cantidad}× {item.productos?.nombre ?? "—"}
                    {item.nota && (
                      <span className="text-xs text-muted-foreground ml-1">({item.nota})</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right font-mono">
                    €{(item.cantidad * item.precio_unitario).toFixed(2)}
                  </td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>

      {/* Descuento */}
      <div className="space-y-2">
        <Label htmlFor="descuento">Descuento (€)</Label>
        <Input
          id="descuento"
          type="number"
          min={0}
          max={subtotal}
          step={0.01}
          value={descuento}
          onChange={(e) => setDescuento(parseFloat(e.target.value) || 0)}
          className="w-32"
        />
      </div>

      {/* Totales */}
      <div className="space-y-1 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>€{subtotal.toFixed(2)}</span>
        </div>
        {descuento > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>Descuento</span>
            <span>-€{descuento.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-lg border-t pt-2">
          <span>Total</span>
          <span>€{total.toFixed(2)}</span>
        </div>
      </div>

      {/* Medio de pago */}
      <div className="space-y-2">
        <Label>Medio de pago</Label>
        <div className="flex gap-2">
          {medios.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setMedioPago(value)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 rounded-lg border py-3 text-xs transition-colors",
                medioPago === value
                  ? "border-primary bg-primary/5 text-primary"
                  : "hover:bg-muted",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          className="flex-1"
          onClick={handleCerrar}
          disabled={pending || !pedidos.length}
        >
          {pending ? "Cerrando..." : "Cerrar cuenta"}
        </Button>
        <DescargarTicket
          mesa={mesaNombre}
          items={todosLosItems}
          subtotal={subtotal}
          descuento={descuento}
          total={total}
          medioPago={medioPago}
        />
      </div>
    </div>
  );
}
