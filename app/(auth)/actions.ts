"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { homeForRol, type Rol } from "@/lib/roles";

export type AuthState = { error?: string };

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email y contraseña son obligatorios" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return { error: "Debés confirmar tu email antes de ingresar. Revisá tu bandeja o desactivá la confirmación en Supabase." };
    }
    return { error: "Credenciales inválidas. Verificá email y contraseña." };
  }

  // Leer rol del profile para decidir a dónde redirigir
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No se pudo obtener la sesión" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user.id)
    .single();

  const rol = (profile?.rol as Rol) ?? "mozo";
  revalidatePath("/", "layout");
  redirect(homeForRol(rol));
}

export async function signupAdmin(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();

  if (!email || !password || !nombre) {
    return { error: "Todos los campos son obligatorios" };
  }
  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nombre, rol: "admin" },
    },
  });

  if (error || !data.user) {
    return { error: error?.message ?? "No se pudo crear la cuenta" };
  }

  // El trigger handle_new_user ya creó el profile con rol=admin (via raw_user_meta_data)
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
