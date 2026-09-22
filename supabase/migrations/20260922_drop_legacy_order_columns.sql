BEGIN;

-- Jangan hapus data jika masih ada pesanan yang belum berhasil dipindahkan.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.orders
    WHERE CASE WHEN jsonb_typeof(items) = 'array'
      THEN jsonb_array_length(items) = 0
      ELSE true END
  ) THEN
    RAISE EXCEPTION 'Masih ada pesanan tanpa items yang valid. Jalankan migrasi backfill lebih dulu.';
  END IF;
END $$;

ALTER TABLE public.orders ALTER COLUMN items SET NOT NULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.orders'::regclass AND conname = 'orders_items_nonempty'
  ) THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_items_nonempty
      CHECK (jsonb_typeof(items) = 'array' AND jsonb_array_length(items) > 0);
  END IF;
END $$;

ALTER TABLE public.orders
  DROP COLUMN IF EXISTS item,
  DROP COLUMN IF EXISTS store,
  DROP COLUMN IF EXISTS price,
  DROP COLUMN IF EXISTS fee,
  DROP COLUMN IF EXISTS qty;

NOTIFY pgrst, 'reload schema';
COMMIT;
