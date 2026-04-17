import { createClient } from "@/lib/supabase/server";
import { requireRol } from "@/lib/roles";
import { LayoutGrid, ClipboardList, CreditCard, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function getResumen() {
  const supabase = await createClient();

  const [mesasRes, pedidosRes, stockRes] = await Promise.all([
    supabase
      .from("mesas")
      .select("estado")
      .in("estado", ["ocupada", "en_cuenta"]),
    supabase
      .from("pedidos")
      .select("id")
      .not("estado", "eq", "cerrado"),
    supabase
      .from("stock_items")
      .select("id, stock_actual, stock_minimo")
      .filter("stock_actual", "lte", "stock_minimo"),
  ]);

  return {
    mesasOcupadas: mesasRes.data?.length ?? 0,
    pedidosActivos: pedidosRes.data?.length ?? 0,
    alertasStock: stockRes.data?.length ?? 0,
  };
}

export default async function DashboardPage() {
  await requireRol("admin");
  const { mesasOcupadas, pedidosActivos, alertasStock } = await getResumen();

  const stats = [
    {
      title: "Mesas ocupadas",
      value: mesasOcupadas,
      icon: LayoutGrid,
      desc: "con cuenta abierta",
    },
    {
      title: "Pedidos activos",
      value: pedidosActivos,
      icon: ClipboardList,
      desc: "sin cerrar",
    },
    {
      title: "Alertas de stock",
      value: alertasStock,
      icon: AlertTriangle,
      desc: "insumos bajo mínimo",
      urgent: alertasStock > 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Resumen del local</h1>
        <p className="text-sm text-muted-foreground">Estado actual en tiempo real.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ title, value, icon: Icon, desc, urgent }) => (
          <Card key={title} className={urgent ? "border-destructive" : ""}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {title}
              </CardTitle>
              <Icon
                className={`h-4 w-4 ${urgent ? "text-destructive" : "text-muted-foreground"}`}
              />
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${urgent ? "text-destructive" : ""}`}>
                {value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Placeholder rápido para próximas secciones */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Caja del día
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Disponible en Fase 6 — Caja y facturación.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Últimos pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Disponible en Fase 5 — Pedidos y comandas.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
