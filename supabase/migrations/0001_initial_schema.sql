-- Migración inicial — GastroAdmin
-- Generada por skill scalefy-datos. Editá antes de aplicar si hace falta.

-- ============================================================
-- Extensiones
-- ============================================================
create extension if not exists "uuid-ossp";

-- ============================================================
-- Tabla profiles (extensión de auth.users)
-- ============================================================
create table if not exists public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  nombre      text,
  rol         text not null default 'mozo' check (rol in ('admin', 'mozo', 'cocina')),
  pin         char(4),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Función helper: devuelve el rol del usuario autenticado
create or replace function public.get_my_rol()
returns text
language sql
security definer
set search_path = public
as $$
  select rol from public.profiles where id = auth.uid();
$$;

-- Policies profiles
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id or get_my_rol() = 'admin');

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_admin"
  on public.profiles for update
  using (auth.uid() = id or get_my_rol() = 'admin');

create policy "profiles_delete_admin"
  on public.profiles for delete
  using (get_my_rol() = 'admin');

-- Trigger: crear profile al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nombre, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', new.email),
    coalesce(new.raw_user_meta_data->>'rol', 'mozo')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger genérico updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_profiles
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- Tabla mesas
-- ============================================================
create table if not exists public.mesas (
  id          uuid primary key default uuid_generate_v4(),
  nombre      text not null,
  capacidad   int not null default 4,
  estado      text not null default 'libre' check (estado in ('libre', 'ocupada', 'en_cuenta')),
  mozo_id     uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists mesas_mozo_id_idx on public.mesas(mozo_id);

alter table public.mesas enable row level security;

create policy "mesas_select_authenticated"
  on public.mesas for select
  using (auth.uid() is not null);

create policy "mesas_insert_admin"
  on public.mesas for insert
  with check (get_my_rol() = 'admin');

create policy "mesas_update_admin"
  on public.mesas for update
  using (get_my_rol() = 'admin');

create policy "mesas_delete_admin"
  on public.mesas for delete
  using (get_my_rol() = 'admin');

create trigger set_updated_at_mesas
  before update on public.mesas
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- Tabla categorias
-- ============================================================
create table if not exists public.categorias (
  id          uuid primary key default uuid_generate_v4(),
  nombre      text not null,
  orden       int not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.categorias enable row level security;

create policy "categorias_select_authenticated"
  on public.categorias for select
  using (auth.uid() is not null);

create policy "categorias_insert_admin"
  on public.categorias for insert
  with check (get_my_rol() = 'admin');

create policy "categorias_update_admin"
  on public.categorias for update
  using (get_my_rol() = 'admin');

create policy "categorias_delete_admin"
  on public.categorias for delete
  using (get_my_rol() = 'admin');

-- ============================================================
-- Tabla productos
-- ============================================================
create table if not exists public.productos (
  id            uuid primary key default uuid_generate_v4(),
  nombre        text not null,
  descripcion   text,
  precio        numeric(10,2) not null,
  imagen_url    text,
  activo        boolean not null default true,
  categoria_id  uuid references public.categorias(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists productos_categoria_id_idx on public.productos(categoria_id);
create index if not exists productos_activo_idx on public.productos(activo);

alter table public.productos enable row level security;

create policy "productos_select_authenticated"
  on public.productos for select
  using (auth.uid() is not null);

create policy "productos_insert_admin"
  on public.productos for insert
  with check (get_my_rol() = 'admin');

create policy "productos_update_admin"
  on public.productos for update
  using (get_my_rol() = 'admin');

create policy "productos_delete_admin"
  on public.productos for delete
  using (get_my_rol() = 'admin');

create trigger set_updated_at_productos
  before update on public.productos
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- Tabla pedidos
-- ============================================================
create table if not exists public.pedidos (
  id          uuid primary key default uuid_generate_v4(),
  mesa_id     uuid not null references public.mesas(id) on delete restrict,
  mozo_id     uuid references public.profiles(id) on delete set null,
  estado      text not null default 'pendiente'
                check (estado in ('pendiente', 'en_preparacion', 'listo', 'entregado', 'cerrado')),
  total       numeric(10,2) not null default 0,
  creado_en   timestamptz not null default now(),
  cerrado_en  timestamptz
);

create index if not exists pedidos_mesa_id_idx on public.pedidos(mesa_id);
create index if not exists pedidos_mozo_id_idx on public.pedidos(mozo_id);
create index if not exists pedidos_estado_idx on public.pedidos(estado);

alter table public.pedidos enable row level security;

-- Admin: ve y modifica todo
create policy "pedidos_select_admin"
  on public.pedidos for select
  using (get_my_rol() = 'admin');

create policy "pedidos_update_admin"
  on public.pedidos for update
  using (get_my_rol() = 'admin');

-- Mozo: crea y ve solo sus pedidos
create policy "pedidos_select_mozo"
  on public.pedidos for select
  using (get_my_rol() = 'mozo' and mozo_id = auth.uid());

create policy "pedidos_insert_mozo"
  on public.pedidos for insert
  with check (get_my_rol() = 'mozo' and mozo_id = auth.uid());

create policy "pedidos_update_mozo"
  on public.pedidos for update
  using (get_my_rol() = 'mozo' and mozo_id = auth.uid());

-- Cocina: ve pedidos no cerrados
create policy "pedidos_select_cocina"
  on public.pedidos for select
  using (get_my_rol() = 'cocina' and estado != 'cerrado');

-- Cocina: puede actualizar estado (pendiente → en_preparacion → listo)
create policy "pedidos_update_cocina"
  on public.pedidos for update
  using (get_my_rol() = 'cocina' and estado != 'cerrado');

-- ============================================================
-- Tabla pedido_items
-- ============================================================
create table if not exists public.pedido_items (
  id               uuid primary key default uuid_generate_v4(),
  pedido_id        uuid not null references public.pedidos(id) on delete cascade,
  producto_id      uuid not null references public.productos(id) on delete restrict,
  cantidad         int not null default 1 check (cantidad > 0),
  precio_unitario  numeric(10,2) not null,
  nota             text,
  created_at       timestamptz not null default now()
);

create index if not exists pedido_items_pedido_id_idx on public.pedido_items(pedido_id);

alter table public.pedido_items enable row level security;

create policy "pedido_items_select_admin"
  on public.pedido_items for select
  using (get_my_rol() = 'admin');

create policy "pedido_items_select_mozo"
  on public.pedido_items for select
  using (
    get_my_rol() = 'mozo' and
    exists (
      select 1 from public.pedidos
      where pedidos.id = pedido_id and pedidos.mozo_id = auth.uid()
    )
  );

create policy "pedido_items_insert_mozo"
  on public.pedido_items for insert
  with check (
    get_my_rol() = 'mozo' and
    exists (
      select 1 from public.pedidos
      where pedidos.id = pedido_id and pedidos.mozo_id = auth.uid()
    )
  );

create policy "pedido_items_select_cocina"
  on public.pedido_items for select
  using (
    get_my_rol() = 'cocina' and
    exists (
      select 1 from public.pedidos
      where pedidos.id = pedido_id and pedidos.estado != 'cerrado'
    )
  );

-- ============================================================
-- Tabla stock_items
-- ============================================================
create table if not exists public.stock_items (
  id             uuid primary key default uuid_generate_v4(),
  nombre         text not null,
  unidad         text not null,
  stock_actual   numeric(10,2) not null default 0,
  stock_minimo   numeric(10,2) not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.stock_items enable row level security;

create policy "stock_items_admin_only"
  on public.stock_items for all
  using (get_my_rol() = 'admin')
  with check (get_my_rol() = 'admin');

create trigger set_updated_at_stock_items
  before update on public.stock_items
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- Tabla stock_movimientos
-- ============================================================
create table if not exists public.stock_movimientos (
  id              uuid primary key default uuid_generate_v4(),
  stock_item_id   uuid not null references public.stock_items(id) on delete cascade,
  tipo            text not null check (tipo in ('entrada', 'salida')),
  cantidad        numeric(10,2) not null check (cantidad > 0),
  nota            text,
  creado_por      uuid references public.profiles(id) on delete set null,
  fecha           timestamptz not null default now()
);

create index if not exists stock_movimientos_stock_item_id_idx on public.stock_movimientos(stock_item_id);

alter table public.stock_movimientos enable row level security;

create policy "stock_movimientos_admin_only"
  on public.stock_movimientos for all
  using (get_my_rol() = 'admin')
  with check (get_my_rol() = 'admin');

-- ============================================================
-- Tabla caja_cierres
-- ============================================================
create table if not exists public.caja_cierres (
  id              uuid primary key default uuid_generate_v4(),
  fecha           date not null unique,
  total_efectivo  numeric(10,2) not null default 0,
  total_tarjeta   numeric(10,2) not null default 0,
  total_otros     numeric(10,2) not null default 0,
  total_general   numeric(10,2) not null default 0,
  cerrado_por     uuid references public.profiles(id) on delete set null,
  creado_en       timestamptz not null default now()
);

alter table public.caja_cierres enable row level security;

create policy "caja_cierres_admin_only"
  on public.caja_cierres for all
  using (get_my_rol() = 'admin')
  with check (get_my_rol() = 'admin');
