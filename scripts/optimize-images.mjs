/**
 * Memampatkan gambar soal di tempat, tanpa mengubah nama berkas.
 *
 *   node scripts/optimize-images.mjs
 *
 * Nama berkas sengaja dipertahankan supaya rujukan di basis data dan di berkas
 * SQL tetap sah — tidak ada yang perlu diperbarui setelah skrip ini dijalankan.
 *
 * Gambar soal berupa diagram, denah, dan rumus: hasil pemampatan PNG dengan
 * palet terbatas hampir tidak terlihat bedanya, tetapi ukurannya turun jauh.
 * Berkas yang justru membesar dibiarkan apa adanya.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const DIR = path.join(process.cwd(), "public", "soal");

if (!fs.existsSync(DIR)) {
  console.error(`Direktori tidak ditemukan: ${DIR}`);
  process.exit(1);
}

const files = fs.readdirSync(DIR).filter((f) => /\.png$/i.test(f));
let before = 0;
let after = 0;
let shrunk = 0;
let kept = 0;

for (const file of files) {
  const target = path.join(DIR, file);
  const original = fs.readFileSync(target);
  before += original.length;

  let optimized;
  try {
    optimized = await sharp(original)
      .png({ compressionLevel: 9, palette: true, effort: 10 })
      .toBuffer();
  } catch (error) {
    console.log(`  ! ${file}: gagal diproses (${error.message}), dibiarkan`);
    after += original.length;
    kept += 1;
    continue;
  }

  // Hanya ditulis bila benar-benar lebih kecil.
  if (optimized.length < original.length) {
    fs.writeFileSync(target, optimized);
    after += optimized.length;
    shrunk += 1;
  } else {
    after += original.length;
    kept += 1;
  }
}

const mb = (n) => (n / 1048576).toFixed(2);
console.log(`berkas       : ${files.length} (${shrunk} dimampatkan, ${kept} dibiarkan)`);
console.log(`sebelum      : ${mb(before)} MB`);
console.log(`sesudah      : ${mb(after)} MB`);
console.log(`penghematan  : ${mb(before - after)} MB (${Math.round((1 - after / before) * 100)}%)`);
