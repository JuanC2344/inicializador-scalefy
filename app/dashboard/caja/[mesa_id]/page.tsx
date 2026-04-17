import { notFound } from "next/navigation";
import { requireRol } from "@/lib/roles";
import { getDatosCuenta } from "@/app/dashboard/caja/actions";
import { CuentaDetalle } from "@/components/caja/cuenta-detalle";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function CuentaMesaPage({
  params,
}: {
  params: Promise<{ mesa_id: string }>;
}) {
  const { mesa_id } = await params;
  await requireRol("admin");

  const { mesa, pedidos } = await getDatosCuenta(mesa_id);
  if (!mesa) notFound();

  // Normalizar tipos para el componente cliente
  const pedidosNorm = (pedidos as unknown as {
    id: string;
    total: number;
    creado_en: string;
    pedido_items: {
      id: string;
      cantidad: number;
      precio_unitario: number;
      nota: string | null;
      productos: { nombre: string } | null;
    }[];
  }[]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/caja"
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-semibold">Cuenta — {mesa.nombre}</h1>
      </div>

      {pedidosNorm.length === 0 ? (
        <p className="text-muted-foreground">No hay pedidos activos en esta mesa.</p>
      ) : (
        <CuentaDetalle
          mesaId={mesa_id}
          mesaNombre={mesa.nombre}
          pedidos={pedidosNorm}
        />
      )}
    </div>
  );
}
