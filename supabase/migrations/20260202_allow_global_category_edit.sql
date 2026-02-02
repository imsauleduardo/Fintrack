-- Permitir a los usuarios autenticados editar categorías globales (user_id IS NULL)
-- Esto es útil para instalaciones de un solo usuario o administradores.

create policy "Enable update for global categories"
on "public"."categories"
for update
to authenticated
using (user_id is null or user_id = auth.uid());

-- También asegurarnos de que el INSERT permita crear (ya debería estar, pero por si acaso)
-- No tocamos insert, solo update.
