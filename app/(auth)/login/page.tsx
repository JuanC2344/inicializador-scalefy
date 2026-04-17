import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { homeForRol, type Rol } from "@/lib/roles";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  // Si ya hay sesión, redirigir al home del rol
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("rol")
      .eq("id", user.id)
      .single();
    const rol = (profile?.rol as Rol) ?? "mozo";
    redirect(homeForRol(rol));
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Ingresar a GastroAdmin</CardTitle>
          <CardDescription>
            Usá tu email y contraseña para acceder.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {params.error === "forbidden" && (
            <p className="text-sm text-destructive">
              No tenés permisos para acceder a esa sección.
            </p>
          )}
          <LoginForm />
          <p className="text-xs text-muted-foreground text-center">
            ¿Primera vez?{" "}
            <Link href="/signup" className="underline">
              Crear cuenta de administrador
            </Link>
          </p>
          <p className="text-xs text-muted-foreground text-center">
            Vista de cocina:{" "}
            <Link href="/cocina" className="underline">
              entrar con token
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
