import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRol } from "@/lib/roles";
import { Carrito } from "@/components/mozo/carrito";
import {
  ComandaDetalleDialog,
  type PedidoDetalle,
} from "@/components/mozo/comanda-detalle-dialog";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function nombreDesdeMail(email: string): string {
  const match = email.match(/^mozo(\d+)@/);
  if (match) return `Mozo ${match[1]}`;
  return email.split("@")[0];
}

export default async function MesaPedidoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireRol(["mozo", "admin"]);
  const supabase = await createClient();

  const [mesaRes, productosRes, pedidosRes] = await Promise.all([
    supabase.from("mesas").select("id, nombre, estado").eq("id", id).single(),
    supabase
      .from("productos")
      .select("id, nombre, precio, categoria_id")
      .eq("activo", true)
      .order("nombre"),
    supabase
      .from("pedidos")
      .select(
        "id, estado, total, creado_en, mozo_id, pedido_items(id, cantidad, precio_unitario, nota, productos(nombre))",
      )
      .eq("mesa_id", id)
      .in("estado", ["pendiente", "en_preparacion", "listo"])
      .order("creado_en", { ascending: true }),
  ]);

  if (mesaRes.error || !mesaRes.data) notFound();

  const mozoIds = [
    ...new Set(
      (pedidosRes.data ?? []).map((p) => p.mozo_id).filter(Boolean) as string[],
    ),
  ];
  const mozoMap: Record<string, string> = {};
  if (mozoIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", mozoIds);
    for (const p of profiles ?? []) {
      mozoMap[p.id] = nombreDesdeMail(p.email ?? "");
    }
  }

  const pedidosDetalle: PedidoDetalle[] = (pedidosRes.data ?? []).map((p) => ({
    id: p.id,
    estado: p.estado,
    total: p.total ?? 0,
    creado_en: p.creado_en,
    mozo_nombre: p.mozo_id ? (mozoMap[p.mozo_id] ?? "Mozo") : "Mozo",
    items: (p.pedido_items ?? []).map((i) => ({
      id: i.id,
      cantidad: i.cantidad,
      precio_unitario: i.precio_unitario,
      nota: i.nota,
      producto_nombre:
        Array.isArray(i.productos)
          ? (i.productos[0]?.nombre ?? "Producto")
          : ((i.productos as { nombre: string } | null)?.nombre ?? "Producto"),
    })),
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/mozo" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold">{mesaRes.data.nombre}</h1>
          <p className="text-sm text-muted-foreground">
            Seleccioná productos para armar la comanda.
          </p>
        </div>
        <ComandaDetalleDialog
          pedidos={pedidosDetalle}
          mesaNombre={mesaRes.data.nombre}
        />
      </div>
      <Carrito
        productos={productosRes.data ?? []}
        mesaId={id}
        mesaNombre={mesaRes.data.nombre}
      />
    </div>
  );
}
