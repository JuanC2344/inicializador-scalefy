"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRol } from "@/lib/roles";

export type PedidoState = { error?: string; success?: boolean; pedidoId?: string };

/** Crea un pedido nuevo para la mesa y agrega los items del carrito */
export async function crearPedido(
  mesaId: string,
  items: { productoId: string; cantidad: number; precioUnitario: number; nota?: string }[],
): Promise<PedidoState> {
  const { user } = await requireRol(["mozo", "admin"]);
  if (!items.length) return { error: "El carrito está vacío" };

  const supabase = await createClient();

  // Crear el pedido
  const { data: pedido, error: pedidoError } = await supabase
    .from("pedidos")
    .insert({
      mesa_id: mesaId,
      mozo_id: user.id,
      estado: "pendiente",
      total: items.reduce((sum, i) => sum + i.precioUnitario * i.cantidad, 0),
    })
    .select("id")
    .single();

  if (pedidoError || !pedido) return { error: pedidoError?.message ?? "Error al crear pedido" };

  // Agregar items
  const { error: itemsError } = await supabase.from("pedido_items").insert(
    items.map((i) => ({
      pedido_id: pedido.id,
      producto_id: i.productoId,
      cantidad: i.cantidad,
      precio_unitario: i.precioUnitario,
      nota: i.nota ?? null,
    })),
  );

  if (itemsError) return { error: itemsError.message };

  // Marcar mesa como ocupada
  await supabase.from("mesas").update({ estado: "ocupada", mozo_id: user.id }).eq("id", mesaId);

  revalidatePath(`/mozo/mesa/${mesaId}`);
  revalidatePath("/dashboard");
  return { success: true, pedidoId: pedido.id };
}

/** Cambia el estado de un pedido (mozo o cocina) */
export async function cambiarEstadoPedido(
  pedidoId: string,
  estado: "en_preparacion" | "listo" | "entregado",
): Promise<PedidoState> {
  await requireRol(["mozo", "admin"]);
  const supabase = await createClient();

  const { error } = await supabase
    .from("pedidos")
    .update({ estado })
    .eq("id", pedidoId);

  if (error) return { error: error.message };
  revalidatePath("/mozo");
  return { success: true };
}

/** Cambia estado desde cocina (no requiere login Supabase, se llama con token validado por middleware) */
export async function cambiarEstadoCocina(
  pedidoId: string,
  estado: "en_preparacion" | "listo",
): Promise<PedidoState> {
  // Cocina usa service role implícito en el server — el middleware ya validó el token
  const supabase = await createClient();

  const { error } = await supabase
    .from("pedidos")
    .update({ estado })
    .eq("id", pedidoId);

  if (error) return { error: error.message };
  return { success: true };
}
