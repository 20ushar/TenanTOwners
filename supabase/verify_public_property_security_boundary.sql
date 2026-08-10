-- Run only after applying both Stage A and Stage B.
-- Every statement is read-only; role/JWT changes are local to rolled-back transactions.

-- Expected: anon_direct_select = false.
select has_table_privilege('anon', 'public.properties', 'select') as anon_direct_select;

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

-- Expected: false, true, true (PUBLIC execution was revoked).
select
  has_function_privilege('anon', 'private.is_property_accepting_applications(text)', 'execute') as anon_application_helper,
  has_function_privilege('authenticated', 'private.is_property_accepting_applications(text)', 'execute') as authenticated_application_helper,
  not exists (
    select 1
    from pg_proc as p
    cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) as a
    where p.oid = 'private.is_property_accepting_applications(text)'::regprocedure
      and a.grantee = 0
      and a.privilege_type = 'EXECUTE'
  ) as public_helper_execute_revoked;

-- Expected: false, false, true, false, true. PUBLIC must have no schema ACL.
select
  has_schema_privilege('anon', 'private', 'usage') as anon_private_usage,
  has_schema_privilege('anon', 'private', 'create') as anon_private_create,
  has_schema_privilege('authenticated', 'private', 'usage') as authenticated_private_usage,
  has_schema_privilege('authenticated', 'private', 'create') as authenticated_private_create,
  not exists (
    select 1
    from pg_namespace as n
    cross join lateral aclexplode(coalesce(n.nspacl, acldefault('n', n.nspowner))) as a
    where n.nspname = 'private'
      and a.grantee = 0
      and a.privilege_type in ('USAGE', 'CREATE')
  ) as public_private_privileges_revoked;

-- Expected: false. RLS also has no anonymous application INSERT policy.
select has_table_privilege('anon', 'public.applications', 'insert') as anon_application_insert;

-- No private property columns should appear in this fixed return type.
select pg_get_function_result('public.get_public_properties(text,text[],text,text)'::regprocedure);

-- Expected property SELECT policy: only the existing administrator policy.
select policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'properties'
order by policyname;

-- Expected application INSERT role: {authenticated}; its expression must bind
-- user_id to current_firebase_uid and call the private availability helper.
select policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'applications'
order by policyname;

-- Anonymous users can call the allowlisted public RPC.
begin;
set local role anon;
select id, property_code, title, listing_type, status, price, location
from public.get_public_properties(null, null, null, null)
limit 1;
rollback;

-- An authenticated non-admin retains the table grant needed by the shared
-- authenticated admin role, but RLS must expose zero base-table rows.
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"phase1-security-test","email":"nonadmin@example.invalid"}';
select count(*) as non_admin_direct_property_rows from public.properties;
rollback;

-- An authorized administrator must still pass the full-table RLS policy.
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"phase1-admin-test","email":"tenantownerofficial@gmail.com"}';
select count(*) as admin_direct_property_rows from public.properties;
rollback;
