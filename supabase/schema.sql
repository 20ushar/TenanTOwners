begin;

create table if not exists public.user_profiles (
  firebase_uid text primary key,
  email text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.properties (
  id text primary key,
  property_code text unique,
  created_by text references public.user_profiles(firebase_uid) on update cascade on delete set null,
  title text not null check (char_length(title) between 3 and 200),
  description text not null default '',
  listing_type text not null default 'rent' check (listing_type in ('rent', 'buy')),
  status text not null default 'available' check (status in ('available', 'rented')),
  price numeric(14,2) not null check (price > 0),
  location text not null,
  society text,
  tower text,
  flat_number text,
  unit_number text,
  property_type text,
  bhk_type text,
  floor text,
  bedrooms integer not null default 0 check (bedrooms >= 0),
  bathrooms numeric(4,1) not null default 0 check (bathrooms >= 0),
  sqft integer not null default 0 check (sqft >= 0),
  google_maps_url text,
  contact_phone text,
  owner_name text,
  owner_contact text,
  tenant_name text,
  tenant_contact text,
  furnishing_status text,
  available_from text,
  tenant_preference text,
  maintenance_amount numeric(12,2) not null default 0,
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
  availability_status text not null default 'available' check (availability_status in ('available', 'rented_out')),
  status_updated_at timestamptz,
  status_updated_by text references public.user_profiles(firebase_uid) on update cascade on delete set null,
  rented_out_at timestamptz,
  views integer not null default 0 check (views >= 0),
  shares integer not null default 0 check (shares >= 0),
  favorites integer not null default 0 check (favorites >= 0),
  whatsapp_contacts integer not null default 0 check (whatsapp_contacts >= 0),
  enquiry_count integer not null default 0 check (enquiry_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.property_media (
  id bigint generated always as identity primary key,
  property_id text not null references public.properties(id) on update cascade on delete cascade,
  media_type text not null check (media_type in ('image', 'video')),
  url text not null,
  url_hash text generated always as (md5(url)) stored,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  unique (property_id, url_hash)
);

create unique index if not exists property_media_one_primary
  on public.property_media(property_id) where is_primary;

create table if not exists public.property_amenities (
  property_id text not null references public.properties(id) on update cascade on delete cascade,
  amenity text not null,
  primary key (property_id, amenity)
);

create table if not exists public.property_allowed_tenants (
  property_id text not null references public.properties(id) on update cascade on delete cascade,
  tenant_type text not null,
  primary key (property_id, tenant_type)
);

create table if not exists public.wishlists (
  user_id text not null references public.user_profiles(firebase_uid) on update cascade on delete cascade,
  property_id text not null references public.properties(id) on update cascade on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, property_id)
);

create table if not exists public.applications (
  id text primary key,
  property_id text not null references public.properties(id) on update cascade on delete cascade,
  user_id text not null references public.user_profiles(firebase_uid) on update cascade on delete cascade,
  tenant_name text not null,
  tenant_phone text not null,
  status text not null default 'pending' check (status in ('pending', 'reviewing', 'approved', 'rejected')),
  applied_at timestamptz not null default now(),
  unique (property_id, user_id)
);

create table if not exists public.inquiries (
  id text primary key,
  user_id text not null references public.user_profiles(firebase_uid) on update cascade on delete cascade,
  property_id text references public.properties(id) on update cascade on delete set null,
  name text not null,
  email text not null,
  phone text not null,
  requirements text not null default '',
  budget text not null default '',
  location text,
  bhk text,
  tenant_preference text,
  furnishing_status text,
  shifting_date text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'rejected')),
  submitted_at timestamptz not null default now()
);

create table if not exists public.leads (
  id text primary key,
  property_id text not null references public.properties(id) on update cascade on delete cascade,
  user_id text references public.user_profiles(firebase_uid) on update cascade on delete set null,
  user_name text,
  user_email text,
  user_phone text,
  source text not null default 'Platform',
  status text not null default 'New',
  message text,
  visit_date text,
  listing_type text,
  created_at timestamptz not null default now()
);

create table if not exists public.property_enquiries (
  property_id text not null references public.properties(id) on update cascade on delete cascade,
  user_id text not null references public.user_profiles(firebase_uid) on update cascade on delete cascade,
  lead_id text references public.leads(id) on update cascade on delete cascade,
  created_at timestamptz not null default now(),
  primary key (property_id, user_id)
);

create table if not exists public.enquiry_daily_limits (
  user_id text not null references public.user_profiles(firebase_uid) on update cascade on delete cascade,
  date_key date not null,
  enquiry_count integer not null default 0 check (enquiry_count >= 0),
  first_request_at timestamptz,
  last_request_at timestamptz,
  primary key (user_id, date_key)
);

create index if not exists properties_listing_status_idx on public.properties(listing_type, status);
create index if not exists properties_availability_idx on public.properties(listing_type, availability_status);
create index if not exists applications_user_idx on public.applications(user_id, applied_at desc);
create index if not exists inquiries_user_idx on public.inquiries(user_id, submitted_at desc);
create index if not exists leads_created_idx on public.leads(created_at desc);

create or replace function public.current_firebase_uid()
returns text language sql stable
as $$ select auth.jwt()->>'sub' $$;

create or replace function public.is_app_admin()
returns boolean language sql stable
as $$
  select coalesce(auth.jwt()->>'email' = any(array[
    't21shar@gmail.com',
    't21shar9891851774@gmail.com',
    'tenantownerofficial@gmail.com'
  ]), false)
$$;

alter table public.user_profiles enable row level security;
alter table public.properties enable row level security;
alter table public.property_media enable row level security;
alter table public.property_amenities enable row level security;
alter table public.property_allowed_tenants enable row level security;
alter table public.wishlists enable row level security;
alter table public.applications enable row level security;
alter table public.inquiries enable row level security;
alter table public.leads enable row level security;
alter table public.property_enquiries enable row level security;
alter table public.enquiry_daily_limits enable row level security;

create policy "Public can read properties" on public.properties for select to anon, authenticated using (true);
create policy "Admins manage properties" on public.properties for all to anon, authenticated using (public.is_app_admin()) with check (public.is_app_admin());
create policy "Public can read property media" on public.property_media for select to anon, authenticated using (true);
create policy "Admins manage property media" on public.property_media for all to anon, authenticated using (public.is_app_admin()) with check (public.is_app_admin());
create policy "Public can read property amenities" on public.property_amenities for select to anon, authenticated using (true);
create policy "Admins manage property amenities" on public.property_amenities for all to anon, authenticated using (public.is_app_admin()) with check (public.is_app_admin());
create policy "Public can read allowed tenants" on public.property_allowed_tenants for select to anon, authenticated using (true);
create policy "Admins manage allowed tenants" on public.property_allowed_tenants for all to anon, authenticated using (public.is_app_admin()) with check (public.is_app_admin());
create policy "Users read their profile" on public.user_profiles for select to anon, authenticated using (firebase_uid = public.current_firebase_uid() or public.is_app_admin());
create policy "Users create their profile" on public.user_profiles for insert to anon, authenticated with check (firebase_uid = public.current_firebase_uid());
create policy "Users update their profile" on public.user_profiles for update to anon, authenticated using (firebase_uid = public.current_firebase_uid()) with check (firebase_uid = public.current_firebase_uid());
create policy "Users manage their wishlist" on public.wishlists for all to anon, authenticated using (user_id = public.current_firebase_uid() or public.is_app_admin()) with check (user_id = public.current_firebase_uid());
create policy "Users read their applications" on public.applications for select to anon, authenticated using (user_id = public.current_firebase_uid() or public.is_app_admin());
create policy "Users create applications" on public.applications for insert to anon, authenticated with check (
  user_id = public.current_firebase_uid()
  and exists (
    select 1 from public.properties
    where id = property_id
      and not (listing_type = 'rent' and availability_status = 'rented_out')
  )
);
create policy "Admins update applications" on public.applications for update to anon, authenticated using (public.is_app_admin()) with check (public.is_app_admin());
create policy "Admins delete applications" on public.applications for delete to anon, authenticated using (public.is_app_admin());
create policy "Users and admins read inquiries" on public.inquiries for select to anon, authenticated using (user_id = public.current_firebase_uid() or public.is_app_admin());
create policy "Users create inquiries" on public.inquiries for insert to anon, authenticated with check (user_id = public.current_firebase_uid());
create policy "Admins update inquiries" on public.inquiries for update to anon, authenticated using (public.is_app_admin()) with check (public.is_app_admin());
create policy "Users and admins delete inquiries" on public.inquiries for delete to anon, authenticated using (user_id = public.current_firebase_uid() or public.is_app_admin());
create policy "Admins manage leads" on public.leads for all to anon, authenticated using (public.is_app_admin()) with check (public.is_app_admin());
create policy "Users read their enquiry records" on public.property_enquiries for select to anon, authenticated using (user_id = public.current_firebase_uid() or public.is_app_admin());
create policy "Users read their daily enquiry limit" on public.enquiry_daily_limits for select to anon, authenticated using (user_id = public.current_firebase_uid() or public.is_app_admin());

create or replace function public.submit_property_enquiry(
  p_user_id text,
  p_property_id text,
  p_user_name text default '',
  p_user_email text default '',
  p_user_phone text default '',
  p_message text default '',
  p_visit_date text default '',
  p_listing_type text default ''
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_property public.properties%rowtype;
  v_date date := (now() at time zone 'Asia/Kolkata')::date;
  v_count integer;
  v_lead_id text := 'lead_' || replace(gen_random_uuid()::text, '-', '');
begin
  select * into v_property from public.properties where id = p_property_id for update;
  if not found then return jsonb_build_object('status', 'PROPERTY_NOT_FOUND'); end if;
  if v_property.listing_type = 'rent' and v_property.availability_status = 'rented_out' then
    return jsonb_build_object('status', 'PROPERTY_RENTED_OUT');
  end if;

  if exists(select 1 from public.property_enquiries where property_id = p_property_id and user_id = p_user_id) then
    return jsonb_build_object('status', 'ALREADY_ENQUIRED');
  end if;

  insert into public.enquiry_daily_limits(user_id, date_key, enquiry_count, first_request_at, last_request_at)
  values (p_user_id, v_date, 0, now(), now())
  on conflict (user_id, date_key) do nothing;

  select enquiry_count into v_count from public.enquiry_daily_limits
  where user_id = p_user_id and date_key = v_date for update;
  if v_count >= 5 then return jsonb_build_object('status', 'DAILY_LIMIT_REACHED'); end if;

  insert into public.leads(id, property_id, user_id, user_name, user_email, user_phone, source, status, message, visit_date, listing_type)
  values (v_lead_id, p_property_id, p_user_id, p_user_name, p_user_email, p_user_phone, 'Platform', 'New', p_message, p_visit_date, p_listing_type);
  insert into public.property_enquiries(property_id, user_id, lead_id) values (p_property_id, p_user_id, v_lead_id);
  update public.enquiry_daily_limits set enquiry_count = enquiry_count + 1, last_request_at = now()
  where user_id = p_user_id and date_key = v_date;
  update public.properties set enquiry_count = enquiry_count + 1, updated_at = now() where id = p_property_id;
  return jsonb_build_object('status', 'OK', 'lead_id', v_lead_id);
end;
$$;

create or replace function public.record_whatsapp_lead(
  p_property_id text,
  p_user_id text default null,
  p_user_name text default 'Anonymous Visitor',
  p_user_email text default '',
  p_user_phone text default ''
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_lead_id text := 'lead_' || replace(gen_random_uuid()::text, '-', '');
begin
  if not exists(select 1 from public.properties where id = p_property_id) then
    return jsonb_build_object('status', 'PROPERTY_NOT_FOUND');
  end if;
  insert into public.leads(id, property_id, user_id, user_name, user_email, user_phone, source, status)
  values (v_lead_id, p_property_id, nullif(p_user_id, 'anonymous'), p_user_name, p_user_email, p_user_phone, 'WhatsApp', 'New');
  update public.properties set whatsapp_contacts = whatsapp_contacts + 1, updated_at = now() where id = p_property_id;
  return jsonb_build_object('status', 'OK', 'lead_id', v_lead_id);
end;
$$;

revoke all on function public.submit_property_enquiry(text,text,text,text,text,text,text,text) from public, anon, authenticated;
revoke all on function public.record_whatsapp_lead(text,text,text,text,text) from public, anon, authenticated;
grant execute on function public.submit_property_enquiry(text,text,text,text,text,text,text,text) to service_role;
grant execute on function public.record_whatsapp_lead(text,text,text,text,text) to service_role;

commit;
