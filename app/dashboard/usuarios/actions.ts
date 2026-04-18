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
  const numero = parseInt(String(formData.get("numero") ?? ""), 10);

  if (!nombre) return { error: "El nombre es obligatorio" };
  if (isNaN(numero) || numero < 0 || numero > 999) return { error: "El número debe estar entre 0 y 999" };

  const email = `mozo${numero}@gastro.app`;
  const password = `mozo${numero}`;
  const rol: Rol = "mozo";

  const admin = createAdminClient();

  // Verificar que el número no esté en uso
  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existing) return { error: `El número ${numero} ya está en uso` };

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nombre, rol },
  });

  if (error || !data.user) return { error: error?.message ?? "No se pudo crear el usuario" };

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
