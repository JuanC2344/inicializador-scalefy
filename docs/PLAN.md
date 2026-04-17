# Plan — GastroAdmin

Fases para llegar del bootstrap al MVP deployado. Cada fase es una unidad atómica: se completa, se verifica, se commitea.

**Leyenda estado:** `[ ]` pendiente · `[~]` en progreso · `[x]` completa

---

## Fase 1 — Schema de base de datos `[x]`

**Meta:** crear todas las tablas, relaciones y RLS del sistema.

**Archivos:**
- `supabase/migrations/0001_initial_schema.sql`

**Contenido:**
- Tabla `profiles` — extensión de `auth.users` con `nombre text`, `rol text` (admin / mozo / cocina), `pin char(4)` (solo mozos).
- Tabla `mesas` — `nombre text`, `capacidad int`, `estado text` (libre / ocupada / en_cuenta), `mozo_id uuid`.
- Tabla `categorias` — `nombre text`, `orden int`.
- Tabla `productos` — `nombre text`, `descripcion text`, `precio numeric`, `imagen_url text`, `activo boolean`, `categoria_id uuid`.
- Tabla `pedidos` — `mesa_id uuid`, `mozo_id uuid`, `estado text` (pendiente / en_preparacion / listo / entregado / cerrado), `total numeric`, `creado_en timestamptz`.
- Tabla `pedido_items` — `pedido_id uuid`, `producto_id uuid`, `cantidad int`, `precio_unitario numeric`, `nota text`.
- Tabla `stock_items` — `nombre text`, `unidad text`, `stock_actual numeric`, `stock_minimo numeric`.
- Tabla `stock_movimientos` — `stock_item_id uuid`, `tipo text` (entrada / salida), `cantidad numeric`, `nota text`, `fecha timestamptz`.
- Tabla `caja_cierres` — `fecha date`, `total_efectivo numeric`, `total_tarjeta numeric`, `total_otros numeric`, `total_general numeric`, `cerrado_por uuid`.
- RLS habilitada en todas las tablas.
- Policies por rol: admin lee/escribe todo; mozo lee mesas/carta y escribe pedidos propios; cocina solo lee pedidos activos.
- Trigger `handle_new_user` para crear `profile` al registrarse.

**Listo cuando:** migración aplicada en Supabase, tablas visibles en dashboard, RLS activa.

---

## Fase 2 — Autenticación y roles `[x]`

**Meta:** login funcional para los 3 roles con redirección correcta post-login.

**Archivos:**
- `app/(auth)/login/page.tsx` (form email+pass para admin; form PIN para mozo)
- `app/(auth)/actions.ts` (Server Actions: loginAdmin, loginMozo)
- `middleware.ts` (protege rutas según rol; /cocina valida token fijo)
- `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`
- `lib/roles.ts` (helper: getRol, requireRol)

**Listo cuando:** admin puede loguearse con email+pass, mozo con PIN, /cocina accesible solo con token correcto. Cada rol redirige a su vista.

---

## Fase 3 — Shell del dashboard admin `[x]`

**Meta:** layout protegido con navegación lateral para el admin.

**Archivos:**
- `app/dashboard/layout.tsx` (verifica auth + rol admin)
- `app/dashboard/page.tsx` (resumen rápido: mesas ocupadas, pedidos activos)
- `components/dashboard/sidebar.tsx` (links a Mesas, Carta, Pedidos, Caja, Stock, Reportes)
- `components/dashboard/user-menu.tsx` (nombre + logout)

**Listo cuando:** sin login redirige a `/login`; admin autenticado ve dashboard con sidebar funcional.

---

## Fase 4 — Mesas y carta digital `[ ]`

**Meta:** admin configura mesas y carta; mozo puede ver la carta.

**Archivos:**
- `app/dashboard/mesas/page.tsx` (grid de mesas con estado visual)
- `app/dashboard/mesas/actions.ts` (cambiar estado, asignar mozo)
- `app/dashboard/carta/page.tsx` (listado de categorías y productos)
- `app/dashboard/carta/actions.ts` (CRUD categorías y productos, toggle activo)
- `components/mesas/mesa-card.tsx` (tarjeta con estado coloreado)
- `components/carta/producto-form.tsx` (form crear/editar producto + subir imagen)

**Listo cuando:** admin ve grilla de mesas con estados, puede crear/editar productos y categorías, mozo ve carta activa.

---

## Fase 5 — Pedidos y comandas en tiempo real `[ ]`

**Meta:** mozo toma pedido → cocina lo ve al instante vía Supabase Realtime.

**Archivos:**
- `app/mozo/layout.tsx` (shell mozo: selección de mesa)
- `app/mozo/mesa/[id]/page.tsx` (carta interactiva + carrito + enviar comanda)
- `app/mozo/mesa/[id]/actions.ts` (Server Actions: crearPedido, agregarItem, cambiarEstado)
- `app/cocina/page.tsx` (vista solo lectura de comandas activas, sin auth compleja)
- `components/mozo/carrito.tsx` (items seleccionados + nota + enviar)
- `components/cocina/comanda-card.tsx` (muestra items + botones de estado)
- `hooks/use-comandas-realtime.ts` (suscripción Supabase Realtime)

**Listo cuando:** mozo envía pedido y cocina lo ve sin recargar; mozo puede cambiar estado a "listo"; estados se sincronizan en tiempo real.

---

## Fase 6 — Caja y facturación `[ ]`

**Meta:** admin cierra la cuenta de una mesa y genera ticket PDF.

**Archivos:**
- `app/dashboard/caja/page.tsx` (listado de mesas "en_cuenta")
- `app/dashboard/caja/[mesa_id]/page.tsx` (detalle de cuenta: items, total, descuento, medio de pago)
- `app/dashboard/caja/actions.ts` (cerrarCuenta, registrarPago, cierreDiario)
- `app/dashboard/caja/cierre/page.tsx` (resumen del cierre diario)
- `lib/pdf/ticket.ts` (genera ticket PDF con @react-pdf/renderer)
- `components/caja/cuenta-detalle.tsx`
- `components/caja/forma-pago.tsx`

**Listo cuando:** admin puede cerrar cuenta de mesa, registrar pago, descargar ticket PDF e imprimir; cierre de caja diario guarda totales.

---

## Fase 7 — Stock y reportes `[ ]`

**Meta:** control básico de inventario y reportes de ventas del día.

**Archivos:**
- `app/dashboard/stock/page.tsx` (listado de insumos con alertas visuales)
- `app/dashboard/stock/actions.ts` (CRUD insumos, registrar movimiento)
- `app/dashboard/reportes/page.tsx` (ventas del día, productos más vendidos, ingresos por medio de pago)
- `components/stock/insumo-row.tsx` (alerta si stock ≤ mínimo)
- `components/reportes/ventas-chart.tsx` (gráfico simple con recharts)

**Listo cuando:** admin ve stock actual con alertas de mínimo, puede ingresar movimientos manuales; reportes muestran datos reales del día.

---

## Fase 8 — Deploy `[ ]`

**Meta:** app online en Vercel con Supabase conectado.

**Pasos** (el comando `/deploy` los guía):
1. Conectar repo a Vercel (`vercel link`).
2. Configurar env vars en Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `COCINA_TOKEN`.
3. Aplicar migraciones SQL en Supabase producción.
4. Deploy: `vercel --prod`.
5. Verificar flujo completo: login admin → crear mesa → mozo toma pedido → cocina ve comanda → caja cierra cuenta.

**Listo cuando:** URL pública funciona, los 3 roles operan correctamente en producción.

---

_Generado por `/plan` en 2026-04-17. El comando `/construir` ejecuta la próxima fase con `[ ]`._
