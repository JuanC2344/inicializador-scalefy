/**
 * Vista placeholder de Cocina. La Fase 5 implementa la vista real con Realtime.
 * El acceso ya está gateado por el middleware (valida COCINA_TOKEN).
 */
export default function CocinaPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Cocina — Comandas</h1>
        <p className="text-sm text-muted-foreground">
          Esta vista se completará en la Fase 5 con las comandas en tiempo real.
        </p>
      </header>
      <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
        Sin comandas aún.
      </div>
    </div>
  );
}
