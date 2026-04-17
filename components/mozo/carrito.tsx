"use client";

import { useState, useTransition } from "react";
import { ShoppingCart, Plus, Minus, Trash2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { crearPedido } from "@/app/mozo/mesa/[id]/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  categoria_id: string | null;
}

interface ItemCarrito {
  producto: Producto;
  cantidad: number;
  nota: string;
}

interface Props {
  productos: Producto[];
  mesaId: string;
  mesaNombre: string;
}

export function Carrito({ productos, mesaId, mesaNombre }: Props) {
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [pending, startTransition] = useTransition();

  // Categorías únicas de los productos
  const categorias = Array.from(
    new Map(
      productos
        .filter((p) => p.categoria_id)
        .map((p) => [p.categoria_id, p.categoria_id]),
    ).values(),
  );

  const productosFiltrados = productos.filter((p) => {
    const matchCat = categoriaActiva === null || p.categoria_id === categoriaActiva;
    const matchBusq = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return matchCat && matchBusq;
  });

  function agregar(producto: Producto) {
    setItems((prev) => {
      const existe = prev.find((i) => i.producto.id === producto.id);
      if (existe) {
        return prev.map((i) =>
          i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i,
        );
      }
      return [...prev, { producto, cantidad: 1, nota: "" }];
    });
  }

  function restar(productoId: string) {
    setItems((prev) =>
      prev
        .map((i) =>
          i.producto.id === productoId ? { ...i, cantidad: i.cantidad - 1 } : i,
        )
        .filter((i) => i.cantidad > 0),
    );
  }

  function setNota(productoId: string, nota: string) {
    setItems((prev) =>
      prev.map((i) => (i.producto.id === productoId ? { ...i, nota } : i)),
    );
  }

  function quitar(productoId: string) {
    setItems((prev) => prev.filter((i) => i.producto.id !== productoId));
  }

  const total = items.reduce((s, i) => s + i.producto.precio * i.cantidad, 0);

  function handleEnviar() {
    if (!items.length) return;
    startTransition(async () => {
      const res = await crearPedido(
        mesaId,
        items.map((i) => ({
          productoId: i.producto.id,
          cantidad: i.cantidad,
          precioUnitario: i.producto.precio,
          nota: i.nota || undefined,
        })),
      );
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Comanda enviada a cocina ✓");
        setItems([]);
      }
    });
  }

  return (
    <div className="flex h-full flex-col gap-4 lg:flex-row">
      {/* ── Carta ── */}
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="h-8 text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setCategoriaActiva(null)}
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs transition-colors",
              categoriaActiva === null
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            Todos
          </button>
          {categorias.map((catId) => {
            const nombre = productos.find((p) => p.categoria_id === catId)?.categoria_id ?? catId;
            return (
              <button
                key={catId}
                onClick={() => setCategoriaActiva(catId ?? null)}
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs transition-colors",
                  categoriaActiva === catId
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {nombre}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {productosFiltrados.map((producto) => {
            const enCarrito = items.find((i) => i.producto.id === producto.id);
            return (
              <button
                key={producto.id}
                onClick={() => agregar(producto)}
                className={cn(
                  "rounded-lg border bg-card p-3 text-left transition-all hover:shadow-md active:scale-95",
                  enCarrito && "border-primary ring-1 ring-primary",
                )}
              >
                <p className="font-medium text-sm line-clamp-2">{producto.nombre}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  ${producto.precio.toFixed(2)}
                </p>
                {enCarrito && (
                  <Badge className="mt-1 text-xs" variant="secondary">
                    ×{enCarrito.cantidad}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Carrito ── */}
      <div className="lg:w-72 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4" />
          <h2 className="font-semibold text-sm">
            Comanda — {mesaNombre}
          </h2>
          {items.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {items.reduce((s, i) => s + i.cantidad, 0)} items
            </Badge>
          )}
        </div>

        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
            Tocá un producto para agregarlo
          </div>
        ) : (
          <div className="space-y-2 flex-1 overflow-y-auto max-h-96">
            {items.map((item) => (
              <div key={item.producto.id} className="rounded-lg border bg-card p-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium line-clamp-1 flex-1">
                    {item.producto.nombre}
                  </span>
                  <button
                    onClick={() => quitar(item.producto.id)}
                    className="text-muted-foreground hover:text-destructive ml-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => restar(item.producto.id)}
                    className="rounded border p-0.5 hover:bg-muted"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="text-sm w-4 text-center">{item.cantidad}</span>
                  <button
                    onClick={() => agregar(item.producto)}
                    className="rounded border p-0.5 hover:bg-muted"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                  <span className="ml-auto text-xs text-muted-foreground">
                    ${(item.producto.precio * item.cantidad).toFixed(2)}
                  </span>
                </div>
                <Input
                  placeholder="Nota (sin sal, sin cebolla...)"
                  value={item.nota}
                  onChange={(e) => setNota(item.producto.id, e.target.value)}
                  className="h-6 text-xs"
                />
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <>
            <div className="flex justify-between text-sm font-semibold border-t pt-2">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <Button
              className="w-full gap-1.5"
              onClick={handleEnviar}
              disabled={pending}
            >
              <Send className="h-4 w-4" />
              {pending ? "Enviando..." : "Enviar a cocina"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
