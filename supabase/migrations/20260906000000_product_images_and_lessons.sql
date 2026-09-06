-- ============================================================================
-- Pictures for the things we fabricate, and a link from a lesson to the kit
-- it needs — 2026-09-06
--
-- Two gaps, both of which made the catalogue harder to use than it should be.
--
-- Nothing in the system had a picture. A teacher ordering "Braille Input
-- Keypad" from a dropdown is guessing; a maker-space school printing one has
-- nothing to check its work against. For objects we design and print
-- ourselves, a photograph is not decoration.
--
-- And nothing connected a lesson to the kit it needs. The curriculum knows a
-- lesson exists and the catalogue knows a product exists, but no one could ask
-- "what do we have to print before Tuesday".
--
-- ON THE BUCKET BEING PUBLIC. Product photographs are pictures of objects, and
-- keeping them public means they work in an email, in a report and on the
-- marketing site without signed URLs. That is only safe under one rule:
--
--     PHOTOGRAPH THE OBJECT, NEVER THE CHILDREN USING IT.
--
-- A learner in frame in a public bucket is a data-protection incident, not a
-- nice picture of a workshop. Session photographs, if we ever want them, are a
-- different feature with a different bucket and different rules.
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,               -- readable without a token; see the rule above
  5242880,            -- 5 MB is plenty for a catalogue photograph
  array['image/png', 'image/jpeg', 'image/webp']
) on conflict (id) do nothing;

-- Writes are admin-only. Anyone signed in can already read every product row,
-- and the bucket is public for reads, so only the write side needs a policy.
drop policy if exists product_images_admin_insert on storage.objects;
create policy product_images_admin_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and public.me_is_admin());

drop policy if exists product_images_admin_update on storage.objects;
create policy product_images_admin_update on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and public.me_is_admin());

drop policy if exists product_images_admin_delete on storage.objects;
create policy product_images_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and public.me_is_admin());

-- ----------------------------------------------------------------------------
-- One primary photograph per product
--
-- A column rather than a table of images, deliberately. One good photograph is
-- what the ordering and stock screens need, and a nullable column upgrades to
-- a product_images table later without anything having to be rewritten now.
-- ----------------------------------------------------------------------------
alter table public.products
  add column if not exists image_path text;

comment on column public.products.image_path is
  'Object key within the public product-images bucket, e.g. '
  '"<product_id>/heart-3d.webp". Null means no photograph yet. The object, '
  'never the learners using it.';

-- ----------------------------------------------------------------------------
-- Where a printable design came from
--
-- Most of what we print is somebody else''s design under a licence that
-- requires credit — the braille cell is CC BY, and one of the heart designers
-- sells commercial rights separately. Without somewhere to record it, the
-- attribution lives in whoever happened to download the file.
-- ----------------------------------------------------------------------------
alter table public.products
  add column if not exists source_url text
    check (source_url is null or source_url ~* '^https?://[^[:space:]]+$');

alter table public.products
  add column if not exists source_credit text;

comment on column public.products.source_url is
  'Where the printable design came from, if it is not ours.';
comment on column public.products.source_credit is
  'Designer and licence, e.g. "3D Printy - CC BY". Required by most of the '
  'licences we print under; goes on photographs and in reports, not just here.';

-- ----------------------------------------------------------------------------
-- Which products a lesson needs
--
-- Many-to-many: one kit serves several lessons, and a lesson can need several
-- printed parts.
-- ----------------------------------------------------------------------------
create table if not exists public.lesson_products (
  lesson_id  uuid not null references public.lessons(id)  on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  note       text,
  created_at timestamptz not null default now(),
  primary key (lesson_id, product_id)
);

create index if not exists lesson_products_product_idx
  on public.lesson_products (product_id);

comment on table public.lesson_products is
  'What a lesson needs printed or supplied. Answers "what do we fabricate '
  'before this lesson runs".';

alter table public.lesson_products enable row level security;

-- Same shape as products: everyone signed in can read the catalogue, only
-- admins curate it. Default privileges hand anon SELECT on new tables in this
-- schema, so take everything away first and give back what is wanted.
revoke all on public.lesson_products from anon, authenticated;
grant select on public.lesson_products to authenticated;
grant insert, update, delete on public.lesson_products to authenticated;

drop policy if exists lesson_products_read on public.lesson_products;
create policy lesson_products_read on public.lesson_products
  for select to authenticated using (true);

drop policy if exists lesson_products_admin on public.lesson_products;
create policy lesson_products_admin on public.lesson_products
  for all to authenticated
  using (public.me_is_admin())
  with check (public.me_is_admin());

notify pgrst, 'reload schema';
