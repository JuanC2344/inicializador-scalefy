# GastroAdmin

## Qué es

App web de administración para bar/restaurante con roles diferenciados (admin, mozo, cocina), pedidos en tiempo real, caja, stock y reportes — todo sin inversión en infraestructura.

## Para quién

Dueños y encargados de bares/restaurantes (B2B) que gestionan un único local con personal de sala y cocina. Usan tablets en sala y una pantalla fija en cocina.

## Problema que resuelve

Gestionar pedidos, mesas y caja con papel o planillas genera errores, demoras en cocina y pérdida de control sobre ventas y stock. Esta app centraliza todo en tiempo real desde cualquier dispositivo sin necesidad de hardware especial.

## Features del MVP

- **Roles y auth**: Admin (email + contraseña), Mozo (PIN numérico), Cocina (URL con token fijo)
- **Gestión de mesas**: Grid configurable, estados (libre / ocupada / en cuenta), asignación de mozo
- **Carta digital**: Categorías, productos con precio e imagen, activar/desactivar sin eliminar
- **Pedidos / comandas**: Mozo arma pedido → cocina lo ve en tiempo real (Supabase Realtime); estados pendiente → en preparación → listo → entregado
- **Caja**: Cuenta de mesa, descuentos, medios de pago (efectivo / tarjeta / otros), ticket PDF imprimible, cierre de caja diario
- **Stock básico**: Listado de insumos, movimientos manuales de entrada/salida, alertas de stock mínimo
- **Reportes diarios**: Ventas del día, productos más vendidos, ingresos por medio de pago

## Features explícitamente fuera del MVP

- Reservas con fecha/hora (agregar con `/feature` después del MVP)
- Drag-and-drop de mesas (MVP usa grid simple; D&D se agrega como mejora visual)
- Consumo automático de stock por pedido (manual en MVP, automatizar en v2)
- Split de cuenta entre comensales
- App móvil nativa

## Entidad principal

`pedido` (comanda) — los datos centrales que mozos crean y cocina procesa en tiempo real.

## Autenticación

- **Admin**: email + contraseña vía Supabase Auth
- **Mozos**: PIN numérico de 4 dígitos (Supabase Auth con cuenta genérica por mozo)
- **Cocina**: URL protegida con token fijo configurado por el admin
- RLS en Supabase controla qué datos puede leer/escribir cada rol

## Monetización

Suscripción mensual — pricing por definir. El MVP no incluye lógica de pagos; se agrega en v2 con `/feature`.

## Stack

- **Frontend:** Next.js 15 (App Router, TypeScript) + Tailwind + shadcn/ui
- **Backend:** Next.js Server Actions + Route Handlers
- **Base de datos:** Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Deploy:** Vercel (frontend, free tier) + Supabase (DB, free tier)

> **Nota de stack:** Tu diseño original usaba React+Vite+Express+Socket.io+PostgreSQL con Docker. Migramos a Next.js+Supabase para eliminar toda inversión en infraestructura: Vercel y Supabase tienen free tier generoso. **Supabase Realtime reemplaza Socket.io** sin servidor extra ni Docker. RLS de Supabase reemplaza el middleware JWT custom.

---

_Generado por `/idea` en 2026-04-17. Editá a mano si algo cambia._
