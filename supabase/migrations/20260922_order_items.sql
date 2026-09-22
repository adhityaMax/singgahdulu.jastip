BEGIN;

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS items JSONB;

-- Pesanan lama punya satu barang di kolom terpisah. Isi hanya yang belum
-- mempunyai daftar barang agar migrasi aman dijalankan ulang.
UPDATE public.orders
SET items = jsonb_build_array(jsonb_build_object(
  'item', item,
  'variant', '',
  'store', store,
  'price', price,
  'fee', fee,
  'qty', qty
))
WHERE items IS NULL OR items = '[]'::jsonb;

NOTIFY pgrst, 'reload schema';
COMMIT;
