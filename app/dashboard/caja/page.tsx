import { createClient } from "@/lib/supabase/server";
import { requireRol } from "@/lib/roles";
import Link from "next/link";
import { CreditCard, ArrowRight } from "lucide-react";

export default async function CajaPage() {
  await requireRol("admin");
  const supabase = await createClient();

  // Mesas con pedidos sin cerrar
  const { data: mesas } = await supabase
    .from("mesas")
    .select(
      `id, nombre, estado,
       pedidos!inner(id, total, estado)`,
    )
    .neq("pedidos.estado", "cerrado")
    .order("nombre");

  // Cierre del día actual
  const hoy = new Date().toISOString().split("T")[0];
  const { data: cierre } = await supabase
    .from("caja_cierres")
    .select("total_efectivo, total_tarjeta, total_otros, total_general")
    .eq("fecha", hoy)
    .maybeSingle();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <CreditCard className="h-6 w-6" />
          Caja
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Cerrá cuentas y descargá tickets.
        </p>
      </div>

      {/* Mesas con cuenta abierta */}
      <div className="space-y-3">
        <h2 className="font-medium">Mesas con cuenta abierta</h2>
        {!mesas?.length ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            No hay mesas con pedidos activos.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {mesas.map((mesa) => {
              const pedidosList = mesa.pedidos as unknown as { total: number }[];
              const total = pedidosList.reduce((s, p) => s + (p.total ?? 0), 0);
              return (
                <Link
                  key={mesa.id}
                  href={`/dashboard/caja/${mesa.id}`}
                  className="flex items-center justify-between rounded-lg border bg-card p-4 hover:shadow-md transition-shadow"
                >
                  <div>
                    <p className="font-semibold">{mesa.nombre}</p>
                    <p className="text-sm text-muted-foreground">
                      {pedidosList.length} pedido{pedidosList.length !== 1 ? "s" : ""}
                    </p>
                    <p className="font-mono text-lg">${total.toFixed(2)}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Resumen del día */}
      <div className="space-y-3">
        <h2 className="font-medium">Resumen del día</h2>
        {!cierre ? (
          <p className="text-sm text-muted-foreground">Sin ventas registradas hoy.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              { label: "Efectivo", value: cierre.total_efectivo },
              { label: "Tarjeta", value: cierre.total_tarjeta },
              { label: "Otros", value: cierre.total_otros },
              { label: "Total del día", value: cierre.total_general, bold: true },
            ].map(({ label, value, bold }) => (
              <div key={label} className="rounded-lg border bg-card p-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={`text-xl font-mono ${bold ? "font-bold" : ""}`}>
                  ${(value ?? 0).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
