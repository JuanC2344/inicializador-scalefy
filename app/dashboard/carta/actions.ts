"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRol } from "@/lib/roles";

export type CartaState = { error?: string; success?: boolean };

// ─── Categorías ────────────────────────────────────────────
export async function crearCategoria(
  _prev: CartaState,
  formData: FormData,
): Promise<CartaState> {
  await requireRol("admin");
  const supabase = await createClient();

  const nombre = String(formData.get("nombre") ?? "").trim();
  if (!nombre) return { error: "Nombre obligatorio" };

  const { data: last } = await supabase
    .from("categorias")
    .select("orden")
    .order("orden", { ascending: false })
    .limit(1)
    .single();

  const orden = (last?.orden ?? 0) + 1;

  const { error } = await supabase.from("categorias").insert({ nombre, orden });
  if (error) return { error: error.message };

  revalidatePath("/dashboard/carta");
  return { success: true };
}

export async function eliminarCategoria(id: string): Promise<CartaState> {
  await requireRol("admin");
  const supabase = await createClient();
  const { error } = await supabase.from("categorias").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/carta");
  return { success: true };
}

// ─── Productos ─────────────────────────────────────────────
export async function crearProducto(
  _prev: CartaState,
  formData: FormData,
): Promise<CartaState> {
  await requireRol("admin");
  const supabase = await createClient();

  const nombre = String(formData.get("nombre") ?? "").trim();
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const precio = parseFloat(String(formData.get("precio") ?? "0"));
  const imagen_url = String(formData.get("imagen_url") ?? "").trim() || null;
  const rawCat = String(formData.get("categoria_id") ?? "").trim();
  const categoria_id = rawCat && rawCat !== "none" ? rawCat : null;

  if (!nombre) return { error: "Nombre obligatorio" };
  if (isNaN(precio) || precio < 0) return { error: "Precio inválido" };

  const { error } = await supabase.from("productos").insert({
    nombre,
    descripcion: descripcion || null,
    precio,
    imagen_url,
    categoria_id,
    activo: true,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/carta");
  return { success: true };
}

export async function actualizarProducto(
  id: string,
  _prev: CartaState,
  formData: FormData,
): Promise<CartaState> {
  await requireRol("admin");
  const supabase = await createClient();

  const nombre = String(formData.get("nombre") ?? "").trim();
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const precio = parseFloat(String(formData.get("precio") ?? "0"));
  const imagen_url = String(formData.get("imagen_url") ?? "").trim() || null;
  const rawCat2 = String(formData.get("categoria_id") ?? "").trim();
  const categoria_id = rawCat2 && rawCat2 !== "none" ? rawCat2 : null;

  if (!nombre) return { error: "Nombre obligatorio" };
  if (isNaN(precio) || precio < 0) return { error: "Precio inválido" };

  const { error } = await supabase
    .from("productos")
    .update({ nombre, descripcion: descripcion || null, precio, imagen_url, categoria_id })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/carta");
  return { success: true };
}

export async function toggleProductoActivo(
  id: string,
  activo: boolean,
): Promise<CartaState> {
  await requireRol("admin");
  const supabase = await createClient();
  const { error } = await supabase
    .from("productos")
    .update({ activo })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/carta");
  return { success: true };
}

export async function eliminarProducto(id: string): Promise<CartaState> {
  await requireRol("admin");
  const supabase = await createClient();
  const { error } = await supabase.from("productos").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/carta");
  return { success: true };
}
