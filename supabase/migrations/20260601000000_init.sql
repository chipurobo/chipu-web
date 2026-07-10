-- ============================================================================
-- ChipuRobo dashboard — initial schema
--
-- Models eight things:
--   schools           A school onboarded as a ChipuRobo code club.
--   code_clubs        1:1 with schools. Holds the roster screenshot + count.
--   profiles          1:1 with auth.users. Links a person to a school + role.
--   club_members      The digitised roster (not auth users; they don't log in).
--   products          The fabricable catalogue. Admin-only writes.
--   orders            Requests by mainstream schools, fulfilled by maker spaces.
--   product_units     One row per physical durable unit (serial-tracked).
--   stock_ledger      Append-only delta log for consumables (count-tracked).
--
-- Trust model:
--   - ChipuRobo onboards a school as a code club OFFLINE first.
--   - That offline handshake is the only approval gate. After it, ChipuRobo
--     gives the lead teacher the /dashboard/register-club URL.
--   - When they sign up via that URL, they immediately get school-scoped
--     read/write access. No email confirmation, no admin approval queue.
--
-- Permissions (enforced by Postgres RLS):
--   admin        — full access to everything.
--   school_lead  — full access to data scoped to their school. Whether they
--                  see "order products" or "fulfil orders" in the UI is
--                  derived from school.is_maker_space.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Extensions
-- ----------------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
create type public.school_type as enum ('special', 'integrated', 'mainstream');
create type public.user_role   as enum ('admin', 'school_lead');
create type public.order_status as enum (
  'placed', 'accepted', 'in_production', 'shipped', 'delivered', 'cancelled'
);
create type public.unit_status as enum (
  'with_maker', 'in_transit', 'with_school', 'with_user', 'returned', 'retired'
);

-- ============================================================================
-- 1. schools
-- ============================================================================
create table public.schools (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  type            public.school_type not null,
  is_maker_space  boolean not null default false,
  county          text,
  contact_name    text,
  contact_phone   text,
  contact_email   text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
comment on table public.schools is 'Schools onboarded as ChipuRobo code clubs.';

-- ============================================================================
-- 2. code_clubs (1:1 with schools — enforced by UNIQUE)
-- ============================================================================
create table public.code_clubs (
  id                 uuid primary key default gen_random_uuid(),
  school_id          uuid not null unique references public.schools(id) on delete cascade,
  registered_by      uuid not null references auth.users(id) on delete restrict,
  roster_image_path  text,                   -- key within roster-screenshots bucket
  member_count       integer not null check (member_count >= 0),
  registered_at      timestamptz not null default now()
);
comment on column public.code_clubs.roster_image_path is
  'Path in Storage bucket roster-screenshots, e.g. "<school_id>/roster.png".';

-- ============================================================================
-- 3. profiles (1:1 with auth.users)
-- ============================================================================
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  phone       text,
  role        public.user_role not null default 'school_lead',
  school_id   uuid references public.schools(id) on delete set null,  -- null for admins
  created_at  timestamptz not null default now()
);
create index profiles_school_id_idx on public.profiles (school_id);

-- A profile row is created automatically whenever a new auth user signs up.
-- The signup RPC fills in school_id, full_name, phone, and role afterwards.
create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', null));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- ============================================================================
-- 4. club_members  (digitised roster — these people don't log in)
-- ============================================================================
create table public.club_members (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools(id) on delete cascade,
  full_name   text not null,
  grade       text,
  is_active   boolean not null default true,
  joined_at   date not null default current_date,
  created_at  timestamptz not null default now()
);
create index club_members_school_id_idx on public.club_members (school_id);

-- ============================================================================
-- 5. products  (admin-curated catalogue)
-- ============================================================================
create table public.products (
  id                     uuid primary key default gen_random_uuid(),
  name                   text not null,
  description            text,
  category               text,
  is_durable             boolean not null,    -- true → product_units; false → stock_ledger
  sku                    text unique,
  designed_by_school_id  uuid references public.schools(id) on delete set null,
  is_active              boolean not null default true,
  created_at             timestamptz not null default now()
);
create index products_is_active_idx on public.products (is_active);
comment on column public.products.is_durable is
  'true → tracked per unit in product_units; false → tracked by count in stock_ledger.';

-- ============================================================================
-- 6. orders
-- ============================================================================
create table public.orders (
  id                     uuid primary key default gen_random_uuid(),
  placed_by_school_id    uuid not null references public.schools(id) on delete restrict,
  fulfilled_by_school_id uuid references public.schools(id) on delete set null,
  product_id             uuid not null references public.products(id) on delete restrict,
  quantity               integer not null check (quantity > 0),
  status                 public.order_status not null default 'placed',
  notes                  text,
  expected_delivery      date,
  placed_at              timestamptz not null default now(),
  accepted_at            timestamptz,
  shipped_at             timestamptz,
  delivered_at           timestamptz
);
create index orders_placed_by_idx    on public.orders (placed_by_school_id);
create index orders_fulfilled_by_idx on public.orders (fulfilled_by_school_id);
create index orders_status_idx       on public.orders (status);

-- ============================================================================
-- 7. product_units  (DURABLES only — serial-tracked)
-- ============================================================================
create table public.product_units (
  id                        uuid primary key default gen_random_uuid(),
  serial_number             text unique not null,
  product_id                uuid not null references public.products(id) on delete restrict,
  order_id                  uuid references public.orders(id) on delete set null,
  fabricated_by_school_id   uuid not null references public.schools(id) on delete restrict,
  current_school_id         uuid references public.schools(id) on delete set null,
  current_member_id         uuid references public.club_members(id) on delete set null,
  status                    public.unit_status not null default 'with_maker',
  fabricated_at             timestamptz not null default now(),
  assigned_at               timestamptz,
  notes                     text
);
create index units_current_school_idx on public.product_units (current_school_id);
create index units_fabricator_idx     on public.product_units (fabricated_by_school_id);
create index units_status_idx         on public.product_units (status);

-- ============================================================================
-- 8. stock_ledger  (CONSUMABLES only — append-only delta log)
-- ============================================================================
create table public.stock_ledger (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete restrict,
  delta       integer not null check (delta <> 0),  -- + = received, - = consumed
  order_id    uuid references public.orders(id) on delete set null,
  recorded_by uuid not null references auth.users(id) on delete restrict,
  recorded_at timestamptz not null default now(),
  note        text
);
create index stock_ledger_school_product_idx on public.stock_ledger (school_id, product_id);

-- A convenience view: current stock on hand per (school, product).
create view public.stock_on_hand as
  select school_id, product_id, coalesce(sum(delta), 0)::integer as on_hand
  from public.stock_ledger
  group by school_id, product_id;

-- ============================================================================
-- RLS — helpers
-- ============================================================================
-- The helper functions are named so they can NEVER collide with column names
-- in any policy (e.g. `current_school_id`). We prefix with `me_` to be safe.
create or replace function public.me_school_id()
returns uuid language sql stable security definer
set search_path = public
as $$
  select school_id from public.profiles where id = auth.uid();
$$;

create or replace function public.me_is_admin()
returns boolean language sql stable security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

-- ============================================================================
-- RLS — enable on every table
-- ============================================================================
alter table public.schools        enable row level security;
alter table public.code_clubs     enable row level security;
alter table public.profiles       enable row level security;
alter table public.club_members   enable row level security;
alter table public.products       enable row level security;
alter table public.orders         enable row level security;
alter table public.product_units  enable row level security;
alter table public.stock_ledger   enable row level security;

-- ============================================================================
-- RLS — schools
-- Read: admin or your own school. Write: admin only. The signup RPC bypasses
-- this via SECURITY DEFINER so a new school_lead can still create their row.
-- ============================================================================
create policy schools_select on public.schools
  for select to authenticated using (
    public.me_is_admin() or id = public.me_school_id()
  );
create policy schools_admin_all on public.schools
  for all to authenticated
  using (public.me_is_admin())
  with check (public.me_is_admin());

-- ============================================================================
-- RLS — code_clubs
-- Read/write your own code club; admin sees all.
-- ============================================================================
create policy code_clubs_select on public.code_clubs
  for select to authenticated using (
    public.me_is_admin() or school_id = public.me_school_id()
  );
create policy code_clubs_school_update on public.code_clubs
  for update to authenticated
  using (public.me_is_admin() or school_id = public.me_school_id())
  with check (public.me_is_admin() or school_id = public.me_school_id());
create policy code_clubs_admin_all on public.code_clubs
  for all to authenticated
  using (public.me_is_admin())
  with check (public.me_is_admin());

-- ============================================================================
-- RLS — profiles
-- Read: own profile, school-mates, or admin. Update: own or admin.
-- ============================================================================
create policy profiles_select on public.profiles
  for select to authenticated using (
    public.me_is_admin()
    or id = auth.uid()
    or school_id = public.me_school_id()
  );
create policy profiles_self_update on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());
create policy profiles_admin_all on public.profiles
  for all to authenticated
  using (public.me_is_admin())
  with check (public.me_is_admin());

-- ============================================================================
-- RLS — club_members
-- ============================================================================
create policy club_members_all on public.club_members
  for all to authenticated
  using (public.me_is_admin() or school_id = public.me_school_id())
  with check (public.me_is_admin() or school_id = public.me_school_id());

-- ============================================================================
-- RLS — products (admin writes; everyone reads)
-- ============================================================================
create policy products_read_all on public.products
  for select to authenticated using (true);
create policy products_admin_all on public.products
  for all to authenticated
  using (public.me_is_admin())
  with check (public.me_is_admin());

-- ============================================================================
-- RLS — orders
-- A school can read/write orders where it's the placer OR the fulfiller.
-- INSERT is restricted to placed_by_school_id = your school (or admin).
-- ============================================================================
create policy orders_select on public.orders
  for select to authenticated using (
    public.me_is_admin()
    or placed_by_school_id = public.me_school_id()
    or fulfilled_by_school_id = public.me_school_id()
  );
create policy orders_insert on public.orders
  for insert to authenticated with check (
    public.me_is_admin()
    or placed_by_school_id = public.me_school_id()
  );
create policy orders_update on public.orders
  for update to authenticated
  using (
    public.me_is_admin()
    or placed_by_school_id = public.me_school_id()
    or fulfilled_by_school_id = public.me_school_id()
  )
  with check (
    public.me_is_admin()
    or placed_by_school_id = public.me_school_id()
    or fulfilled_by_school_id = public.me_school_id()
  );
create policy orders_admin_delete on public.orders
  for delete to authenticated using (public.me_is_admin());

-- ============================================================================
-- RLS — product_units
-- ============================================================================
create policy units_select on public.product_units
  for select to authenticated using (
    public.me_is_admin()
    or current_school_id = public.me_school_id()
    or fabricated_by_school_id = public.me_school_id()
  );
create policy units_insert on public.product_units
  for insert to authenticated with check (
    public.me_is_admin()
    or fabricated_by_school_id = public.me_school_id()
  );
create policy units_update on public.product_units
  for update to authenticated
  using (
    public.me_is_admin()
    or current_school_id = public.me_school_id()
    or fabricated_by_school_id = public.me_school_id()
  )
  with check (
    public.me_is_admin()
    or current_school_id = public.me_school_id()
    or fabricated_by_school_id = public.me_school_id()
  );
create policy units_admin_delete on public.product_units
  for delete to authenticated using (public.me_is_admin());

-- ============================================================================
-- RLS — stock_ledger
-- ============================================================================
create policy stock_ledger_all on public.stock_ledger
  for all to authenticated
  using (public.me_is_admin() or school_id = public.me_school_id())
  with check (public.me_is_admin() or school_id = public.me_school_id());

-- ============================================================================
-- Signup RPC
-- The /dashboard/register-club form calls this AFTER `supabase.auth.signUp()`.
-- It atomically creates the school, links the code club, and promotes the
-- profile. SECURITY DEFINER bypasses RLS so a brand-new user can create their
-- own school + club in one go.
-- ============================================================================
create or replace function public.register_school_with_club(
  p_school_name     text,
  p_county          text,
  p_school_type     public.school_type,
  p_is_maker_space  boolean,
  p_member_count    integer,
  p_full_name       text,
  p_phone           text,
  p_contact_email   text default null
) returns uuid
language plpgsql security definer
set search_path = public
as $$
declare
  v_user_id   uuid := auth.uid();
  v_school_id uuid;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;

  -- One school per user. If they already have one, refuse.
  if exists (select 1 from public.profiles where id = v_user_id and school_id is not null) then
    raise exception 'user is already linked to a school' using errcode = '23505';
  end if;

  insert into public.schools (name, county, type, is_maker_space, contact_name, contact_phone, contact_email)
  values (p_school_name, p_county, p_school_type, p_is_maker_space, p_full_name, p_phone, p_contact_email)
  returning id into v_school_id;

  insert into public.code_clubs (school_id, registered_by, member_count)
  values (v_school_id, v_user_id, p_member_count);

  update public.profiles
    set school_id = v_school_id,
        full_name = p_full_name,
        phone     = p_phone,
        role      = 'school_lead'
  where id = v_user_id;

  return v_school_id;
end;
$$;

grant execute on function public.register_school_with_club to authenticated;

-- After the school is created the client uploads the roster image to
-- "<school_id>/roster.<ext>" and stores that path:
create or replace function public.set_roster_image_path(p_path text)
returns void
language plpgsql security definer
set search_path = public
as $$
declare
  v_school_id uuid := public.me_school_id();
begin
  if v_school_id is null then
    raise exception 'no school linked to this user';
  end if;
  update public.code_clubs
     set roster_image_path = p_path
   where school_id = v_school_id;
end;
$$;
grant execute on function public.set_roster_image_path(text) to authenticated;

-- ============================================================================
-- Storage bucket for roster screenshots
-- ============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'roster-screenshots',
  'roster-screenshots',
  false,
  10485760,           -- 10 MB
  array['image/png', 'image/jpeg', 'image/webp']
) on conflict (id) do nothing;

-- Storage RLS: any authenticated user can upload to <their_school_id>/* in
-- this bucket; admins can read anything; school_leads can read their own.
create policy roster_upload on storage.objects
  for insert to authenticated with check (
    bucket_id = 'roster-screenshots' and (
      public.me_is_admin()
      or split_part(name, '/', 1)::uuid = public.me_school_id()
    )
  );

create policy roster_read on storage.objects
  for select to authenticated using (
    bucket_id = 'roster-screenshots' and (
      public.me_is_admin()
      or split_part(name, '/', 1)::uuid = public.me_school_id()
    )
  );

create policy roster_update on storage.objects
  for update to authenticated using (
    bucket_id = 'roster-screenshots' and (
      public.me_is_admin()
      or split_part(name, '/', 1)::uuid = public.me_school_id()
    )
  );

-- ============================================================================
-- updated_at trigger (just for schools — others are append-only or stable)
-- ============================================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger schools_touch_updated_at
  before update on public.schools
  for each row execute function public.touch_updated_at();
