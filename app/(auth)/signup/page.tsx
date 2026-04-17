import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignupForm } from "@/components/auth/signup-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function SignupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Crear cuenta de administrador</CardTitle>
          <CardDescription>
            La primera cuenta del sistema. Los mozos y la cocina se crean desde
            el panel admin después.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SignupForm />
          <p className="text-xs text-muted-foreground text-center">
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="underline">
              Ingresar
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
