-- ============================================================================
-- The anatomical heart, as two products — 2026-09-06
--
-- Two rows, not one with variants. They are different objects: they print
-- separately, stock separately and a school may want one without the other.
-- The 2D panel is a map of the heart; the 3D model is its shape. Neither
-- replaces the other, which is exactly why both are in the catalogue.
--
-- is_durable is false for both, meaning counted in stock_ledger rather than
-- serialised in product_units. These are printed in quantity as teaching aids;
-- nobody is going to give an individual heart a serial number. Flip it later
-- if that turns out to be wrong -- the column is the only thing that decides.
--
-- category is deliberately left null. Categorising the catalogue is a separate
-- decision and guessing at one now would only have to be undone.
--
-- Both designs belong to other people. source_credit carries the designer;
-- the LICENCE for each is not recorded because neither MakerWorld page states
-- one in its readable text, and one of the two designers sells commercial
-- rights separately. Somebody has to check both pages before a photograph of
-- these is published or a print is sold. An empty field is honest; a guessed
-- licence would be worse than nothing.
-- ============================================================================

insert into public.products (name, description, is_durable, is_active, source_url, source_credit)
select
  'Anatomical Heart - 2D panel',
  'Flat printed panel with the outline of a heart raised above the surface, '
  'followed by fingertip. Print 2.5 mm thick. Shows where each chamber sits '
  'and the path the blood takes - it is a map. It cannot show depth or the '
  'real shape of the heart. Use it before the 3D model.',
  false, true,
  'https://makerworld.com/en/models/1723759-anatomy-heart-coloring-craft-education',
  'Merilno3D - licence not yet confirmed'
where not exists (
  select 1 from public.products where name = 'Anatomical Heart - 2D panel'
);

insert into public.products (name, description, is_durable, is_active, source_url, source_credit)
select
  'Anatomical Heart - 3D model',
  'Single solid printed heart with a round base; a version without the base '
  'also exists. Gives the true outward shape, the size, the great vessels and '
  'the curve of the aortic arch. It does NOT come apart and has no internal '
  'chambers - say so to learners at the start rather than letting them expect '
  'otherwise.',
  false, true,
  'https://makerworld.com/en/models/2855096-human-heart-model',
  '3D On Fire - licence not yet confirmed'
where not exists (
  select 1 from public.products where name = 'Anatomical Heart - 3D model'
);

notify pgrst, 'reload schema';
