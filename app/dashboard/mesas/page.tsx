import { createClient } from "@/lib/supabase/server";
import { requireRol } from "@/lib/roles";
import { MesaCard } from "@/components/mesas/mesa-card";
import { NuevaMesaDialog } from "@/components/mesas/nueva-mesa-dialog";
import { LayoutGrid } from "lucide-react";

export default async function MesasPage() {
  await requireRol("admin");
  const supabase = await createClient();

  const [{ data: mesas, error }, { data: mozos }] = await Promise.all([
    supabase.from("mesas").select("id, nombre, capacidad, estado").order("nombre"),
    supabase.from("profiles").select("id, email").eq("rol", "mozo").order("email"),
  ]);

  if (error) {
    return <p className="text-destructive">Error al cargar mesas: {error.message}</p>;
  }

  const libre = mesas?.filter((m) => m.estado === "libre").length ?? 0;
  const ocupada = mesas?.filter((m) => m.estado === "ocupada").length ?? 0;
  const en_cuenta = mesas?.filter((m) => m.estado === "en_cuenta").length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <LayoutGrid className="h-6 w-6" />
            Mesas
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {libre} libres · {ocupada} ocupadas · {en_cuenta} en cuenta
          </p>
        </div>
        <NuevaMesaDialog />
      </div>

      {!mesas || mesas.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          No hay mesas configuradas. Creá la primera con el botón de arriba.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {mesas.map((mesa) => (
            <MesaCard
              key={mesa.id}
              mesa={mesa as { id: string; nombre: string; capacidad: number; estado: "libre" | "ocupada" | "en_cuenta" }}
              mozos={(mozos ?? []) as { id: string; email: string }[]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
