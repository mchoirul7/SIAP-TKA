-- =============================================================================
-- Siap TKA - hapus sisa sistem voucher
--
-- Akses kini sepenuhnya lewat akun murid (PIN) dan paket yang dibukakan admin
-- (student_grants). Tabel dan fungsi voucher lama tidak dipakai aplikasi lagi.
-- Tidak bisa dibatalkan: isi tabel voucher ikut terhapus.
-- =============================================================================

begin;

drop function if exists public.redeem_voucher(text);

drop table if exists public.voucher_products;
drop table if exists public.voucher_packages;
drop table if exists public.products;
drop table if exists public.vouchers;

commit;
