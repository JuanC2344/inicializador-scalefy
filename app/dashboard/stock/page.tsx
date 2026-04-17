import { createClient } from "@/lib/supabase/server";
import { requireRol } from "@/lib/roles";
import { InsumoRow } from "@/components/stock/insumo-row";
import { NuevoInsumoDialog } from "@/components/stock/nuevo-insumo-dialog";
import { Package, AlertTriangle } from "lucide-react";

export default async function StockPage() {
  await requireRol("admin");
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("stock_items")
    .select("id, nombre, unidad, stock_actual, stock_minimo")
    .order("nombre");

  const stockItems = items ?? [];
  const criticos = stockItems.filter((i) => i.stock_actual <= i.stock_minimo);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Package className="h-6 w-6" />
            Stock
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Inventario de insumos. Registrá entradas y salidas.
          </p>
        </div>
        <NuevoInsumoDialog />
      </div>

      {/* Alerta críticos */}
      {criticos.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            <strong>{criticos.length}</strong> insumo{criticos.length !== 1 ? "s" : ""} por debajo del stock mínimo:{" "}
            {criticos.map((c) => c.nombre).join(", ")}.
          </span>
        </div>
      )}

      {/* Lista de insumos */}
      {stockItems.length === 0 ? (
        <div className="rounded-lg border border-dashed p-16 text-center text-muted-foreground">
          No hay insumos cargados. Hacé clic en &quot;Nuevo insumo&quot; para agregar.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stockItems.map((item) => (
            <InsumoRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
