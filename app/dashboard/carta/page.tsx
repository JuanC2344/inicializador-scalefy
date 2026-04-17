import { createClient } from "@/lib/supabase/server";
import { requireRol } from "@/lib/roles";
import { CartaAdmin } from "@/components/carta/carta-admin";
import { BookOpen } from "lucide-react";

export default async function CartaPage() {
  await requireRol("admin");
  const supabase = await createClient();

  const [categoriasRes, productosRes] = await Promise.all([
    supabase.from("categorias").select("id, nombre").order("orden"),
    supabase
      .from("productos")
      .select("id, nombre, descripcion, precio, imagen_url, categoria_id, activo")
      .order("nombre"),
  ]);

  if (categoriasRes.error || productosRes.error) {
    return (
      <p className="text-destructive">
        Error al cargar la carta: {categoriasRes.error?.message ?? productosRes.error?.message}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          Carta digital
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Administrá categorías y productos. Los cambios se reflejan al instante.
        </p>
      </div>

      <CartaAdmin
        categorias={categoriasRes.data ?? []}
        productos={productosRes.data ?? []}
      />
    </div>
  );
}
