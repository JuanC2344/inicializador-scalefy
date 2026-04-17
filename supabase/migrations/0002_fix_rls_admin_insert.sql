-- Fix: admin no tenía policies de INSERT/DELETE en pedidos y pedido_items
-- Sin estas, el admin actuando como mozo recibía "row violates RLS policy"

-- Pedidos: admin puede insertar y eliminar
create policy "pedidos_insert_admin"
  on public.pedidos for insert
  with check (get_my_rol() = 'admin');

create policy "pedidos_delete_admin"
  on public.pedidos for delete
  using (get_my_rol() = 'admin');

-- Pedido items: admin puede insertar, actualizar y eliminar
create policy "pedido_items_insert_admin"
  on public.pedido_items for insert
  with check (get_my_rol() = 'admin');

create policy "pedido_items_update_admin"
  on public.pedido_items for update
  using (get_my_rol() = 'admin');

create policy "pedido_items_delete_admin"
  on public.pedido_items for delete
  using (get_my_rol() = 'admin');
