import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { homeForRol, type Rol } from "@/lib/roles";

/**
 * Raíz: redirige según estado de sesión.
 * - Con sesión → home del rol
 * - Sin sesión → /login
 */
export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user.id)
    .single();

  redirect(homeForRol((profile?.rol as Rol) ?? "mozo"));
}
