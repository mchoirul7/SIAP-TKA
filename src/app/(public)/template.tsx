/**
 * Templat dipasang ulang setiap kali pindah halaman, jadi isi halaman selalu
 * masuk dengan meluncur pelan, termasuk saat membuka detail dari sebuah kartu.
 */
export default function PublicTemplate({ children }: { children: React.ReactNode }) {
  return <div className="anim-page">{children}</div>;
}
