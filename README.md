# Inicializador Scalefy

Plantilla para crear proyectos web completos desde una idea en una frase, guiado por Claude Code.

**Stack incluido:** Next.js 15 + TypeScript + Tailwind + shadcn/ui + Supabase (auth, base de datos y storage) + deploy en Vercel.

---

## Qué hace

Cloná este repo, abrí Claude Code, describí tu idea en una frase y Claude te lleva paso a paso: brainstorming → plan → código → deploy. Pensado para que tengas algo funcionando en minutos, no horas.

---

## Requisitos previos

1. **Node.js 20+** — [descargar](https://nodejs.org)
2. **Git** — [descargar](https://git-scm.com)
3. **Claude Code** — instalar siguiendo [docs oficiales](https://code.claude.com/docs/en/overview)
4. **Cuenta Supabase** (gratis) — [crear en supabase.com](https://supabase.com)
5. **Cuenta Vercel** (gratis, para deploy) — [crear en vercel.com](https://vercel.com)

---

## Cómo usar — paso a paso

### 1. Clonar el repo

```bash
git clone https://github.com/scalefy-system/inicializador-scalefy.git mi-proyecto
cd mi-proyecto
```

Reemplazá `mi-proyecto` por el nombre que quieras darle a tu app.

### 2. Instalar dependencias

```bash
npm install
```

Esto descarga las librerías necesarias. Demora 1-2 minutos la primera vez.

### 3. Configurar variables de entorno

Copiá el archivo de ejemplo:

**Mac / Linux:**
```bash
cp .env.example .env.local
```

**Windows (CMD):**
```cmd
copy .env.example .env.local
```

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env.local
```

Abrí `.env.local` y pegá las claves de tu proyecto Supabase:

1. Entrá a [supabase.com/dashboard](https://supabase.com/dashboard).
2. Creá un proyecto nuevo (o usá uno existente).
3. En el panel del proyecto → **Settings** → **API**.
4. Copiá **Project URL** a `NEXT_PUBLIC_SUPABASE_URL`.
5. Copiá **anon public** key a `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Guardá el archivo. **Nunca subas `.env.local` a Git** (ya está excluido en `.gitignore`).

### 4. Conectar el MCP de Supabase (recomendado)

El MCP (Model Context Protocol) deja que Claude Code hable directo con tu proyecto Supabase: crear tablas, correr SQL, leer logs, etc. sin que tengas que copiar/pegar.

**Paso 4.1 — Obtener el comando desde el Dashboard**

1. Entrá a [supabase.com/dashboard](https://supabase.com/dashboard) y abrí tu proyecto.
2. En la home del proyecto, expandí el botón **Connect** (arriba a la derecha).
3. Tab **MCP** → en **Feature Groups** marcá **todas** las opciones (account, branching, database, debugging, development, docs, functions, storage).
4. Copiá el comando del **Paso 1** (ya viene con tu `project_ref`).

**Paso 4.2 — Agregar el MCP con scope del proyecto**

Desde la carpeta del proyecto, pegá el comando que copiaste. Tiene esta forma:

```bash
claude mcp add --scope project --transport http supabase "https://mcp.supabase.com/mcp?project_ref=TU_PROJECT_REF&features=..."
```

Esto crea `.mcp.json` en la raíz del repo (scope `project` = queda compartido con quien clone el repo).

**Paso 4.3 — Autenticar**

Abrí Claude Code y corré:

```
/mcp
```

Seguí las instrucciones en consola para loguearte en Supabase. Una sola vez.

**Paso 4.4 (opcional) — Agent Skills de Supabase**

Instrucciones y scripts listos para que Claude trabaje mejor con Supabase:

```bash
npx skills add supabase/agent-skills
```

**Verificar que funciona:** en Claude Code escribí `/mcp`. Debería listar `supabase` como conectado.

### 5. Abrir Claude Code

Desde la carpeta del proyecto:

```bash
claude
```

### 6. Describir tu idea

En el chat de Claude Code, escribí:

```
/idea Quiero una app para que freelancers facturen a sus clientes
```

Reemplazá la frase por tu idea. Claude te hará 4-5 preguntas rápidas con opciones para elegir. En menos de 2 minutos queda definida la idea y el plan.

### 7. Revisar y construir

Cuando Claude te muestre el plan, revisalo. Si te gusta, escribí:

```
/construir
```

Claude empieza a escribir código fase por fase. Al terminar cada fase te avisa qué hizo y te pregunta si seguir.

### 8. Ver tu app corriendo

Mientras Claude construye, podés levantar el servidor local para ir viendo los cambios:

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) en tu navegador.

### 9. Deploy a producción

Cuando el MVP esté listo:

```
/deploy
```

Claude te guía para conectar con Vercel y publicar tu app en internet.

---

## Comandos disponibles

| Comando | Qué hace |
|---------|----------|
| `/idea [tu idea en una frase]` | Brainstorming inicial. Define qué vas a construir. |
| `/plan` | Genera el plan de fases basado en la idea. |
| `/construir` | Ejecuta la próxima fase pendiente del plan. |
| `/feature [descripción]` | Agrega una feature nueva a un proyecto ya arrancado. |
| `/arreglar [bug o error]` | Debug y corrección rápida. |
| `/deploy` | Guía para publicar en Vercel + Supabase. |

También podés hablar con Claude en lenguaje natural: "cambiá el color del botón a verde", "agregá una página de contacto", etc.

---

## Estructura del proyecto

```
mi-proyecto/
├── app/                    Rutas y páginas Next.js
├── components/
│   └── ui/                 Componentes shadcn (button, card, etc)
├── lib/
│   ├── supabase/           Clientes Supabase (navegador, servidor)
│   └── utils.ts            Helpers
├── supabase/
│   └── migrations/         Schema SQL de tu base de datos
├── docs/
│   ├── IDEA.md             Qué app es y para quién
│   └── PLAN.md             Fases del desarrollo
├── .claude/                Skills y comandos Scalefy (no tocar)
├── .mcp.json               Config MCP Supabase (se crea en paso 4)
├── .env.local              Tus claves (no subir a Git)
└── package.json
```

---

## Preguntas frecuentes

**¿Puedo cambiar el stack?**
Claude detecta si tu idea necesita otra cosa (ej: app móvil nativa → React Native) y te lo propone. Si preferís otro stack, decilo en el `/idea` inicial.

**¿Cuánto cuesta?**
- Claude Code: según tu plan Anthropic.
- Supabase: gratis hasta cierto límite de uso.
- Vercel: gratis para proyectos personales.

**¿Puedo modificar las skills?**
Sí, están en `.claude/skills/`. Pero si las rompés, puede dejar de funcionar el flujo. Hacé fork primero.

**¿Dónde configuro mis credenciales de Vercel para deploy?**
Claude te guía cuando corras `/deploy`. Vas a necesitar login con `vercel` CLI. Las credenciales quedan en tu máquina, no en el repo.

**¿Qué hago si Claude se confunde o toma una mala decisión?**
Corregilo en el momento ("no, mejor usá X"). Claude ajusta. Si hay problema grave, podés borrar `docs/PLAN.md` y correr `/plan` de nuevo.

---

## Seguridad

- El archivo `.env.local` **nunca** se sube al repo (ya está en `.gitignore`).
- Nunca pegues claves de API en el chat de Claude — configuralas en `.env.local`.
- `NEXT_PUBLIC_*` son variables visibles desde el navegador (está bien, Supabase anon key está diseñada para eso).
- `SUPABASE_SERVICE_ROLE_KEY` es secreta. Solo del lado servidor. Nunca con prefijo `NEXT_PUBLIC_`.
- Todas las tablas de Supabase deben tener Row Level Security (RLS) habilitada. Las skills lo hacen automático.

---

## Contribuir

Pull requests bienvenidos. Issues también. Este es un proyecto abierto de la comunidad Scalefy.

---

## Licencia

MIT. Usalo para lo que quieras.
