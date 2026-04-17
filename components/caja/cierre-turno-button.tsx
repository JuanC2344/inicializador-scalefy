"use client";

import { useState } from "react";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CierreTurnoButton() {
  const [rango, setRango] = useState<"hoy" | "8h">("hoy");
  const [descargando, setDescargando] = useState(false);

  async function descargar() {
    setDescargando(true);
    try {
      const res = await fetch(`/dashboard/caja/cierre-turno?rango=${rango}`);
      if (!res.ok) throw new Error("Error al generar el Excel");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      // Extraer filename del header o armar uno
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? `cierre-turno-${Date.now()}.xlsx`;

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("No se pudo descargar el cierre de turno.");
    } finally {
      setDescargando(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={rango} onValueChange={(v) => setRango(v as "hoy" | "8h")}>
        <SelectTrigger className="w-40 h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="hoy">Turno del día</SelectItem>
          <SelectItem value="8h">Últimas 8 horas</SelectItem>
        </SelectContent>
      </Select>

      <Button onClick={descargar} disabled={descargando} size="sm" className="gap-1.5">
        {descargando ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="h-4 w-4" />
        )}
        {descargando ? "Generando…" : "Cierre de turno"}
      </Button>
    </div>
  );
}
