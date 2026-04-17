import { createClient } from "@/lib/supabase/server";
import { requireRol } from "@/lib/roles";
import Link from "next/link";
import { cn } from "@/lib/utils";

const estadoColor: Record<string, string> = {
  libre: "border-green-300 bg-green-50",
  ocupada: "border-yellow-300 bg-yellow-50",
  en_cuenta: "border-red-300 bg-red-50",
};

const estadoLabel: Record<string, string> = {
  libre: "Libre",
  ocupada: "Ocupada",
  en_cuenta: "En cuenta",
};

export default async function MozoHomePage() {
  const { user } = await requireRol(["mozo", "admin"]);
  const supabase = await createClient();

  const { data: mesas } = await supabase
    .from("mesas")
    .select("id, nombre, capacidad, estado, mozo_id")
    .order("nombre");

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold">Seleccioná una mesa</h1>

      {!mesas?.length ? (
        <p className="text-muted-foreground text-sm">
          No hay mesas configuradas. Pedile al admin que las cree.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {mesas.map((mesa) => (
            <Link
              key={mesa.id}
              href={`/mozo/mesa/${mesa.id}`}
              className={cn(
                "rounded-xl border-2 p-4 flex flex-col gap-1 transition-transform active:scale-95 hover:shadow-md",
                estadoColor[mesa.estado] ?? "border-gray-200 bg-white",
                mesa.estado === "en_cuenta" && "pointer-events-none opacity-50",
              )}
            >
              <span className="font-bold text-base">{mesa.nombre}</span>
              <span className="text-xs text-muted-foreground">{mesa.capacidad} personas</span>
              <span className="text-xs font-medium mt-1">{estadoLabel[mesa.estado]}</span>
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
