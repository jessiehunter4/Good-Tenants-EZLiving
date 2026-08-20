-- ===========================================================================
-- A home for the listing photographs
-- ===========================================================================
-- The 1,592 photographs seeded with the listings are still served from the
-- rentals project's storage. They work today, and they stop working the moment
-- that project is paused — which is the point of retiring the old apps. A
-- merge that leaves its images on the machine it is replacing has not finished.
--
-- Public, unlike the tenant and partner buckets. These are marketing
-- photographs of homes that are being advertised; the compliance question for
-- them is *which* listing's photos may be shown, and that is answered by the
-- `rental_listing_photos` view, which excludes any listing that forbids
-- internet display or media display. The file itself is not a secret.
-- ===========================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listing-photos',
  'listing-photos',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read listing photos" ON storage.objects;
CREATE POLICY "Public read listing photos" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'listing-photos');

-- Only staff and the sync may put files here.
DROP POLICY IF EXISTS "Admins write listing photos" ON storage.objects;
CREATE POLICY "Admins write listing photos" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'listing-photos' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'listing-photos' AND public.has_role(auth.uid(), 'admin'));
