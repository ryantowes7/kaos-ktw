-- ==============================================
-- Form Kaos Khatulistiwa - Supabase Migration
-- Jalankan di Supabase SQL Editor
-- ==============================================

-- Aktifkan ekstensi UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- Table: orders
-- ==============================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama TEXT NOT NULL,
    no_hp TEXT NOT NULL,
    alamat TEXT NOT NULL,
    
    -- Size data stored as JSONB
    size_anak_pendek JSONB DEFAULT '{}',
    size_anak_panjang JSONB DEFAULT '{}',
    size_dewasa_pendek JSONB DEFAULT '{}',
    size_dewasa_panjang JSONB DEFAULT '{}',
    
    total_harga INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- Indexes untuk performa
-- ==============================================
CREATE INDEX IF NOT EXISTS idx_orders_nama ON public.orders(nama);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- ==============================================
-- Row Level Security (optional - dinonaktifkan untuk kemudahan)
-- ==============================================
-- Nonaktifkan RLS agar bisa diakses langsung dari client
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- ==============================================
-- Comments
-- ==============================================
COMMENT ON TABLE public.orders IS 'Tabel pesanan kaos Khatulistiwa Batch 1';
COMMENT ON COLUMN public.orders.nama IS 'Nama pemesan';
COMMENT ON COLUMN public.orders.no_hp IS 'Nomor HP/WhatsApp pemesan';
COMMENT ON COLUMN public.orders.alamat IS 'Alamat lengkap pemesan';
COMMENT ON COLUMN public.orders.size_anak_pendek IS 'Data ukuran anak lengan pendek dalam format JSON';
COMMENT ON COLUMN public.orders.size_anak_panjang IS 'Data ukuran anak lengan panjang dalam format JSON';
COMMENT ON COLUMN public.orders.size_dewasa_pendek IS 'Data ukuran dewasa lengan pendek dalam format JSON';
COMMENT ON COLUMN public.orders.size_dewasa_panjang IS 'Data ukuran dewasa lengan panjang dalam format JSON';
COMMENT ON COLUMN public.orders.total_harga IS 'Total harga pesanan dalam Rupiah';