import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { createClient } from "@/lib/supabase/server";
import { requireRol } from "@/lib/roles";

interface PedidoRow {
  id: string;
  total: number;
  estado: string;
  creado_en: string;
  cerrado_en: string | null;
  medio_pago: string | null;
  descuento: number | null;
  mesas: { nombre: string } | null;
  profiles: { nombre: string | null } | null;
}

interface ItemRow {
  cantidad: number;
  precio_unitario: number;
  pedido_id: string;
  productos: { nombre: string } | null;
}

interface MovimientoRow {
  tipo: string;
  cantidad: number;
  nota: string | null;
  fecha: string;
  stock_items: { nombre: string; unidad: string } | null;
}

export async function GET(req: NextRequest) {
  await requireRol("admin");
  const supabase = await createClient();

  // Rango: query param ?rango=hoy (default) | 8h
  const rango = req.nextUrl.searchParams.get("rango") ?? "hoy";
  const ahora = new Date();
  let desde: Date;

  if (rango === "8h") {
    desde = new Date(ahora.getTime() - 8 * 60 * 60 * 1000);
  } else {
    // turno del día: 00:00 local
    desde = new Date(ahora);
    desde.setHours(0, 0, 0, 0);
  }
  const desdeISO = desde.toISOString();

  // ── Pedidos cerrados en el rango ─────────────────────────────
  const { data: pedidosRaw } = await supabase
    .from("pedidos")
    .select(
      `id, total, estado, creado_en, cerrado_en, medio_pago, descuento,
       mesas(nombre), profiles(nombre)`,
    )
    .eq("estado", "cerrado")
    .gte("creado_en", desdeISO)
    .order("creado_en", { ascending: true });

  const pedidos = (pedidosRaw as unknown as PedidoRow[]) ?? [];
  const pedidoIds = pedidos.map((p) => p.id);

  // ── Items de esos pedidos ────────────────────────────────────
  let items: ItemRow[] = [];
  if (pedidoIds.length > 0) {
    const { data } = await supabase
      .from("pedido_items")
      .select("cantidad, precio_unitario, pedido_id, productos(nombre)")
      .in("pedido_id", pedidoIds);
    items = (data as unknown as ItemRow[]) ?? [];
  }

  // ── Movimientos de stock en el rango ─────────────────────────
  const { data: movsRaw } = await supabase
    .from("stock_movimientos")
    .select("tipo, cantidad, nota, fecha, stock_items(nombre, unidad)")
    .gte("fecha", desdeISO)
    .order("fecha", { ascending: true });

  const movimientos = (movsRaw as unknown as MovimientoRow[]) ?? [];

  // ── Calcular totales ──────────────────────────────────────────
  const totalFacturado = pedidos.reduce((s, p) => s + (p.total ?? 0), 0);
  const cantidad = pedidos.length;
  const promedio = cantidad > 0 ? totalFacturado / cantidad : 0;

  const porMedio = { efectivo: 0, tarjeta: 0, otros: 0, sin_registrar: 0 };
  for (const p of pedidos) {
    const medio = (p.medio_pago ?? "sin_registrar") as keyof typeof porMedio;
    if (medio in porMedio) porMedio[medio] += p.total ?? 0;
    else porMedio.sin_registrar += p.total ?? 0;
  }

  // Productos agrupados
  const productoMap = new Map<string, { cantidad: number; ingresos: number }>();
  for (const item of items) {
    const nombre = item.productos?.nombre ?? "Desconocido";
    const ex = productoMap.get(nombre) ?? { cantidad: 0, ingresos: 0 };
    ex.cantidad += item.cantidad;
    ex.ingresos += item.cantidad * item.precio_unitario;
    productoMap.set(nombre, ex);
  }
  const productosOrdenados = Array.from(productoMap.entries())
    .map(([nombre, v]) => ({ nombre, ...v }))
    .sort((a, b) => b.cantidad - a.cantidad);

  // ── Armar workbook ────────────────────────────────────────────
  const wb = XLSX.utils.book_new();

  // Hoja 1 — Resumen
  const resumen = [
    ["Cierre de turno — GastroAdmin"],
    [],
    ["Generado", ahora.toLocaleString("es-AR")],
    ["Rango", rango === "8h" ? "Últimas 8 horas" : "Turno del día (desde 00:00)"],
    ["Desde", desde.toLocaleString("es-AR")],
    ["Hasta", ahora.toLocaleString("es-AR")],
    [],
    ["Pedidos cerrados", cantidad],
    ["Total facturado", totalFacturado],
    ["Ticket promedio", promedio],
  ];
  const wsResumen = XLSX.utils.aoa_to_sheet(resumen);
  wsResumen["!cols"] = [{ wch: 24 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");

  // Hoja 2 — Pedidos
  const pedidosRows = pedidos.map((p) => ({
    "Pedido ID": p.id.slice(0, 8),
    Mesa: p.mesas?.nombre ?? "—",
    Mozo: p.profiles?.nombre ?? "—",
    "Creado en": new Date(p.creado_en).toLocaleString("es-AR"),
    "Cerrado en": p.cerrado_en ? new Date(p.cerrado_en).toLocaleString("es-AR") : "—",
    "Medio de pago": p.medio_pago ?? "—",
    Descuento: p.descuento ?? 0,
    Total: p.total ?? 0,
  }));
  const wsPedidos = XLSX.utils.json_to_sheet(
    pedidosRows.length > 0
      ? pedidosRows
      : [{ "Pedido ID": "(sin pedidos en este rango)" }],
  );
  wsPedidos["!cols"] = [
    { wch: 12 }, { wch: 14 }, { wch: 18 }, { wch: 20 },
    { wch: 20 }, { wch: 14 }, { wch: 10 }, { wch: 12 },
  ];
  XLSX.utils.book_append_sheet(wb, wsPedidos, "Pedidos");

  // Hoja 3 — Medios de pago
  const mediosRows = [
    { "Medio de pago": "Efectivo", Total: porMedio.efectivo },
    { "Medio de pago": "Tarjeta", Total: porMedio.tarjeta },
    { "Medio de pago": "Otros", Total: porMedio.otros },
    { "Medio de pago": "Sin registrar", Total: porMedio.sin_registrar },
    { "Medio de pago": "TOTAL", Total: totalFacturado },
  ];
  const wsMedios = XLSX.utils.json_to_sheet(mediosRows);
  wsMedios["!cols"] = [{ wch: 20 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, wsMedios, "Medios de pago");

  // Hoja 4 — Productos vendidos
  const productosRows = productosOrdenados.map((p) => ({
    Producto: p.nombre,
    "Cantidad vendida": p.cantidad,
    Ingresos: p.ingresos,
  }));
  const wsProductos = XLSX.utils.json_to_sheet(
    productosRows.length > 0
      ? productosRows
      : [{ Producto: "(sin productos vendidos)" }],
  );
  wsProductos["!cols"] = [{ wch: 30 }, { wch: 18 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, wsProductos, "Productos vendidos");

  // Hoja 5 — Movimientos de stock
  const movsRows = movimientos.map((m) => ({
    Fecha: new Date(m.fecha).toLocaleString("es-AR"),
    Insumo: m.stock_items?.nombre ?? "—",
    Tipo: m.tipo,
    Cantidad: m.cantidad,
    Unidad: m.stock_items?.unidad ?? "—",
    Nota: m.nota ?? "",
  }));
  const wsMovs = XLSX.utils.json_to_sheet(
    movsRows.length > 0
      ? movsRows
      : [{ Fecha: "(sin movimientos de stock)" }],
  );
  wsMovs["!cols"] = [
    { wch: 20 }, { wch: 20 }, { wch: 10 },
    { wch: 12 }, { wch: 10 }, { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(wb, wsMovs, "Movimientos stock");

  // ── Serializar ────────────────────────────────────────────────
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;

  const fecha = ahora.toISOString().split("T")[0];
  const hora = ahora.toTimeString().slice(0, 5).replace(":", "");
  const filename = `cierre-turno-${fecha}-${hora}.xlsx`;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
