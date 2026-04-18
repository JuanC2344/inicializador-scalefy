import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRol } from "@/lib/roles";
import { Carrito } from "@/components/mozo/carrito";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function DashboardMesaPedidoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireRol("admin");
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
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/mozo"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold">{mesaRes.data.nombre}</h1>
          <p className="text-sm text-muted-foreground">
            Seleccioná productos para armar la comanda.
          </p>
        </div>
      </div>
      <Carrito
        productos={productosRes.data ?? []}
        mesaId={id}
        mesaNombre={mesaRes.data.nombre}
      />
    </div>
  );
}
