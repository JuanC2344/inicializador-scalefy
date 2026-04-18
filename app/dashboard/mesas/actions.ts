"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRol } from "@/lib/roles";

export type MesaState = { error?: string; success?: boolean };

export async function crearMesa(
  _prev: MesaState,
  formData: FormData,
): Promise<MesaState> {
  await requireRol("admin");
  const supabase = await createClient();

  const nombre = String(formData.get("nombre") ?? "").trim();
  const capacidad = parseInt(String(formData.get("capacidad") ?? "4"), 10);

  if (!nombre) return { error: "El nombre de la mesa es obligatorio" };
  if (isNaN(capacidad) || capacidad < 1) return { error: "Capacidad inválida" };

  const { error } = await supabase
    .from("mesas")
    .insert({ nombre, capacidad, estado: "libre" });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/mesas");
  return { success: true };
}

export async function cambiarEstadoMesa(
  mesaId: string,
  estado: "libre" | "ocupada" | "en_cuenta",
): Promise<MesaState> {
  await requireRol("admin");
  const supabase = await createClient();

  const { error } = await supabase
    .from("mesas")
    .update({ estado })
    .eq("id", mesaId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/mesas");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function eliminarMesa(mesaId: string): Promise<MesaState> {
  await requireRol("admin");
  const supabase = await createClient();

  const { error } = await supabase.from("mesas").delete().eq("id", mesaId);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/mesas");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function asignarMozo(mesaId: string, mozoId: string): Promise<MesaState> {
  await requireRol(["admin", "mozo"]);
  const supabase = await createClient();

  const { error } = await supabase
    .from("mesas")
    .update({ estado: "ocupada", mozo_id: mozoId })
    .eq("id", mesaId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/mesas");
  revalidatePath("/dashboard");
  return { success: true };
}
