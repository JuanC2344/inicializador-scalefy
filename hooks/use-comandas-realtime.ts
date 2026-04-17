"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface PedidoItem {
  id: string;
  cantidad: number;
  precio_unitario: number;
  nota: string | null;
  productos: { nombre: string } | null;
}

export interface Comanda {
  id: string;
  estado: "pendiente" | "en_preparacion" | "listo" | "entregado" | "cerrado";
  creado_en: string;
  total: number;
  mesas: { nombre: string } | null;
  profiles: { nombre: string | null } | null;
  pedido_items: PedidoItem[];
}

/**
 * Hook que suscribe a Supabase Realtime y devuelve comandas activas
 * (estado != 'cerrado'). Se actualiza en tiempo real sin recargar.
 */
export function useComandasRealtime(soloActivas = true) {
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchComandas() {
      const query = supabase
        .from("pedidos")
        .select(
          `id, estado, creado_en, total,
           mesas(nombre),
           profiles(nombre),
           pedido_items(id, cantidad, precio_unitario, nota, productos(nombre))`,
        )
        .order("creado_en", { ascending: true });

      if (soloActivas) query.neq("estado", "cerrado");

      const { data } = await query;
      setComandas((data as unknown as Comanda[]) ?? []);
      setLoading(false);
    }

    fetchComandas();

    // Suscripción Realtime: escucha INSERT y UPDATE en pedidos
    const channel = supabase
      .channel("comandas-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pedidos" },
        () => {
          fetchComandas();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pedido_items" },
        () => {
          fetchComandas();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [soloActivas]);

  return { comandas, loading };
}
