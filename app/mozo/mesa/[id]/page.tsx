import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRol } from "@/lib/roles";
import { Carrito } from "@/components/mozo/carrito";

export default async function MesaPedidoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireRol(["mozo", "admin"]);
  const supabase = await createClient();

  const [mesaRes, productosRes] = await Promise.all([
    supabase.from("mesas").select("id, nombre, estado").eq("id", id).single(),
    supabase
      .from("productos")
      .select("id, nombre, precio, categoria_id")
      .eq("activo", true)
      .order("nombre"),
  ]);

  if (mesaRes.error || !mesaRes.data) notFound();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">{mesaRes.data.nombre}</h1>
        <p className="text-sm text-muted-foreground">
          Seleccioná productos para armar la comanda.
        </p>
      </div>
      <Carrito
        productos={productosRes.data ?? []}
        mesaId={id}
        mesaNombre={mesaRes.data.nombre}
      />
    </div>
  );
}
