"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRol } from "@/lib/roles";
import type { Rol } from "@/lib/roles";

export type UsuarioState = { error?: string; success?: boolean };

export interface UsuarioRow {
  id: string;
  email: string;
  rol: Rol;
  created_at: string;
}

export async function listarUsuarios(): Promise<UsuarioRow[]> {
  await requireRol("admin");
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("profiles")
    .select("id, email, rol, created_at")
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as UsuarioRow[];
}

export async function crearUsuario(
  _prev: UsuarioState,
  formData: FormData,
): Promise<UsuarioState> {
  await requireRol("admin");

  const nombre = String(formData.get("nombre") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const rol = String(formData.get("rol") ?? "mozo") as Rol;

  if (!nombre || !email || !password) return { error: "Todos los campos son obligatorios" };
  if (password.length < 6) return { error: "La contraseña debe tener al menos 6 caracteres" };
  if (!["admin", "mozo", "cocina"].includes(rol)) return { error: "Rol inválido" };

  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nombre, rol },
  });

  if (error || !data.user) return { error: error?.message ?? "No se pudo crear el usuario" };

  // El trigger crea el profile con rol='cocina'; actualizar al rol correcto
  const { error: updateError } = await admin
    .from("profiles")
    .update({ rol })
    .eq("id", data.user.id);

  if (updateError) return { error: updateError.message };

  revalidatePath("/dashboard/usuarios");
  return { success: true };
}

export async function eliminarUsuario(userId: string): Promise<UsuarioState> {
  await requireRol("admin");

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/usuarios");
  return { success: true };
}
