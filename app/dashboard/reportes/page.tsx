import { createClient } from "@/lib/supabase/server";
import { requireRol } from "@/lib/roles";
import { BarChart2, TrendingUp, ShoppingBag, CreditCard } from "lucide-react";

interface ProductoConteo {
  nombre: string;
  total_vendido: number;
  ingresos: number;
}

export default async function ReportesPage() {
  await requireRol("admin");
  const supabase = await createClient();

  const hoy = new Date().toISOString().split("T")[0];
  const manana = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  // Pedidos cerrados hoy
  const { data: pedidosHoy } = await supabase
    .from("pedidos")
    .select("id, total, estado, creado_en")
    .eq("estado", "cerrado")
    .gte("creado_en", `${hoy}T00:00:00`)
    .lt("creado_en", `${manana}T00:00:00`);

  // Cierre de caja hoy
  const { data: cierre } = await supabase
    .from("caja_cierres")
    .select("total_efectivo, total_tarjeta, total_otros, total_general")
    .eq("fecha", hoy)
    .maybeSingle();

  // Productos más vendidos hoy — via pedido_items de pedidos cerrados hoy
  const pedidoIds = (pedidosHoy ?? []).map((p) => p.id);
  let productosMasVendidos: ProductoConteo[] = [];

  if (pedidoIds.length > 0) {
    const { data: items } = await supabase
      .from("pedido_items")
      .select("cantidad, precio_unitario, productos(nombre)")
      .in("pedido_id", pedidoIds);

    if (items) {
      const mapa = new Map<string, ProductoConteo>();
      for (const item of items) {
        const nombre =
          (item.productos as unknown as { nombre: string } | null)?.nombre ?? "Desconocido";
        const existing = mapa.get(nombre) ?? { nombre, total_vendido: 0, ingresos: 0 };
        existing.total_vendido += item.cantidad;
        existing.ingresos += item.cantidad * item.precio_unitario;
        mapa.set(nombre, existing);
      }
      productosMasVendidos = Array.from(mapa.values()).sort(
        (a, b) => b.total_vendido - a.total_vendido,
      );
    }
  }

  const totalVentas = (pedidosHoy ?? []).reduce((s, p) => s + (p.total ?? 0), 0);
  const cantidadPedidos = pedidosHoy?.length ?? 0;
  const ticketPromedio = cantidadPedidos > 0 ? totalVentas / cantidadPedidos : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <BarChart2 className="h-6 w-6" />
          Reportes
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Resumen del día — {new Date().toLocaleDateString("es-AR", { dateStyle: "long" })}
        </p>
      </div>

      {/* KPIs del día */}
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          icon={<ShoppingBag className="h-5 w-5 text-primary" />}
          label="Pedidos cerrados"
          value={cantidadPedidos.toString()}
          sub="cuentas cerradas hoy"
        />
        <KpiCard
          icon={<TrendingUp className="h-5 w-5 text-green-600" />}
          label="Total facturado"
          value={`$${totalVentas.toFixed(2)}`}
          sub="suma de pedidos cerrados"
        />
        <KpiCard
          icon={<CreditCard className="h-5 w-5 text-blue-600" />}
          label="Ticket promedio"
          value={`$${ticketPromedio.toFixed(2)}`}
          sub="por pedido"
        />
      </div>

      {/* Ingresos por medio de pago */}
      {cierre && (
        <section className="space-y-3">
          <h2 className="font-medium">Ingresos por medio de pago</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Efectivo", value: cierre.total_efectivo },
              { label: "Tarjeta", value: cierre.total_tarjeta },
              { label: "Otros", value: cierre.total_otros },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg border bg-card p-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-mono font-semibold">${(value ?? 0).toFixed(2)}</p>
                {totalVentas > 0 && (
                  <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${Math.round(((value ?? 0) / totalVentas) * 100)}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Productos más vendidos */}
      <section className="space-y-3">
        <h2 className="font-medium">Productos más vendidos hoy</h2>
        {productosMasVendidos.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground text-sm">
            Sin ventas registradas hoy.
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">#</th>
                  <th className="text-left px-4 py-2 font-medium">Producto</th>
                  <th className="text-right px-4 py-2 font-medium">Unidades</th>
                  <th className="text-right px-4 py-2 font-medium">Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {productosMasVendidos.map((p, i) => (
                  <tr key={p.nombre} className="border-t">
                    <td className="px-4 py-2.5 text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-2.5 font-medium">{p.nombre}</td>
                    <td className="px-4 py-2.5 text-right font-mono">{p.total_vendido}</td>
                    <td className="px-4 py-2.5 text-right font-mono">${p.ingresos.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-5 space-y-1">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="text-2xl font-bold font-mono">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
