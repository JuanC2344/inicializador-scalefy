import { requireRol } from "@/lib/roles";
import { Sidebar } from "@/components/dashboard/sidebar";
import { UserMenu } from "@/components/dashboard/user-menu";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Protege toda la sección /dashboard — redirige a /login si no es admin
  const { nombre, rol } = await requireRol("admin");

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-end border-b bg-card px-6 py-3">
          <UserMenu nombre={nombre} rol={rol} />
        </header>

        {/* Contenido de cada página */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
