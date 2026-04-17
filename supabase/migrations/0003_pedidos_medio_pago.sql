-- Guarda el medio de pago y el descuento por pedido cerrado.
-- Hasta ahora solo se acumulaban totales en caja_cierres, pero no se
-- podía reconstruir el desglose por pedido (necesario para el cierre de turno).

alter table public.pedidos
  add column if not exists medio_pago text check (medio_pago in ('efectivo', 'tarjeta', 'otros')),
  add column if not exists descuento numeric default 0;
