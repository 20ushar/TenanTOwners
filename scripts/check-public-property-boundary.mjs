import assert from 'node:assert/strict';
import fs from 'node:fs';

const store = fs.readFileSync(new URL('../src/lib/store.ts', import.meta.url), 'utf8');
const schema = fs.readFileSync(new URL('../supabase/schema.sql', import.meta.url), 'utf8');
const stageA = fs.readFileSync(new URL('../supabase/public_property_security_stage_a_compatibility.sql', import.meta.url), 'utf8');
const stageB = fs.readFileSync(new URL('../supabase/public_property_security_stage_b_lockdown.sql', import.meta.url), 'utf8');
const migration = `${stageA}\n${stageB}`;

const privateColumns = [
  'created_by', 'tower', 'flat_number', 'unit_number', 'contact_phone',
  'owner_name', 'owner_contact', 'tenant_name', 'tenant_contact',
  'status_updated_at', 'status_updated_by', 'rented_out_at',
];

assert.ok(!/create\s+(?:or\s+replace\s+)?view\s+public\.public_properties/i.test(migration), 'Unsafe public view design remains');

const publicRpc = migration.match(/create or replace function public\.get_public_properties[\s\S]*?\n\$\$;/i)?.[0];
assert.ok(publicRpc, 'Public property RPC definition is missing');
assert.match(publicRpc, /returns table\s*\(/i);
assert.match(publicRpc, /security definer/i);
assert.match(publicRpc, /set search_path = ''/i);
assert.ok(!/\bp\.\*/i.test(publicRpc), 'Public RPC uses a row wildcard');
assert.ok(!/\bexecute\b|\bformat\s*\(/i.test(publicRpc), 'Public RPC contains dynamic SQL');
assert.match(publicRpc, /cardinality\(p_property_ids\) <= 100/i);

const rpcReturn = publicRpc.match(/returns table\s*\(([\s\S]*?)\)\s*language/i)?.[1];
const rpcSelect = publicRpc.match(/as \$\$\s*select([\s\S]*?)from public\.properties/i)?.[1];
assert.ok(rpcReturn && rpcSelect, 'RPC return or select allowlist is missing');
for (const column of privateColumns) {
  assert.ok(!new RegExp(`\\b${column}\\b`, 'i').test(rpcReturn), `Private column in RPC return: ${column}`);
  assert.ok(!new RegExp(`\\b${column}\\b`, 'i').test(rpcSelect), `Private column in RPC select: ${column}`);
}

assert.match(migration, /drop policy if exists "Public can read properties"/i);
assert.ok(!/create policy "Public can read properties"/i.test(migration));
assert.match(migration, /revoke select on table public\.properties from public, anon/i);
assert.match(migration, /grant execute on function public\.get_public_properties\(text, text\[\], text, text\) to anon, authenticated/i);
assert.match(stageA, /revoke execute on function public\.get_public_properties\(text, text\[\], text, text\) from public/i);
assert.ok(!/drop policy if exists "Public can read properties"/i.test(stageA), 'Stage A removes legacy access too early');
assert.ok(!/revoke select on table public\.properties/i.test(stageA), 'Stage A revokes legacy access too early');
assert.match(stageB, /drop policy if exists "Public can read properties"/i);
assert.match(stageB, /revoke select on table public\.properties from public, anon/i);
assert.match(stageB, /Stage A RPC is missing; refusing properties lockdown/i);

assert.match(migration, /create or replace function private\.is_property_accepting_applications/i);
const availabilityHelper = stageA.match(/create or replace function private\.is_property_accepting_applications[\s\S]*?\n\$\$;/i)?.[0];
assert.ok(availabilityHelper, 'Private application helper is missing');
assert.match(availabilityHelper, /security definer/i);
assert.match(availabilityHelper, /set search_path = ''/i);
assert.match(availabilityHelper, /from public\.properties as p/i);
assert.ok(!/\bexecute\b|\bformat\s*\(/i.test(availabilityHelper), 'Private helper contains dynamic SQL');
assert.ok(!/select\s+p\.\*/i.test(availabilityHelper), 'Private helper exposes a property row');
assert.match(stageA, /revoke all on schema private from public, anon, authenticated/i);
assert.match(stageA, /grant usage on schema private to authenticated/i);
assert.ok(!/grant\s+create\s+on\s+schema\s+private/i.test(stageA), 'A client-facing role receives CREATE on private');
assert.match(migration, /grant execute on function private\.is_property_accepting_applications\(text\) to authenticated/i);
assert.match(stageA, /revoke execute on function private\.is_property_accepting_applications\(text\) from public/i);
assert.match(stageA, /revoke execute on function private\.is_property_accepting_applications\(text\) from anon/i);
assert.ok(!/grant execute on function private\.is_property_accepting_applications\(text\) to[^;]*anon/i.test(migration));
assert.match(migration, /create policy "Users create applications"[\s\S]*?to authenticated[\s\S]*?user_id = public\.current_firebase_uid\(\)/i);
assert.match(migration, /revoke insert on table public\.applications from anon/i);

assert.ok(!/from\('public_properties'\)/.test(store), 'Frontend still queries the rejected view');
assert.ok(!/const PUBLIC_PROPERTY_COLUMNS/.test(store), 'Obsolete view column list remains');
assert.match(store, /rpc\('get_public_properties'/);
assert.match(store, /const publicPropertyFromRow[\s\S]*?ownerName:[\s\S]*?tenantContact:[\s\S]*?\.\.\.publicProperty/);
assert.match(store, /export const getAdminProperties[\s\S]*?from\('properties'\)/);

for (const table of ['property_media', 'property_amenities', 'property_allowed_tenants']) {
  const definition = schema.match(new RegExp(`create table if not exists public\\.${table} \\(([\\s\\S]*?)\\n\\);`, 'i'))?.[1];
  assert.ok(definition, `${table} schema is missing`);
  for (const column of privateColumns) {
    assert.ok(!new RegExp(`\\b${column}\\b`, 'i').test(definition), `Private column in ${table}: ${column}`);
  }
  assert.match(schema, new RegExp(`Public can read .*on public\\.${table} for select to anon, authenticated`, 'i'));
}

console.log('Public property RPC security boundary checks passed.');
