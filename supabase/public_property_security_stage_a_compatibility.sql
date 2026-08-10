begin;

-- Stage A is intentionally backward-compatible. It adds the narrow RPC used
-- by the new frontend but leaves the legacy public properties SELECT policy
-- and existing base-table SELECT privileges in place until Stage B.
create or replace function public.get_public_properties(
  p_property_id text default null,
  p_property_ids text[] default null,
  p_listing_type text default null,
  p_status text default null
)
returns table (
  id text,
  property_code text,
  title text,
  description text,
  listing_type text,
  status text,
  price numeric,
  location text,
  society text,
  property_type text,
  bhk_type text,
  floor text,
  bedrooms integer,
  bathrooms numeric,
  sqft integer,
  google_maps_url text,
  furnishing_status text,
  available_from text,
  tenant_preference text,
  maintenance_amount numeric,
  maintenance_type text,
  is_registered boolean,
  price_negotiable boolean,
  super_area integer,
  carpet_area integer,
  facing text,
  construction_status text,
  construction_quality text,
  location_advantage text,
  parking text,
  balcony integer,
  availability_status text,
  views integer,
  shares integer,
  favorites integer,
  whatsapp_contacts integer,
  enquiry_count integer,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    p.id,
    p.property_code,
    p.title,
    p.description,
    p.listing_type,
    p.status,
    p.price,
    p.location,
    p.society,
    p.property_type,
    p.bhk_type,
    p.floor,
    p.bedrooms,
    p.bathrooms,
    p.sqft,
    p.google_maps_url,
    p.furnishing_status,
    p.available_from,
    p.tenant_preference,
    p.maintenance_amount,
    p.maintenance_type,
    p.is_registered,
    p.price_negotiable,
    p.super_area,
    p.carpet_area,
    p.facing,
    p.construction_status,
    p.construction_quality,
    p.location_advantage,
    p.parking,
    p.balcony,
    p.availability_status,
    p.views,
    p.shares,
    p.favorites,
    p.whatsapp_contacts,
    p.enquiry_count,
    p.created_at,
    p.updated_at
  from public.properties as p
  where (p_property_id is null or p.id = p_property_id)
    and (p_property_ids is null or p.id = any(p_property_ids))
    and (p_property_ids is null or cardinality(p_property_ids) <= 100)
    and (p_listing_type is null or p.listing_type = p_listing_type)
    and (p_status is null or p.status = p_status)
  order by p.created_at desc
$$;

revoke execute on function public.get_public_properties(text, text[], text, text) from public;
revoke execute on function public.get_public_properties(text, text[], text, text) from anon;
revoke execute on function public.get_public_properties(text, text[], text, text) from authenticated;
grant execute on function public.get_public_properties(text, text[], text, text) to anon, authenticated;

-- Policy-only helpers live outside the Data API's exposed public schema.
-- Reset all three client-facing roles first so the final privileges are
-- deterministic even if this schema already existed.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create or replace function private.is_property_accepting_applications(p_property_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.properties as p
    where p.id = p_property_id
      and not (p.listing_type = 'rent' and p.availability_status = 'rented_out')
  )
$$;

revoke execute on function private.is_property_accepting_applications(text) from public;
revoke execute on function private.is_property_accepting_applications(text) from anon;
revoke execute on function private.is_property_accepting_applications(text) from authenticated;
grant execute on function private.is_property_accepting_applications(text) to authenticated;

drop policy if exists "Users create applications" on public.applications;
revoke insert on table public.applications from anon;
create policy "Users create applications"
on public.applications
for insert
to authenticated
with check (
  user_id = public.current_firebase_uid()
  and private.is_property_accepting_applications(property_id)
);

commit;
