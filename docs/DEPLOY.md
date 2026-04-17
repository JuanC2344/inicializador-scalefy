# Deploy — GastroAdmin

Guía para poner la app online con **Vercel** (frontend) + **Supabase** (DB + auth).
Tiempo estimado: 15–20 min la primera vez.

---

## 1. Pre-requisitos

- Cuenta en [vercel.com](https://vercel.com) (gratis).
- Cuenta en [supabase.com](https://supabase.com) (gratis).
- Git instalado y este repo ya pusheado a GitHub/GitLab/Bitbucket.
- Build local pasa: `npm run build` sin errores.

---

## 2. Supabase producción

### 2.1. Crear proyecto

1. Entrá a [supabase.com/dashboard](https://supabase.com/dashboard).
2. **New project** → elegí nombre (ej: `gastroadmin-prod`), región cercana, password fuerte para la DB (guardala).
3. Esperá ~2 min a que se provisionen los servicios.

### 2.2. Aplicar migraciones

Abrí **SQL Editor** en el dashboard y ejecutá, en orden, el contenido de:

1. `supabase/migrations/0001_initial_schema.sql`
2. `supabase/migrations/0002_fix_rls_admin_insert.sql`

Verificá en **Table Editor** que aparecen: `profiles`, `mesas`, `categorias`, `productos`, `pedidos`, `pedido_items`, `stock_items`, `stock_movimientos`, `caja_cierres`.

### 2.3. Habilitar Realtime

En **SQL Editor** corré:

```sql
alter publication supabase_realtime add table public.pedidos;
alter publication supabase_realtime add table public.pedido_items;
```

Si dice "relation is already member" ✓ ya estaba.

### 2.4. Copiar claves

**Settings → API**:
- `Project URL` → usar como `NEXT_PUBLIC_SUPABASE_URL`.
- `anon public` → usar como `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### 2.5. Desactivar confirmación de email (opcional — recomendado para demo)

**Authentication → Providers → Email** → desmarcá **"Confirm email"** → Save.
Sin este cambio, al hacer signup de admin el usuario no podrá loguearse hasta confirmar su email.

---

## 3. Vercel

### 3.1. Importar proyecto

1. [vercel.com/new](https://vercel.com/new) → **Import Git Repository** → elegí tu repo.
2. Framework: **Next.js** (detectado automáticamente).
3. No toques "Build command" ni "Output directory".

### 3.2. Variables de entorno

En la pantalla de importación, expandí **Environment Variables** y cargá:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | (de paso 2.4) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (de paso 2.4) |
| `COCINA_TOKEN` | un string random largo — generalo con `openssl rand -base64 24` |

**Guardá el `COCINA_TOKEN`** — lo vas a usar para que la cocina acceda.

### 3.3. Deploy

Click **Deploy**. Espera 2–3 min. Obtenés una URL tipo `https://gastroadmin-xxx.vercel.app`.

---

## 4. Verificación post-deploy

Abrí la URL pública y probá el flujo completo:

- [ ] **Signup admin**: `/signup` → crear cuenta → redirige a `/dashboard`.
- [ ] **Login**: `/login` con mismas credenciales → entra a `/dashboard`.
- [ ] **Crear mesa**: `/dashboard/mesas` → "Nueva mesa" → aparece en grilla.
- [ ] **Crear categoría + producto**: `/dashboard/carta` → agregar al menos 1 producto activo.
- [ ] **Tomar pedido como mozo**: `/mozo` → seleccionar mesa → agregar items → enviar.
- [ ] **Ver comanda en cocina**: abrir `/cocina-token` → pegar `COCINA_TOKEN` → aparece la comanda en `/cocina`.
- [ ] **Cambiar estado en cocina**: "Comenzar preparación" → "Marcar listo". La comanda se mueve a la sección colapsable "Comandas listas".
- [ ] **Cerrar cuenta en caja**: `/dashboard/caja` → elegir mesa → seleccionar medio de pago → "Cerrar cuenta".
- [ ] **Descargar ticket PDF**: botón en el detalle de caja.
- [ ] **Stock**: `/dashboard/stock` → crear insumo → registrar entrada/salida.
- [ ] **Reportes**: `/dashboard/reportes` → ver KPIs del día tras cerrar una cuenta.

---

## 5. Compartir acceso

- **Admin**: usa su email + password en `/login`.
- **Mozos**: el admin le crea cuentas con `/signup` y después cambia el `rol` a `mozo` en la tabla `profiles` (Supabase → Table Editor → profiles → editar fila).
- **Cocina**: pantalla dedicada. Enviá el link `https://tu-app.vercel.app/cocina-token` al dispositivo de cocina. Pegan el token una vez y queda guardado en cookie.

---

## 6. Troubleshooting

**"Credenciales inválidas" tras signup**
→ Paso 2.5 no se hizo. Entrá a Authentication → Users → confirmá el email manualmente, o desactivá "Confirm email".

**Las comandas no se actualizan solas**
→ Paso 2.3 no se hizo. El polling cada 4s sigue funcionando, pero Realtime es más rápido.

**"new row violates row-level security policy"**
→ Falta aplicar `0002_fix_rls_admin_insert.sql`. Correr en SQL Editor.

**Build falla en Vercel por tipos**
→ Correr `npm run typecheck` local. Corregir, pushear, re-deployar.

**Tickets PDF se ven raros**
→ `@react-pdf/renderer` puede tener problemas con algunas fuentes en serverless. Probar en el browser del cliente (el componente usa `dynamic({ ssr: false })`).

---

## 7. Actualizaciones futuras

Cada `git push` a `main` dispara un deploy automático en Vercel. Para cambios de schema:

1. Crear nueva migración `supabase/migrations/000X_descripcion.sql`.
2. Aplicarla manualmente en Supabase SQL Editor (producción).
3. Commit + push.
