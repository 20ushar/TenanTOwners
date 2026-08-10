begin;

-- EMERGENCY COMPATIBILITY ROLLBACK ONLY. This temporarily reopens the legacy
-- full-row public read path so the previous frontend can be restored.
grant select on table public.properties to anon, authenticated;

drop policy if exists "Public can read properties" on public.properties;
create policy "Public can read properties"
on public.properties
for select
to anon, authenticated
using (true);

commit;a
