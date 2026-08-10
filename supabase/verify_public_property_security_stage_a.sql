-- Run after Stage A and before deploying the RPC frontend. Read-only checks.

-- Expected: true. Compatibility access must still exist until Stage B.
select exists (
  select 1
  from pg_policies
  where schemaname = 'public'
    and tablename = 'properties'
    and policyname = 'Public can read properties'
) as legacy_property_policy_retained;

-- Expected: true, true, true (PUBLIC execution was revoked).
select
  has_function_privilege('anon', 'public.get_public_properties(text,text[],text,text)', 'execute') as anon_public_rpc,
  has_function_privilege('authenticated', 'public.get_public_properties(text,text[],text,text)', 'execute') as authenticated_public_rpc,
  not exists (
    select 1
    from pg_proc as p
    cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) as a
    where p.oid = 'public.get_public_properties(text,text[],text,text)'::regprocedure
      and a.grantee = 0
      and a.privilege_type = 'EXECUTE'
  ) as public_execute_revoked;

-- Expected: false, false, true, false.
select
  has_schema_privilege('anon', 'private', 'usage') as anon_private_usage,
  has_schema_privilege('anon', 'private', 'create') as anon_private_create,
  has_schema_privilege('authenticated', 'private', 'usage') as authenticated_private_usage,
  has_schema_privilege('authenticated', 'private', 'create') as authenticated_private_create;

-- Expected: false, true. Anonymous application INSERT remains unavailable.
select
  has_function_privilege('anon', 'private.is_property_accepting_applications(text)', 'execute') as anon_application_helper,
  has_function_privilege('authenticated', 'private.is_property_accepting_applications(text)', 'execute') as authenticated_application_helper;
select has_table_privilege('anon', 'public.applications', 'insert') as anon_application_insert;

-- Expected: one public row (if properties exist), with only named columns.
begin;
set local role anon;
select id, property_code, title, listing_type, status, price, location
from public.get_public_properties(null, null, null, null)
limit 1;
rollback;
