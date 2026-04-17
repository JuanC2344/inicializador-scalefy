"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductoForm } from "./producto-form";
import {
  crearCategoria,
  eliminarCategoria,
  eliminarProducto,
  toggleProductoActivo,
} from "@/app/dashboard/carta/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  productos: Producto[];
}

export function CartaAdmin({ categorias, productos }: Props) {
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);
  const [editandoProducto, setEditandoProducto] = useState<Producto | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const productosFiltrados =
    categoriaActiva === null
      ? productos
      : productos.filter((p) => p.categoria_id === categoriaActiva);

  function handleToggle(producto: Producto) {
    startTransition(async () => {
      const res = await toggleProductoActivo(producto.id, !producto.activo);
      if (res.error) toast.error(res.error);
    });
  }

  function handleEliminarProducto(id: string, nombre: string) {
    startTransition(async () => {
      const res = await eliminarProducto(id);
      if (res.error) toast.error(res.error);
      else toast.success(`"${nombre}" eliminado`);
    });
  }

  function handleEliminarCategoria(id: string, nombre: string) {
    startTransition(async () => {
      const res = await eliminarCategoria(id);
      if (res.error) toast.error(res.error);
      else {
        toast.success(`Categoría "${nombre}" eliminada`);
        if (categoriaActiva === id) setCategoriaActiva(null);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Categorías */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setCategoriaActiva(null)}
          className={cn(
            "rounded-full px-3 py-1 text-sm transition-colors",
            categoriaActiva === null
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80",
          )}
        >
          Todos ({productos.length})
        </button>
        {categorias.map((cat) => (
          <div key={cat.id} className="flex items-center gap-1">
            <button
              onClick={() => setCategoriaActiva(cat.id)}
              className={cn(
                "rounded-full px-3 py-1 text-sm transition-colors",
                categoriaActiva === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {cat.nombre} ({productos.filter((p) => p.categoria_id === cat.id).length})
            </button>
            <button
              onClick={() => handleEliminarCategoria(cat.id, cat.nombre)}
              disabled={pending}
              className="text-muted-foreground hover:text-destructive p-0.5"
              title="Eliminar categoría"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}

        {/* Nueva categoría */}
        <NuevaCategoriaInline />
      </div>

      {/* Productos */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? "s" : ""}
        </p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Nuevo producto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar producto</DialogTitle>
            </DialogHeader>
            <ProductoForm
              categorias={categorias}
              onSuccess={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {productosFiltrados.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
          No hay productos en esta categoría.
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Producto</th>
                <th className="text-left px-4 py-2 font-medium hidden sm:table-cell">Categoría</th>
                <th className="text-right px-4 py-2 font-medium">Precio</th>
                <th className="text-center px-4 py-2 font-medium">Estado</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {productosFiltrados.map((producto) => {
                const cat = categorias.find((c) => c.id === producto.categoria_id);
                return (
                  <tr key={producto.id} className={cn(!producto.activo && "opacity-50")}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{producto.nombre}</div>
                      {producto.descripcion && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {producto.descripcion}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {cat ? (
                        <Badge variant="outline" className="text-xs">
                          {cat.nombre}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      €{producto.precio.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggle(producto)}
                        disabled={pending}
                        title={producto.activo ? "Desactivar" : "Activar"}
                      >
                        {producto.activo ? (
                          <ToggleRight className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 text-muted-foreground mx-auto" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => {
                            setEditandoProducto(producto);
                            setEditDialogOpen(true);
                          }}
                          className="text-muted-foreground hover:text-foreground p-1"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEliminarProducto(producto.id, producto.nombre)}
                          disabled={pending}
                          className="text-muted-foreground hover:text-destructive p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Dialog editar producto */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar producto</DialogTitle>
          </DialogHeader>
          {editandoProducto && (
            <ProductoForm
              categorias={categorias}
              producto={editandoProducto}
              onSuccess={() => setEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NuevaCategoriaInline() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await crearCategoria({}, formData);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Categoría creada");
        setOpen(false);
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full px-3 py-1 text-sm border border-dashed text-muted-foreground hover:border-foreground transition-colors"
      >
        + Categoría
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-1">
      <Label htmlFor="cat-nombre" className="sr-only">
        Nombre categoría
      </Label>
      <Input
        id="cat-nombre"
        name="nombre"
        placeholder="Nombre"
        className="h-7 text-sm w-32"
        autoFocus
        disabled={pending}
      />
      <Button type="submit" size="sm" className="h-7 text-xs px-2" disabled={pending}>
        OK
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-7 text-xs px-2"
        onClick={() => setOpen(false)}
      >
        ✕
      </Button>
    </form>
  );
}
