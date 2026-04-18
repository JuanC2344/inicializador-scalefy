import { requireRol } from "@/lib/roles";
import { CocinaRealtime } from "@/components/cocina/cocina-realtime";
import { Flame } from "lucide-react";

export default async function DashboardCocinaPage() {
  await requireRol("admin");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Flame className="h-6 w-6" />
          Cocina
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Comandas activas en tiempo real.
        </p>
      </div>
      <CocinaRealtime embedded />
    </div>
  );
}
