begin;

-- Refuse to remove compatibility access unless Stage A is present and its
-- intended RPC grants exist. Any failure aborts and rolls back this stage.
do $$
begin
  if to_regprocedure('public.get_public_properties(text,text[],text,text)') is null then
    raise exception 'Stage A RPC is missing; refusing properties lockdown';
  end if;

  if not has_function_privilege('anon', 'public.get_public_properties(text,text[],text,text)', 'EXECUTE')
     or not has_function_privilege('authenticated', 'public.get_public_properties(text,text[],text,text)', 'EXECUTE') then
    raise exception 'Stage A RPC grants are incomplete; refusing properties lockdown';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_policies
    where schemaname = 'public'
      and tablename = 'properties'
      and policyname = 'Admins manage properties'
  ) then
    raise exception 'Admin properties policy is missing; refusing properties lockdown';
  end if;
end
$$;

-- Remove the legacy policy that exposes every properties column. Anonymous
-- clients also lose their table-level SELECT grant. Authenticated retains its
-- table grant so the existing admin RLS policy can authorize administrators;
-- ordinary authenticated users have no applicable SELECT policy and see zero
-- base-table rows.
drop policy if exists "Public can read properties" on public.properties;
revoke select on table public.properties from public, anon;

commit;
