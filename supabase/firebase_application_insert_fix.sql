begin;

-- Firebase JWTs without a Supabase role claim execute as the Postgres anon
-- role. This helper still requires a real Firebase subject and binds every
-- application to that subject, so unsigned visitors remain blocked by RLS.
create or replace function public.can_submit_property_application(
  p_property_id text,
  p_user_id text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    public.current_firebase_uid() is not null
    and length(trim(public.current_firebase_uid())) > 0
    and p_user_id = public.current_firebase_uid()
    and exists (
      select 1
      from public.properties as p
      where p.id = p_property_id
        and not (
          p.listing_type = 'rent'
          and p.availability_status = 'rented_out'
        )
    )
$$;

revoke execute
on function public.can_submit_property_application(text, text)
from public, anon, authenticated;

grant execute
on function public.can_submit_property_application(text, text)
to anon, authenticated;

grant insert on table public.applications to anon, authenticated;

drop policy if exists "Users create applications"
on public.applications;

create policy "Users create applications"
on public.applications
for insert
to anon, authenticated
with check (
  public.can_submit_property_application(property_id, user_id)
);

commit;
