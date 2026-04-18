import { createClient } from "@/lib/supabase/server";
import { requireRol } from "@/lib/roles";
import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

const estadoColor: Record<string, string> = {
  libre: "border-green-400 bg-green-50 hover:bg-green-100 dark:bg-green-950/20 dark:hover:bg-green-950/40",
  ocupada: "border-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40",
  en_cuenta: "border-yellow-400 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-950/20 dark:hover:bg-yellow-950/40",
};

const estadoLabel: Record<string, string> = {
  libre: "Libre",
  ocupada: "Ocupada",
  en_cuenta: "En cuenta",
};

export default async function DashboardMozoPage() {
  const { user } = await requireRol("admin");
  const supabase = await createClient();

  const { data: mesas } = await supabase
    .from("mesas")
    .select("id, nombre, capacidad, estado, mozo_id")
    .order("nombre");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <UtensilsCrossed className="h-6 w-6" />
          Vista mozo
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Seleccioná una mesa para cargar items.
        </p>
      </div>

      {!mesas?.length ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          No hay mesas configuradas. Creá una desde{" "}
          <Link href="/dashboard/mesas" className="underline">
            Mesas
          </Link>
          .
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {mesas.map((mesa) => (
            <Link
              key={mesa.id}
              href={`/dashboard/mozo/mesa/${mesa.id}`}
              className={cn(
                "rounded-xl border-2 p-4 flex flex-col gap-1 transition-all active:scale-95",
                estadoColor[mesa.estado] ?? "border-gray-300 bg-card hover:bg-muted",
                mesa.estado === "en_cuenta" && "pointer-events-none opacity-50",
              )}
            >
              <span className="font-bold text-base">{mesa.nombre}</span>
              <span className="text-xs text-muted-foreground">{mesa.capacidad} personas</span>
              <span className="text-xs font-medium mt-1">{estadoLabel[mesa.estado] ?? mesa.estado}</span>
              {mesa.mozo_id === user.id && mesa.estado !== "libre" && (
                <span className="text-xs text-primary font-medium">Tuya</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
