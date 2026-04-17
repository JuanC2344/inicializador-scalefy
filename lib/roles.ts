import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Rol = "admin" | "mozo" | "cocina";

/**
 * Devuelve el rol del usuario autenticado, o null si no hay sesión.
 * Para uso en Server Components y Server Actions.
 */
export async function getRol(): Promise<Rol | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user.id)
    .single();

  return (profile?.rol as Rol) ?? null;
}

/**
 * Devuelve user + rol. Redirige a /login si no hay sesión.
 * Redirige a /login?error=forbidden si el rol no coincide.
 */
export async function requireRol(rol: Rol | Rol[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("rol, email")
    .eq("id", user.id)
    .single();

  const permitidos = Array.isArray(rol) ? rol : [rol];
  if (!profile || !permitidos.includes(profile.rol as Rol)) {
    redirect("/login?error=forbidden");
  }

  return { user, rol: profile.rol as Rol, nombre: (profile.email as string | null) ?? user.email ?? null };
}

/**
 * Ruta por defecto según rol (usada tras login).
 */
export function homeForRol(rol: Rol): string {
  switch (rol) {
    case "admin":
      return "/dashboard";
    case "mozo":
      return "/mozo";
    case "cocina":
      return "/cocina";
  }
}
