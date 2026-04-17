import { requireRol } from "@/lib/roles";
import { logout } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { ChefHat, LogOut } from "lucide-react";

export default async function MozoLayout({ children }: { children: React.ReactNode }) {
  const { nombre } = await requireRol(["mozo", "admin"]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between border-b bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          <ChefHat className="h-5 w-5 text-primary" />
          <span className="font-semibold">GastroAdmin — Mozo</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">{nombre ?? "Mozo"}</span>
          <form action={logout}>
            <Button variant="ghost" size="sm" type="submit">
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </header>
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
