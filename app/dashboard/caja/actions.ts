"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRol } from "@/lib/roles";

export type CajaState = { error?: string; success?: boolean };

export type MedioPago = "efectivo" | "tarjeta" | "otros";

/** Cierra la cuenta de una mesa: marca pedidos como 'cerrado', registra pago, libera mesa */
export async function cerrarCuenta(
  mesaId: string,
  descuento: number,
  medioPago: MedioPago,
): Promise<CajaState> {
  const { user } = await requireRol("admin");
  const supabase = await createClient();

  // Obtener todos los pedidos activos de la mesa
  const { data: pedidos, error: pedidosError } = await supabase
    .from("pedidos")
    .select("id, total")
    .eq("mesa_id", mesaId)
    .neq("estado", "cerrado");

  if (pedidosError) return { error: pedidosError.message };
  if (!pedidos?.length) return { error: "No hay pedidos activos en esta mesa" };

  const totalBruto = pedidos.reduce((s, p) => s + (p.total ?? 0), 0);
  const totalFinal = Math.max(0, totalBruto - descuento);

  // Cerrar todos los pedidos
  const { error: updateError } = await supabase
    .from("pedidos")
    .update({ estado: "cerrado", cerrado_en: new Date().toISOString() })
    .eq("mesa_id", mesaId)
    .neq("estado", "cerrado");

  if (updateError) return { error: updateError.message };

  // Registrar en caja_cierres (acumula en el cierre del día)
  const hoy = new Date().toISOString().split("T")[0];

  const { data: cierreExistente } = await supabase
    .from("caja_cierres")
    .select("id, total_efectivo, total_tarjeta, total_otros, total_general")
    .eq("fecha", hoy)
    .maybeSingle();

  if (cierreExistente) {
    await supabase
      .from("caja_cierres")
      .update({
        total_efectivo:
          (cierreExistente.total_efectivo ?? 0) + (medioPago === "efectivo" ? totalFinal : 0),
        total_tarjeta:
          (cierreExistente.total_tarjeta ?? 0) + (medioPago === "tarjeta" ? totalFinal : 0),
        total_otros:
          (cierreExistente.total_otros ?? 0) + (medioPago === "otros" ? totalFinal : 0),
        total_general: (cierreExistente.total_general ?? 0) + totalFinal,
        cerrado_por: user.id,
      })
      .eq("id", cierreExistente.id);
  } else {
    await supabase.from("caja_cierres").insert({
      fecha: hoy,
      total_efectivo: medioPago === "efectivo" ? totalFinal : 0,
      total_tarjeta: medioPago === "tarjeta" ? totalFinal : 0,
      total_otros: medioPago === "otros" ? totalFinal : 0,
      total_general: totalFinal,
      cerrado_por: user.id,
    });
  }

  // Liberar la mesa
  await supabase
    .from("mesas")
    .update({ estado: "libre", mozo_id: null })
    .eq("id", mesaId);

  revalidatePath("/dashboard/caja");
  revalidatePath("/dashboard/mesas");
  revalidatePath("/dashboard");
  return { success: true };
}

/** Datos para el ticket PDF */
export async function getDatosCuenta(mesaId: string) {
  const supabase = await createClient();

  const [mesaRes, pedidosRes] = await Promise.all([
    supabase.from("mesas").select("nombre").eq("id", mesaId).single(),
    supabase
      .from("pedidos")
      .select(
        `id, total, creado_en,
         pedido_items(
           cantidad, precio_unitario, nota,
           productos(nombre)
         )`,
      )
      .eq("mesa_id", mesaId)
      .neq("estado", "cerrado")
      .order("creado_en"),
  ]);

  return {
    mesa: mesaRes.data,
    pedidos: pedidosRes.data ?? [],
  };
}
