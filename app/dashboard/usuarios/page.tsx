import { requireRol } from "@/lib/roles";
import { listarUsuarios, eliminarUsuario } from "@/app/dashboard/usuarios/actions";
import { NuevoUsuarioDialog } from "@/components/usuarios/nuevo-usuario-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const rolBadgeClass: Record<string, string> = {
  admin: "bg-blue-100 text-blue-800 border-blue-200",
  mozo: "bg-green-100 text-green-800 border-green-200",
  cocina: "bg-orange-100 text-orange-800 border-orange-200",
};

const rolLabel: Record<string, string> = {
  admin: "Admin",
  mozo: "Mozo",
  cocina: "Cocina",
};

async function EliminarBtn({ userId }: { userId: string }) {
  async function eliminar() {
    "use server";
    await eliminarUsuario(userId);
  }

  return (
    <form action={eliminar}>
      <Button
        type="submit"
        size="sm"
        variant="ghost"
        className="text-muted-foreground hover:text-destructive"
        onClick={undefined}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </form>
  );
}

export default async function UsuariosPage() {
  await requireRol("admin");
  const usuarios = await listarUsuarios();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Usuarios
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gestioná los accesos al sistema por rol.
          </p>
        </div>
        <NuevoUsuarioDialog />
      </div>

      {usuarios.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          No hay usuarios creados aún.
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Email</th>
                <th className="text-left px-4 py-2 font-medium">Rol</th>
                <th className="text-left px-4 py-2 font-medium hidden sm:table-cell">
                  Creado
                </th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-medium">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={cn("text-xs", rolBadgeClass[u.rol] ?? "")}
                    >
                      {rolLabel[u.rol] ?? u.rol}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {new Date(u.created_at).toLocaleDateString("es-AR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <EliminarBtn userId={u.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
