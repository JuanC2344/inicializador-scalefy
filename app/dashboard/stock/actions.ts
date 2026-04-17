"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRol } from "@/lib/roles";

export interface StockState {
  error?: string;
  success?: boolean;
}

// ── Crear insumo ─────────────────────────────────────────────────────────────

export async function crearInsumo(
  _prev: StockState,
  formData: FormData,
): Promise<StockState> {
  await requireRol("admin");
  const supabase = await createClient();

  const nombre = formData.get("nombre")?.toString().trim();
  const unidad = formData.get("unidad")?.toString().trim();
  const stock_actual = parseFloat(formData.get("stock_actual")?.toString() ?? "0");
  const stock_minimo = parseFloat(formData.get("stock_minimo")?.toString() ?? "0");

  if (!nombre || !unidad) return { error: "Nombre y unidad son obligatorios." };

  const { error } = await supabase.from("stock_items").insert({
    nombre,
    unidad,
    stock_actual,
    stock_minimo,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/stock");
  return { success: true };
}

// ── Eliminar insumo ───────────────────────────────────────────────────────────

export async function eliminarInsumo(id: string): Promise<void> {
  await requireRol("admin");
  const supabase = await createClient();
  await supabase.from("stock_items").delete().eq("id", id);
  revalidatePath("/dashboard/stock");
}

// ── Registrar movimiento ──────────────────────────────────────────────────────

export async function registrarMovimiento(
  _prev: StockState,
  formData: FormData,
): Promise<StockState> {
  await requireRol("admin");
  const supabase = await createClient();

  const stock_item_id = formData.get("stock_item_id")?.toString();
  const tipo = formData.get("tipo")?.toString() as "entrada" | "salida" | undefined;
  const cantidad = parseFloat(formData.get("cantidad")?.toString() ?? "0");
  const nota = formData.get("nota")?.toString().trim() ?? null;

  if (!stock_item_id || !tipo) return { error: "Datos incompletos." };
  if (isNaN(cantidad) || cantidad <= 0) return { error: "La cantidad debe ser mayor a 0." };

  // Insertar movimiento
  const { error: movError } = await supabase.from("stock_movimientos").insert({
    stock_item_id,
    tipo,
    cantidad,
    nota,
    fecha: new Date().toISOString(),
  });
  if (movError) return { error: movError.message };

  // Actualizar stock_actual con RPC o manualmente
  const delta = tipo === "entrada" ? cantidad : -cantidad;
  const { error: updError } = await supabase.rpc("ajustar_stock", {
    p_id: stock_item_id,
    p_delta: delta,
  });

  if (updError) {
    // Fallback: fetch + update
    const { data: item } = await supabase
      .from("stock_items")
      .select("stock_actual")
      .eq("id", stock_item_id)
      .single();
    if (item) {
      await supabase
        .from("stock_items")
        .update({ stock_actual: item.stock_actual + delta })
        .eq("id", stock_item_id);
    }
  }

  revalidatePath("/dashboard/stock");
  return { success: true };
}
