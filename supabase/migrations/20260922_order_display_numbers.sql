BEGIN;

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_no TEXT;

-- Satu counter per bulan/tahun. UPSERT mengunci baris counter sehingga dua
-- pesanan yang dibuat bersamaan tidak mendapat nomor yang sama.
CREATE TABLE IF NOT EXISTS public.order_number_counters (
  period CHAR(4) PRIMARY KEY,
  last_number INTEGER NOT NULL CHECK (last_number BETWEEN 0 AND 9999)
);
ALTER TABLE public.order_number_counters ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.order_number_counters FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.next_order_number(p_date DATE)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_period TEXT := to_char(COALESCE(p_date, CURRENT_DATE), 'MMYY');
  v_number INTEGER;
BEGIN
  INSERT INTO public.order_number_counters (period, last_number)
  VALUES (v_period, 1)
  ON CONFLICT (period) DO UPDATE
    SET last_number = public.order_number_counters.last_number + 1
  RETURNING last_number INTO v_number;

  IF v_number > 9999 THEN
    RAISE EXCEPTION 'Nomor pesanan untuk bulan % sudah penuh.', v_period;
  END IF;
  RETURN 'ORD-' || lpad(v_number::TEXT, 4, '0') || v_period;
END;
$$;
REVOKE ALL ON FUNCTION public.next_order_number(DATE) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.assign_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  NEW.order_no := public.next_order_number(NEW.date);
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.assign_order_number() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS assign_order_number_on_insert ON public.orders;
CREATE TRIGGER assign_order_number_on_insert
BEFORE INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.assign_order_number();

-- Data lama diberi nomor sesuai tanggal pesanan lalu waktu dibuat.
DO $$
DECLARE
  v_order RECORD;
BEGIN
  FOR v_order IN
    SELECT id, date FROM public.orders WHERE order_no IS NULL
    ORDER BY date, created_at, id
  LOOP
    UPDATE public.orders
    SET order_no = public.next_order_number(v_order.date)
    WHERE id = v_order.id;
  END LOOP;
END;
$$;

ALTER TABLE public.orders ALTER COLUMN order_no SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS orders_order_no_unique ON public.orders(order_no);

NOTIFY pgrst, 'reload schema';
COMMIT;
