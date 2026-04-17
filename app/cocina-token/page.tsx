import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function CocinaTokenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Acceso a Cocina</CardTitle>
          <CardDescription>
            Ingresá el token configurado por el administrador.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/cocina" method="GET" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">Token</Label>
              <Input id="token" name="token" type="password" required autoFocus />
            </div>
            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
