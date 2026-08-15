import type { Question } from "./types";

/**
 * Bank soal TKA Matematika SD (30 soal) hasil impor dari berkas resmi.
 *
 * Isi soal memakai HTML terbatas (p, ul, ol, li, strong, br, sup, img) karena
 * sebagian soal memuat gambar diagram dan rumus. Gambar disalin ke /public/soal
 * sehingga prototype tidak bergantung pada server luar.
 *
 * Berkas ini dihasilkan oleh skrip konversi dan sebaiknya tidak disunting manual.
 * Pembahasan belum tersedia pada sumbernya, jadi kolom explanation dikosongkan.
 */
export const tkaQuestions: Question[] = [
  {
    "id": "tka-001",
    "type": "single",
    "subjectId": "sub-mat-sd",
    "topicId": "top-bilangan",
    "subtopicId": "st-operasi-pecahan",
    "conceptId": "c-operasi-jumlah-kurang",
    "competency": "Menghitung operasi campuran persen, desimal, dan pecahan",
    "difficulty": "menengah",
    "reasoningType": "penerapan",
    "contentFormat": "html",
    "questionText": "<p><img alt=\"\" data-latex=\"120\\% \\, -\\, 3\\, +\\, 2\\, \\times \\, 0,75\\, +\\, \\frac {2} {3}\\, =\\, ....\" src=\"/soal/56324_bbfe6e1d9e923a1e017cf201e7edad33.png\"/></p>",
    "options": [
      {
        "key": "A",
        "text": "<p><img alt=\"\" data-latex=\"\\frac {11} {30}\" src=\"/soal/56324_f6f33e81bb0d80568903cb66164f6cd6.png\"/></p>"
      },
      {
        "key": "B",
        "text": "<p><img alt=\"\" data-latex=\"\\frac {49} {60}\" src=\"/soal/56324_1432ea666520292d5f71f3aafce4c0c5.png\"/></p>"
      },
      {
        "key": "C",
        "text": "<p><img alt=\"\" data-latex=\"\\frac {31} {30}\" src=\"/soal/56324_d3dff50998547ff13c29bc2c178da393.png\"/></p>"
      },
      {
        "key": "D",
        "text": "<p><img alt=\"\" data-latex=\"\\frac {98} {60}\" src=\"/soal/56324_08a909237bd5e812ef53d3ee07615fcb.png\"/></p>"
      }
    ],
    "correctAnswer": "A"
  },
  {
    "id": "tka-002",
    "type": "single",
    "subjectId": "sub-mat-sd",
    "topicId": "top-bilangan",
    "subtopicId": "st-operasi-pecahan",
    "conceptId": "c-operasi-kali-bagi",
    "competency": "Menerapkan pecahan dan persen pada perhitungan harga",
    "difficulty": "menengah",
    "reasoningType": "penalaran",
    "contentFormat": "html",
    "stimulus": "<p>Menjelang tahun ajaran baru, Toko Buku Ceria memberikan diskon 10% untuk semua jenis buku. Diketahui harga buku gambar adalah <img alt=\"\" data-latex=\"\\frac {1} {2}\" src=\"/soal/65671_073c96b387453cf6c3a75752302c655b.png\"/> dari harga buku komik. Harga buku tulis adalah 0,75 kali harga buku komik. Diketahui harga buku komik adalah Rp24.000,00. </p>",
    "questionText": "<p>Harga buku gambar dan buku tulis setelah dikenakan diskon adalah ....</p>",
    "options": [
      {
        "key": "A",
        "text": "<p>Rp18.000,00</p>"
      },
      {
        "key": "B",
        "text": "<p>Rp24.000,00</p>"
      },
      {
        "key": "C",
        "text": "<p>Rp27.000,00</p>"
      },
      {
        "key": "D",
        "text": "<p>Rp30.000,00</p>"
      }
    ],
    "correctAnswer": "C"
  },
  {
    "id": "tka-003",
    "type": "category",
    "subjectId": "sub-mat-sd",
    "topicId": "top-bilangan",
    "subtopicId": "st-operasi-pecahan",
    "conceptId": "c-operasi-kali-bagi",
    "competency": "Menerapkan operasi pecahan campuran pada soal cerita bertahap",
    "difficulty": "menengah",
    "reasoningType": "penalaran",
    "contentFormat": "html",
    "stimulus": "<p>Pak Bondan seorang penjual susu kedelai. Suatu hari, Pak Bondan memproduksi susu kedelai sebanyak 7 wadah yang masing-masing berisi <img alt=\"\" data-latex=\"6\\frac {1} {4}\" src=\"/soal/58345_3158898d43721cd2e94430fd1d385b6c.png\"/> liter susu kedelai. Seluruh hasil produksi tersebut akan dituangkan ke dalam 50 botol besar dengan isi yang sama banyak dan ke dalam 15 botol kecil dengan isi setiap botolnya adalah setengah botol besar.</p>",
    "questionText": "<p>Tentukan <strong>Benar </strong>atau <strong>Salah </strong>untuk setiap pernyataan berikut tentang hasil produksi susu kedelai Pak Bondan!</p>",
    "categories": [
      {
        "key": "B",
        "label": "Benar"
      },
      {
        "key": "S",
        "label": "Salah"
      }
    ],
    "statements": [
      {
        "id": "P1",
        "text": "<p>Pada hari itu Pak Bondan memproduksi <img alt=\"\" data-latex=\"43\\frac {3} {4}\" src=\"/soal/58345_82a3d38f3ad03628b29d9d3435132cb2.png\"/>liter susu kedelai.</p>",
        "correctCategoryKey": "B"
      },
      {
        "id": "P2",
        "text": "<p>Setiap botol besar diisi susu kedelai sebanyak <img alt=\"\" data-latex=\"\\frac {35} {46}\" src=\"/soal/58345_8d1b742071f4defdececf3357a34ba86.png\"/>liter.</p>",
        "correctCategoryKey": "B"
      },
      {
        "id": "P3",
        "text": "<p>Total susu kedelai yang dikemas dalam botol kecil adalah <img alt=\"\" data-latex=\"\\frac {525} {46}\" src=\"/soal/58345_2be042b768dc4120fe2f51e538136f7d.png\"/>liter.</p>",
        "correctCategoryKey": "S"
      }
    ]
  },
  {
    "id": "tka-004",
    "type": "single",
    "subjectId": "sub-mat-sd",
    "topicId": "top-geometri",
    "subtopicId": "st-sifat-bangun",
    "conceptId": "c-sifat-bangun-ruang",
    "competency": "Menggunakan sifat sisi berlawanan pada dadu",
    "difficulty": "menengah",
    "reasoningType": "penalaran",
    "contentFormat": "html",
    "stimulus": "<p>Mae bermain ular tangga menggunakan sebuah dadu. Diketahui bahwa jumlah titik pada setiap dua sisi berlawanan pada dadu adalah sama. Pada saat giliran Mae bermain, Mae melempar dadunya. Berikut adalah dadu hasil lemparan Mae.</p><p><img alt=\"\" src=\"/soal/31032_21c6872fb18c70275887eb7b88754365.png\"/></p>",
    "questionText": "<p>Pada dadu tersebut, banyak titik yang ada di sisi bawah adalah ….</p>",
    "options": [
      {
        "key": "A",
        "text": "<p>2</p>"
      },
      {
        "key": "B",
        "text": "<p>3</p>"
      },
      {
        "key": "C",
        "text": "<p>4</p>"
      },
      {
        "key": "D",
        "text": "<p>5</p>"
      }
    ],
    "correctAnswer": "B"
  },
  {
    "id": "tka-005",
    "type": "mcma",
    "subjectId": "sub-mat-sd",
    "topicId": "top-geometri",
    "subtopicId": "st-satuan-pengukuran",
    "conceptId": "c-satuan-berat",
    "competency": "Mengubah dan membandingkan satuan berat pada situasi nyata",
    "difficulty": "menengah",
    "reasoningType": "penalaran",
    "contentFormat": "html",
    "stimulus": "<p>Setiap bulan Ramadan, SD Harapan mengadakan bakti sosial. Mereka membagi sembako yang berisi 3 kg beras, dua bungkus gula pasir dengan berat masing-masing kemasan 5 hg, dan lima bungkus mi instan dengan berat per bungkus 85 g.</p>",
    "questionText": "<p>Pilihlah pernyataan yang benar sesuai dengan informasi tersebut! Jawaban benar lebih dari satu.</p>",
    "options": [
      {
        "key": "A",
        "text": "<p>Total berat semua isi paket adalah 4.425 gram.</p>"
      },
      {
        "key": "B",
        "text": "<p>Berat mi instan dalam paket tersebut lebih dari 0,5 kilogram.</p>"
      },
      {
        "key": "C",
        "text": "<p>Satu kemasan gula pasir lebih berat dibandingkan seluruh mi instan.</p>"
      }
    ],
    "correctAnswers": [
      "A",
      "C"
    ]
  },
  {
    "id": "tka-006",
    "type": "category",
    "subjectId": "sub-mat-sd",
    "topicId": "top-data",
    "subtopicId": "st-penyajian-data",
    "conceptId": "c-baca-diagram",
    "competency": "Menafsirkan diagram batang untuk menilai pernyataan",
    "difficulty": "menengah",
    "reasoningType": "penalaran",
    "contentFormat": "html",
    "stimulus": "<p>SD Harapan baru saja meresmikan ruang perpustakaan untuk siswa. Bu Anita sedang mendata banyak siswa yang berkunjung ke perpustakaan tersebut pada lima hari pertama sejak diresmikan. Diagram berikut menggambarkan data yang diperoleh Bu Anita.</p><p><strong>Data Pengunjung Perpustakaan SD Harapan</strong><br/><img alt=\"\" height=\"309\" src=\"/soal/73109_ffe98e27da69e4bb210706baa1ce06e6.png\" width=\"513\"/></p>",
    "questionText": "<p>Deskripsi apakah yang tepat tentang data pada diagram tersebut?<br/>Tentukan <strong>Benar </strong>atau <strong>Salah </strong>untuk setiap pernyataan berikut!</p>",
    "categories": [
      {
        "key": "B",
        "label": "Benar"
      },
      {
        "key": "S",
        "label": "Salah"
      }
    ],
    "statements": [
      {
        "id": "P1",
        "text": "<p>Banyak siswa yang mengunjungi perpustakaan pada hari Senin hanya <img alt=\"\" data-latex=\"\\frac {3} {4}\" src=\"/soal/73109_553a4f740a7e508c0ea1af324c690683.png\"/>dari pengunjung pada hari Rabu.</p>",
        "correctCategoryKey": "B"
      },
      {
        "id": "P2",
        "text": "<p>Total siswa pengunjung perpustakaan mulai dari hari Senin hingga hari Jumat adalah 100.</p>",
        "correctCategoryKey": "S"
      },
      {
        "id": "P3",
        "text": "<p>Perbedaan banyak pengunjung harian dengan hari sebelumnya tidak lebih dari 5 orang.</p>",
        "correctCategoryKey": "B"
      }
    ]
  },
  {
    "id": "tka-007",
    "type": "category",
    "subjectId": "sub-mat-sd",
    "topicId": "top-data",
    "subtopicId": "st-penyajian-data",
    "conceptId": "c-baca-diagram",
    "competency": "Membaca piktogram beserta nilai satuan gambarnya",
    "difficulty": "menengah",
    "reasoningType": "penerapan",
    "contentFormat": "html",
    "stimulus": "<p>SD Mutiara mengadakan program pekan literasi. Selama pekan literasi, para siswa ditugaskan untuk mencatat jumlah buku yang mereka baca di rumah. Rina, Dika, dan Siti mencatat buku yang mereka baca dalam bentuk piktogram seperti pada gambar berikut.</p><p><strong>Piktogram Data Jumlah Buku yang Dibaca</strong><br/><img alt=\"\" height=\"257\" src=\"/soal/87885_83f732c2be712123bf3e202b2c7cfec5.png\" width=\"311\"/></p>",
    "questionText": "<p>Berdasarkan informasi dari piktogram tersebut, tentukan <strong>Benar </strong>atau <strong>Salah</strong> untuk setiap pernyataan berikut terkait jumlah buku yang dibaca oleh Rina, Dika, dan Siti!</p>",
    "categories": [
      {
        "key": "B",
        "label": "Benar"
      },
      {
        "key": "S",
        "label": "Salah"
      }
    ],
    "statements": [
      {
        "id": "P1",
        "text": "<p>Rina membaca sepuluh buku.</p>",
        "correctCategoryKey": "B"
      },
      {
        "id": "P2",
        "text": "<p>Dika membaca buku lebih sedikit daripada Rina.</p>",
        "correctCategoryKey": "B"
      },
      {
        "id": "P3",
        "text": "<p>Siti membaca tiga buku.</p>",
        "correctCategoryKey": "S"
      }
    ]
  },
  {
    "id": "tka-008",
    "type": "single",
    "subjectId": "sub-mat-sd",
    "topicId": "top-bilangan",
    "subtopicId": "st-operasi-pecahan",
    "conceptId": "c-operasi-kali-bagi",
    "competency": "Menentukan bagian dari suatu keseluruhan dalam bentuk pecahan",
    "difficulty": "menengah",
    "reasoningType": "penalaran",
    "contentFormat": "html",
    "stimulus": "<p>Pak Bakri mempunyai lahan seluas 3,5 hektar. Pada lahan tersebut, <img alt=\"\" data-latex=\"\\frac {1} {5}\" src=\"/soal/14884_ba88e2a4dfbcc2652503c8b70fa7d0eb.png\"/> bagiannya akan ditanami cabai merah, <img alt=\"\" data-latex=\"\\frac {1} {3}\" src=\"/soal/14884_39a4a5c1ec7c3f5ba0fdeedc8f4a6c1a.png\"/> bagiannya akan ditanami tomat, dan sisanya akan ditanami daun bawang.</p>",
    "questionText": "<p>Berapakah luas lahan yang akan ditanami tomat dan daun bawang?</p>",
    "options": [
      {
        "key": "A",
        "text": "<p>1,63 hektar.</p>"
      },
      {
        "key": "B",
        "text": "<p>1,87 hektar.</p>"
      },
      {
        "key": "C",
        "text": "<p>2,33 hektar.</p>"
      },
      {
        "key": "D",
        "text": "<p>2,80 hektar.</p>"
      }
    ],
    "correctAnswer": "D"
  },
  {
    "id": "tka-009",
    "type": "single",
    "subjectId": "sub-mat-sd",
    "topicId": "top-geometri",
    "subtopicId": "st-volume",
    "conceptId": "c-volume-balok",
    "competency": "Menghitung volume balok dari perubahan ukuran kubus",
    "difficulty": "menengah",
    "reasoningType": "penalaran",
    "contentFormat": "html",
    "stimulus": "<p>Sebuah bak berbentuk kubus memiliki volume sebesar <img alt=\"\" data-latex=\"9\\, {m}^{3}\" height=\"37\" src=\"/soal/22847_cb5b84381284fa3cff0e6edf4efd41df.png\" width=\"76\"/><sup></sup>Bak tersebut akan diubah menjadi sebuah balok dengan panjangnya 2 kali dari ukuran bak sebelumnya, lebarnya <img alt=\"\" data-latex=\"\\frac {1} {2}\" src=\"/soal/22847_073c96b387453cf6c3a75752302c655b.png\"/> dari ukuran bak sebelumnya, dan tingginya sama dengan ukuran bak sebelumnya.</p>",
    "questionText": "<p>Volume dari bak yang baru adalah ….</p>",
    "options": [
      {
        "key": "A",
        "text": "<p>4,5 m<sup>3</sup></p>"
      },
      {
        "key": "B",
        "text": "<p>9 m<sup>3</sup></p>"
      },
      {
        "key": "C",
        "text": "<p>18 m<sup>3</sup></p>"
      },
      {
        "key": "D",
        "text": "<p>22,5 m<sup>3</sup></p>"
      }
    ],
    "correctAnswer": "B"
  },
  {
    "id": "tka-010",
    "type": "single",
    "subjectId": "sub-mat-sd",
    "topicId": "top-geometri",
    "subtopicId": "st-waktu-kecepatan",
    "conceptId": "c-kecepatan",
    "competency": "Menghitung waktu tempuh dari jarak dan kecepatan rata-rata",
    "difficulty": "menengah",
    "reasoningType": "penerapan",
    "contentFormat": "html",
    "stimulus": "<p>Pak Bayu dan keluarganya tinggal di Kota Yogyakarta dan berencana untuk liburan ke Semarang. Diketahui jarak Yogyakarta-Semarang 140 km dan kecepatan rata-rata mobil Pak Bayu 80 km/jam. Pak Bayu dan keluarga berangkat dari rumah pukul 06.00.</p>",
    "questionText": "<p>Apabila di tengah perjalanan mereka berhenti selama 15 menit untuk membeli oleh-oleh, pukul berapakah Pak Bayu dan keluarga tiba di Semarang?</p>",
    "options": [
      {
        "key": "A",
        "text": "<p>07.45</p>"
      },
      {
        "key": "B",
        "text": "<p>08.00</p>"
      },
      {
        "key": "C",
        "text": "<p>08.45</p>"
      },
      {
        "key": "D",
        "text": "<p>09.00</p>"
      }
    ],
    "correctAnswer": "B"
  },
  {
    "id": "tka-011",
    "type": "category",
    "subjectId": "sub-mat-sd",
    "topicId": "top-geometri",
    "subtopicId": "st-waktu-kecepatan",
    "conceptId": "c-satuan-waktu",
    "competency": "Menghitung selisih waktu dalam hari, minggu, dan bulan",
    "difficulty": "menengah",
    "reasoningType": "penerapan",
    "contentFormat": "html",
    "stimulus": "<p>Lala berulang tahun setiap tanggal 14 Juni. Dia akan berusia 13 tahun pada bulan Juni tahun ini. Sekarang tanggal 30 April.</p>",
    "questionText": "<p>Berdasarakan informasi tersebut, tentukan <strong>Benar</strong> atau <strong>Salah </strong>untuk setiap pernyataan berikut terkait ulang tahun Lala!</p>",
    "categories": [
      {
        "key": "B",
        "label": "Benar"
      },
      {
        "key": "S",
        "label": "Salah"
      }
    ],
    "statements": [
      {
        "id": "P1",
        "text": "<p>Lala harus menunggu 45 hari lagi untuk merayakan ulang tahunnya.</p>",
        "correctCategoryKey": "B"
      },
      {
        "id": "P2",
        "text": "<p>Lala harus menunggu enam minggu dan tiga hari lagi untuk merayakan ulang tahunnya.</p>",
        "correctCategoryKey": "B"
      },
      {
        "id": "P3",
        "text": "<p>Lala harus menunggu dua bulan untuk merayakan ulang tahunnya.</p>",
        "correctCategoryKey": "S"
      }
    ]
  },
  {
    "id": "tka-012",
    "type": "single",
    "subjectId": "sub-mat-sd",
    "topicId": "top-bilangan",
    "subtopicId": "st-operasi-pecahan",
    "conceptId": "c-operasi-jumlah-kurang",
    "competency": "Menghitung berat satuan dari total berat dalam bentuk desimal",
    "difficulty": "menengah",
    "reasoningType": "penerapan",
    "contentFormat": "html",
    "stimulus": "<p>Ibu pergi ke pasar membeli 3 kg buah. Di dalam keranjang belanja ibu, terdapat dua buah alpukat mentega dengan berat 1,25 kg dan sisanya adalah tujuh buah mangga kweni.</p>",
    "questionText": "<p>Berat satu buah mangga kweni adalah ….</p>",
    "options": [
      {
        "key": "A",
        "text": "<p>0,2 kg</p>"
      },
      {
        "key": "B",
        "text": "<p>0,25 kg</p>"
      },
      {
        "key": "C",
        "text": "<p>0,3 kg</p>"
      },
      {
        "key": "D",
        "text": "<p>0,35 kg</p>"
      }
    ],
    "correctAnswer": "B"
  },
  {
    "id": "tka-013",
    "type": "category",
    "subjectId": "sub-mat-sd",
    "topicId": "top-geometri",
    "subtopicId": "st-satuan-pengukuran",
    "conceptId": "c-satuan-volume",
    "competency": "Mengubah satuan volume cair dan menerapkannya",
    "difficulty": "menengah",
    "reasoningType": "penalaran",
    "contentFormat": "html",
    "stimulus": "<p>Seorang petani memiliki tangki berisi air sebanyak 0,8 hektoliter. Air tersebut akan ditampung ke dalam bak penampungan yang nantinya akan digunakan untuk menyiram tanaman cabai. Bak penampungan dapat menampung 20 liter air.</p>",
    "questionText": "<p>Berdasarkan informasi tersebut, tentukan <strong>Benar</strong> atau<strong> Salah </strong>untuk setiap pernyataan berikut!</p>",
    "categories": [
      {
        "key": "B",
        "label": "Benar"
      },
      {
        "key": "S",
        "label": "Salah"
      }
    ],
    "statements": [
      {
        "id": "P1",
        "text": "<p>Air di dalam tangki tersebut adalah 80 liter.</p>",
        "correctCategoryKey": "B"
      },
      {
        "id": "P2",
        "text": "<p>Petani dapat mengisi bak penampungan sebanyak lima kali hingga tangki kosong.</p>",
        "correctCategoryKey": "S"
      },
      {
        "id": "P3",
        "text": "<p>Jika satu baris tanaman cabai membutuhkan <img alt=\"\" data-latex=\"40\\, dl\" height=\"35\" src=\"/soal/39311_0dcae0d2201c7989742907d5ab068f3c.png\" width=\"80\"/> air, sepuluh baris tanaman cabai dapat membuat volume air dalam tangki berkurang setengahnya.</p>",
        "correctCategoryKey": "B"
      }
    ]
  },
  {
    "id": "tka-014",
    "type": "mcma",
    "subjectId": "sub-mat-sd",
    "topicId": "top-geometri",
    "subtopicId": "st-volume",
    "conceptId": "c-volume-balok",
    "competency": "Memilih ukuran kotak yang memenuhi volume tertentu",
    "difficulty": "menengah",
    "reasoningType": "penalaran",
    "contentFormat": "html",
    "stimulus": "<p>Bu Guru menugaskan Doni untuk membawa sebuah kotak yang dapat menampung 64 kubus satuan. Kubus satuan adalah kubus yang mempunyai rusuk 1 cm. Di rumah, Doni memiliki beberapa macam kotak dengan berbagai ukuran.</p>",
    "questionText": "<p>Di antara pilihan berikut, kotak mana sajakah yang harus dibawa oleh Doni? Pilihlah jawaban yang benar! Jawaban benar lebih dari satu.</p>",
    "options": [
      {
        "key": "A",
        "text": "<p>Kotak berukuran 8 cm × 2 cm × 4 cm</p>"
      },
      {
        "key": "B",
        "text": "<p>Kotak berukuran 4 cm × 4 cm × 4 cm</p>"
      },
      {
        "key": "C",
        "text": "<p>Kotak berukuran 4 cm × 3 cm × 5 cm</p>"
      }
    ],
    "correctAnswers": [
      "A",
      "B"
    ]
  },
  {
    "id": "tka-015",
    "type": "category",
    "subjectId": "sub-mat-sd",
    "topicId": "top-geometri",
    "subtopicId": "st-satuan-pengukuran",
    "conceptId": "c-satuan-panjang",
    "competency": "Mengubah dan menjumlahkan satuan panjang dari denah",
    "difficulty": "menengah",
    "reasoningType": "penalaran",
    "contentFormat": "html",
    "stimulus": "<p>Nisa sedang mengunjungi kebun binatang. Dia ingin melihat Capybara yang letaknya di bagian timur kebun binatang. Setelah Nisa melewati gerbang kebun binatang, dia melihat papan petunjuk jalan sebagai berikut.</p><p><img alt=\"\" src=\"/soal/37419_54c7662ad3efb88986fc7df6c96fc96f.png\"/></p>",
    "questionText": "<p>Berdasarkan informasi tersebut, tentukan <strong>Benar</strong> atau<strong> Salah </strong>untuk setiap pernyataan berikut!</p>",
    "categories": [
      {
        "key": "B",
        "label": "Benar"
      },
      {
        "key": "S",
        "label": "Salah"
      }
    ],
    "statements": [
      {
        "id": "P1",
        "text": "<p>Jarak kandang Zebra adalah 6.000 mm.</p>",
        "correctCategoryKey": "S"
      },
      {
        "id": "P2",
        "text": "<p>Jarak kandang Capybara dan Kanguru adalah 1.500 cm.</p>",
        "correctCategoryKey": "B"
      },
      {
        "id": "P3",
        "text": "<p>Jika Nisa melihat Jerapah, kemudian dia ingin melihat Kanguru, maka Nisa harus berjalan sejauh 0,11 km.</p>",
        "correctCategoryKey": "B"
      }
    ]
  },
  {
    "id": "tka-016",
    "type": "single",
    "subjectId": "sub-mat-sd",
    "topicId": "top-bilangan",
    "subtopicId": "st-operasi-bilangan",
    "conceptId": "c-operasi-cacah",
    "competency": "Menyelesaikan pembagian bersisa pada situasi nyata",
    "difficulty": "menengah",
    "reasoningType": "penerapan",
    "contentFormat": "html",
    "stimulus": "<p>Dio sedang membantu ayah memotong batang rotan untuk dijadikan stik pewangi ruangan. Ayah mempunyai batang rotan dengan panjang 320 cm. Ayah ingin membuat stik pewangi ruangan sebanyak mungkin dengan panjang stik masing-masing 15 cm.</p>",
    "questionText": "<p>Sisa batang rotan yang tidak terpakai untuk membuat stik pewangi ruangan adalah sepanjang ….</p>",
    "options": [
      {
        "key": "A",
        "text": "<p>4 cm</p>"
      },
      {
        "key": "B",
        "text": "<p>5 cm</p>"
      },
      {
        "key": "C",
        "text": "<p>6 cm</p>"
      },
      {
        "key": "D",
        "text": "<p>7 cm</p>"
      }
    ],
    "correctAnswer": "B"
  },
  {
    "id": "tka-017",
    "type": "single",
    "subjectId": "sub-mat-sd",
    "topicId": "top-bilangan",
    "subtopicId": "st-kpk-fpb",
    "conceptId": "c-kpk",
    "competency": "Menerapkan KPK pada jadwal kegiatan berulang",
    "difficulty": "menengah",
    "reasoningType": "penerapan",
    "contentFormat": "html",
    "stimulus": "<p>Murid-murid SD Cerdas, SD Pelita, dan SD Mentari melakukan kegiatan olahraga di lapangan bola yang sama. Jadwal mereka melakukan kegiatan olahraga tidak sama. Murid-murid SD Cerdas melakukan kegiatan olahraga setiap 2 minggu sekali. Murid-murid SD Pelita melakukan kegiatan olahraga setiap 3 minggu sekali. Murid-murid SD Mentari melakukan kegiatan olahraga setiap 4 minggu sekali. Hari ini ketiga SD tersebut melakukan kegiatan olahraga secara bersamaan.</p>",
    "questionText": "<p>Setiap periode waktu berapakah murid ketiga SD tersebut akan bertemu dalam kegiatan olahraga di lapangan?</p>",
    "options": [
      {
        "key": "A",
        "text": "<p>4 minggu</p>"
      },
      {
        "key": "B",
        "text": "<p>6 minggu</p>"
      },
      {
        "key": "C",
        "text": "<p>12 minggu</p>"
      },
      {
        "key": "D",
        "text": "<p>18 minggu</p>"
      }
    ],
    "correctAnswer": "C"
  },
  {
    "id": "tka-018",
    "type": "single",
    "subjectId": "sub-mat-sd",
    "topicId": "top-bilangan",
    "subtopicId": "st-operasi-pecahan",
    "conceptId": "c-operasi-jumlah-kurang",
    "competency": "Menghitung operasi pecahan dengan lambang sederhana",
    "difficulty": "menengah",
    "reasoningType": "penerapan",
    "contentFormat": "html",
    "stimulus": "<p>Misal <img alt=\"\" data-latex=\"a\\, =\\, 5\\, -\\, \\frac {7} {2}\" src=\"/soal/21541_1fc3ac39a839ed337ba22373d1e01c8b.png\"/> dan <img alt=\"\" data-latex=\"b\\, =\\, \\frac {3} {4}\\, -\\, \\frac {1} {2}\" src=\"/soal/21541_2dc59811b374eac1d8db532f1defcf7e.png\"/>.</p>",
    "questionText": "<p>Maka <img alt=\"\" data-latex=\"a\\, -\\, 2b\\, =\" src=\"/soal/21541_5a6faf8249551d6dbeeb3802746d6e11.png\"/>.....</p>",
    "options": [
      {
        "key": "A",
        "text": "<p>1</p>"
      },
      {
        "key": "B",
        "text": "<p><img alt=\"\" data-latex=\"1\\frac {1} {4}\" src=\"/soal/21541_907c5e9275f2a949ff19a0734b0ce73d.png\"/></p>"
      },
      {
        "key": "C",
        "text": "<p>2</p>"
      },
      {
        "key": "D",
        "text": "<p><img alt=\"\" data-latex=\"2\\frac {1} {4}\" src=\"/soal/21541_2645b6283de281750a2772363bdf23b2.png\"/></p>"
      }
    ],
    "correctAnswer": "A"
  },
  {
    "id": "tka-019",
    "type": "single",
    "subjectId": "sub-mat-sd",
    "topicId": "top-bilangan",
    "subtopicId": "st-pecahan-senilai",
    "conceptId": "c-senilai-mengenali",
    "competency": "Menentukan pecahan dari bagian gambar",
    "difficulty": "menengah",
    "reasoningType": "pemahaman",
    "contentFormat": "html",
    "stimulus": "<p>Desti mendapatkan hadiah satu loyang kue pada hari ulang tahunnya. Desti memotong kuenya menjadi beberapa bagian seperti yang terlihat pada gambar. Beberapa potong kue berwarna cokelat dan beberapa potong lainnya berwarna kuning.</p><p><img alt=\"\" src=\"/soal/57566_d25eb3d15a9695272348b45136457c91.png\"/></p>",
    "questionText": "<p>Berapa bagiankah kue yang berwarna cokelat dari keseluruhan kue?</p>",
    "options": [
      {
        "key": "A",
        "text": "<p><img alt=\"\" data-latex=\"\\frac {1} {8}\" src=\"/soal/57566_8c8f344169b622ed7f12b7bb9ac998c2.png\"/></p>"
      },
      {
        "key": "B",
        "text": "<p><img alt=\"\" data-latex=\"\\frac {1} {4}\" src=\"/soal/57566_4c241b0ebd7e4719258715f91a8f5f3a.png\"/></p>"
      },
      {
        "key": "C",
        "text": "<p><img alt=\"\" data-latex=\"\\frac {1} {2}\" src=\"/soal/57566_073c96b387453cf6c3a75752302c655b.png\"/></p>"
      },
      {
        "key": "D",
        "text": "<p><img alt=\"\" data-latex=\"\\frac {3} {4}\" src=\"/soal/57566_553a4f740a7e508c0ea1af324c690683.png\"/></p>"
      }
    ],
    "correctAnswer": "B"
  },
  {
    "id": "tka-020",
    "type": "single",
    "subjectId": "sub-mat-sd",
    "topicId": "top-geometri",
    "subtopicId": "st-keliling-luas",
    "conceptId": "c-keliling-persegi-panjang",
    "competency": "Menghitung keliling bangun gabungan",
    "difficulty": "menengah",
    "reasoningType": "penerapan",
    "contentFormat": "html",
    "stimulus": "<p>Pak Boni memiliki sebidang tanah berbentuk bangun sebagai berikut.</p><p><img alt=\"\" src=\"/soal/78224_c29fd511941563a631fbb6470eb5facb.png\"/></p>",
    "questionText": "<p>Berapakah keliling bidang tanah Pak Boni?</p>",
    "options": [
      {
        "key": "A",
        "text": "<p>58 m</p>"
      },
      {
        "key": "B",
        "text": "<p>68 m</p>"
      },
      {
        "key": "C",
        "text": "<p>72 m</p>"
      },
      {
        "key": "D",
        "text": "<p>96 m</p>"
      }
    ],
    "correctAnswer": "B"
  },
  {
    "id": "tka-021",
    "type": "single",
    "subjectId": "sub-mat-sd",
    "topicId": "top-bilangan",
    "subtopicId": "st-operasi-bilangan",
    "conceptId": "c-operasi-cacah",
    "competency": "Menyelesaikan perkalian dan pembagian bertingkat pada soal cerita",
    "difficulty": "menengah",
    "reasoningType": "penerapan",
    "contentFormat": "html",
    "stimulus": "<p>Untuk meningkatkan minat membaca siswa, perpustakaan di SD Cahaya mengadakan kegiatan “Ayo Membaca Buku” untuk murid kelas 6. Jumlah peserta dari Kelas A sebanyak 28 siswa, dari Kelas B sebanyak 36 siswa, dan dari Kelas C sebanyak 32 siswa. Setiap siswa akan mendapatkan 3 buah buku bacaan.</p>",
    "questionText": "<p>Jika 1 dus berisi 24 buku, berapa dus buku yang dibutuhkan untuk kegiatan tersebut?</p>",
    "options": [
      {
        "key": "A",
        "text": "<p>8 dus</p>"
      },
      {
        "key": "B",
        "text": "<p>10 dus</p>"
      },
      {
        "key": "C",
        "text": "<p>12 dus</p>"
      },
      {
        "key": "D",
        "text": "<p>24 dus</p>"
      }
    ],
    "correctAnswer": "C"
  },
  {
    "id": "tka-022",
    "type": "single",
    "subjectId": "sub-mat-sd",
    "topicId": "top-bilangan",
    "subtopicId": "st-perbandingan-pecahan",
    "conceptId": "c-banding-penyebut-beda",
    "competency": "Membandingkan pecahan, desimal, dan persen",
    "difficulty": "menengah",
    "reasoningType": "penalaran",
    "contentFormat": "html",
    "stimulus": "<p>Pada hari Sabtu, Andi, Beni, Citra, dan Dika mengikuti kegiatan “Lari Sehat” di lapangan desa. Mereka semua menargetkan untuk menyelesaikan jarak lari yang sama, yaitu 10 km. Hingga pukul 08.00, diperoleh data sebagai berikut.</p><ul><li>Andi telah menempuh 0,4 bagian dari total jarak.</li><li>Beni telah menempuh 60% dari total jarak.</li><li>Citra telah menempuh <img alt=\"\" data-latex=\"\\frac {1} {3}\" height=\"44\" src=\"/soal/34274_39a4a5c1ec7c3f5ba0fdeedc8f4a6c1a.png\" width=\"50\"/> bagian dari total jarak.</li><li>Dika telah menempuh 5,5 km dari total jarak.</li></ul>",
    "questionText": "<p>Siapakah yang telah menempuh jarak lari sebesar <img alt=\"\" data-latex=\"\\frac {3} {5}\" src=\"/soal/34274_4283efcd54f0cd3c58bfb52d90c5bf7b.png\"/> dari total jarak?</p>",
    "options": [
      {
        "key": "A",
        "text": "<p>Andi</p>"
      },
      {
        "key": "B",
        "text": "<p>Beni</p>"
      },
      {
        "key": "C",
        "text": "<p>Citra</p>"
      },
      {
        "key": "D",
        "text": "<p>Dika</p>"
      }
    ],
    "correctAnswer": "B"
  },
  {
    "id": "tka-023",
    "type": "single",
    "subjectId": "sub-mat-sd",
    "topicId": "top-geometri",
    "subtopicId": "st-sifat-bangun",
    "conceptId": "c-sifat-bangun-datar",
    "competency": "Mengenali bangun datar dari sifat-sifatnya",
    "difficulty": "menengah",
    "reasoningType": "pemahaman",
    "contentFormat": "html",
    "stimulus": "<p>Sebuah bangun datar memiliki sifat-sifat sebagai berikut:</p><ol><li>Keempat sisinya sama panjang.</li><li>Memiliki dua pasang sisi sejajar.</li><li>Diagonal-diagonalnya saling berpotongan tegak lurus.</li><li>Sudut-sudut yang berhadapan sama besar.</li></ol>",
    "questionText": "<p>Berdasarkan sifat-sifat di atas, apakah nama bangun datar tersebut?</p>",
    "options": [
      {
        "key": "A",
        "text": "<p>Persegi</p>"
      },
      {
        "key": "B",
        "text": "<p>Persegi panjang</p>"
      },
      {
        "key": "C",
        "text": "<p>Belah ketupat</p>"
      },
      {
        "key": "D",
        "text": "<p>Layang-layang</p>"
      }
    ],
    "correctAnswer": "C"
  },
  {
    "id": "tka-024",
    "type": "single",
    "subjectId": "sub-mat-sd",
    "topicId": "top-geometri",
    "subtopicId": "st-waktu-kecepatan",
    "conceptId": "c-satuan-waktu",
    "competency": "Menghitung waktu berurutan pada rangkaian kegiatan",
    "difficulty": "menengah",
    "reasoningType": "penerapan",
    "contentFormat": "html",
    "stimulus": "<p>Pada hari Minggu, Rani mengikuti kegiatan belajar menari di sanggar seni.</p><ul><li>Rani berangkat dari rumah pukul 07.25.</li><li>Perjalanan menuju sanggar memerlukan waktu 45 menit.</li><li>Kegiatan belajar menari berlangsung selama 1 jam 35 menit.</li><li>Setelah kegiatan selesai, Rani beristirahat di sanggar selama 20 menit sebelum pulang.</li></ul>",
    "questionText": "<p>Pukul berapakah Rani meninggalkan sanggar untuk pulang?</p>",
    "options": [
      {
        "key": "A",
        "text": "<p>09.45</p>"
      },
      {
        "key": "B",
        "text": "<p>10.00</p>"
      },
      {
        "key": "C",
        "text": "<p>10.05</p>"
      },
      {
        "key": "D",
        "text": "<p>10.25</p>"
      }
    ],
    "correctAnswer": "C"
  },
  {
    "id": "tka-025",
    "type": "single",
    "subjectId": "sub-mat-sd",
    "topicId": "top-geometri",
    "subtopicId": "st-keliling-luas",
    "conceptId": "c-keliling-persegi-panjang",
    "competency": "Membaca ukuran pada denah untuk menghitung daya tampung",
    "difficulty": "menengah",
    "reasoningType": "penalaran",
    "contentFormat": "html",
    "stimulus": "<p><strong>TAMAN KOTA</strong></p><p>Taman kota merupakan salah satu fasilitas hiburan yang sangat bermanfaat bagi warga sekitar. Di taman terdapat banyak pohon sehingga terasa sejuk dan segar. Berikut merupakan salah satu desain denah taman kota.</p><p><img alt=\"\" src=\"/soal/80459_1aeca2f53d435aef3287227b2ace6a8f.png\"/></p>",
    "questionText": "<p>Perhatikan tempat parkir mobil di taman kota. Lebar jalan yang disediakan untuk parkir satu mobil adalah 2 meter. Satu mobil baru saja keluar dari parkiran. Berapa mobil lagi yang dapat diparkir di area tersebut sekarang?</p>",
    "options": [
      {
        "key": "A",
        "text": "<p>9</p>"
      },
      {
        "key": "B",
        "text": "<p>10</p>"
      },
      {
        "key": "C",
        "text": "<p>12</p>"
      },
      {
        "key": "D",
        "text": "<p>14</p>"
      }
    ],
    "correctAnswer": "B"
  },
  {
    "id": "tka-026",
    "type": "category",
    "subjectId": "sub-mat-sd",
    "topicId": "top-geometri",
    "subtopicId": "st-keliling-luas",
    "conceptId": "c-luas-gabungan",
    "competency": "Menggunakan luas untuk menentukan daya tampung lahan",
    "difficulty": "menengah",
    "reasoningType": "penalaran",
    "contentFormat": "html",
    "stimulus": "<p><strong>TAMAN KOTA</strong></p><p>Taman kota merupakan salah satu fasilitas hiburan yang sangat bermanfaat bagi warga sekitar. Di taman terdapat banyak pohon sehingga terasa sejuk dan segar. Berikut merupakan salah satu desain denah taman kota.</p><p><img alt=\"\" src=\"/soal/80459_1aeca2f53d435aef3287227b2ace6a8f.png\"/></p>",
    "questionText": "<p>Lahan parkir motor ada di sekitar taman. Parkiran yang tersedia cukup luas.<br/>Satu motor membutuhkan lahan parkir seluas 2 .<br/>Pada pukul 13.00, terdapat 12 motor yang memasuki area parkir dan dapat terparkir dengan rapi di lahan parkir.<br/>Ternyata lahan parkir dapat menampung 1 motor lagi.<br/>Tentukan Benar atau Salah pernyataan berikut terkait tempat parkir motor pada siang itu!</p>",
    "categories": [
      {
        "key": "B",
        "label": "Benar"
      },
      {
        "key": "S",
        "label": "Salah"
      }
    ],
    "statements": [
      {
        "id": "P1",
        "text": "<p>Terdapat 4 motor yang sudah keluar dari lahan parkir sebelum pukul 13.00.</p>",
        "correctCategoryKey": "B"
      },
      {
        "id": "P2",
        "text": "<p>Sebelum 12 motor memasuki lahan parkir, lahan parkir sudah terisi oleh 8 motor.</p>",
        "correctCategoryKey": "S"
      },
      {
        "id": "P3",
        "text": "<p>Pada pukul 13.00 lahan parkir terisi oleh 20 motor.</p>",
        "correctCategoryKey": "S"
      }
    ]
  },
  {
    "id": "tka-027",
    "type": "single",
    "subjectId": "sub-mat-sd",
    "topicId": "top-bilangan",
    "subtopicId": "st-operasi-pecahan",
    "conceptId": "c-operasi-kali-bagi",
    "competency": "Mengubah bagian pecahan menjadi persen",
    "difficulty": "menengah",
    "reasoningType": "penerapan",
    "contentFormat": "html",
    "stimulus": "<p><strong>HOBI MEMBACA BUKU</strong></p><p>Danu, Antok, dan Caca hobi membaca buku. Setiap minggu mereka akan membaca satu dari tiga buku berikut. Buku yang dibaca setiap anak berbeda-beda setiap minggunya.</p><p><img alt=\"\" src=\"/soal/49905_24dc4275ae08272b98043803422e1e21.png\"/></p><p>Pada minggu pertama, Danu membaca buku biru, Antok membaca buku hijau, dan Caca membaca buku merah. Setiap hari Kamis, mereka membandingkan banyak halaman yang sudah dibaca. Berikut ini gambar yang menginformasikan banyak bagian buku yang sudah dibaca oleh Danu, Antok, dan Caca sampai hari Kamis minggu pertama.</p><p><img alt=\"\" src=\"/soal/49905_1ca23a31881d89b31cbc417cdbadcb74.png\"/></p>",
    "questionText": "<p>Berapa persen dari seluruh halaman buku yang sudah selesai dibaca oleh Caca?</p>",
    "options": [
      {
        "key": "A",
        "text": "<p>34%</p>"
      },
      {
        "key": "B",
        "text": "<p>50%</p>"
      },
      {
        "key": "C",
        "text": "<p>66%</p>"
      },
      {
        "key": "D",
        "text": "<p>75%</p>"
      }
    ],
    "correctAnswer": "D"
  },
  {
    "id": "tka-028",
    "type": "category",
    "subjectId": "sub-mat-sd",
    "topicId": "top-bilangan",
    "subtopicId": "st-operasi-pecahan",
    "conceptId": "c-operasi-kali-bagi",
    "competency": "Menghitung banyak halaman dari bagian buku yang dibaca",
    "difficulty": "menengah",
    "reasoningType": "penalaran",
    "contentFormat": "html",
    "stimulus": "<p><strong>HOBI MEMBACA BUKU</strong></p><p>Danu, Antok, dan Caca hobi membaca buku. Setiap minggu mereka akan membaca satu dari tiga buku berikut. Buku yang dibaca setiap anak berbeda-beda setiap minggunya.</p><p><img alt=\"\" src=\"/soal/49905_24dc4275ae08272b98043803422e1e21.png\"/></p><p>Pada minggu pertama, Danu membaca buku biru, Antok membaca buku hijau, dan Caca membaca buku merah. Setiap hari Kamis, mereka membandingkan banyak halaman yang sudah dibaca. Berikut ini gambar yang menginformasikan banyak bagian buku yang sudah dibaca oleh Danu, Antok, dan Caca sampai hari Kamis minggu pertama.</p><p><img alt=\"\" src=\"/soal/49905_1ca23a31881d89b31cbc417cdbadcb74.png\"/></p>",
    "questionText": "<p>Berdasarkan informasi mengenai jumlah halaman buku dan banyak bagian buku yang sudah dibaca oleh Danu, Antok, dan Caca di minggu pertama, tentukan <strong>Benar</strong> atau <strong>Salah </strong>untuk setiap pernyataan berikut!</p>",
    "categories": [
      {
        "key": "B",
        "label": "Benar"
      },
      {
        "key": "S",
        "label": "Salah"
      }
    ],
    "statements": [
      {
        "id": "P1",
        "text": "<p>Danu sudah membaca 219 halaman.</p>",
        "correctCategoryKey": "B"
      },
      {
        "id": "P2",
        "text": "<p>Antok sudah membaca 170 halaman.</p>",
        "correctCategoryKey": "B"
      },
      {
        "id": "P3",
        "text": "<p>Caca sudah membaca 287 halaman.</p>",
        "correctCategoryKey": "S"
      }
    ]
  },
  {
    "id": "tka-029",
    "type": "mcma",
    "subjectId": "sub-mat-sd",
    "topicId": "top-data",
    "subtopicId": "st-penyajian-data",
    "conceptId": "c-baca-tabel",
    "competency": "Membaca tabel kandungan gizi untuk memenuhi kebutuhan harian",
    "difficulty": "menengah",
    "reasoningType": "penalaran",
    "contentFormat": "html",
    "stimulus": "<p><strong>LEMAK SEHAT UNTUK ANAK</strong></p><p>Tahukah kamu bahwa lemak dan protein merupakan nutrisi penting untuk tubuh? Kebutuhan lemak dan protein harus terpenuhi agar kesehatan tubuh terjaga. Lemak dan protein sangat mudah ditemukan bahkan dalam satu jenis makanan, lho. Berikut ini informasi tentang makanan yang mengandung lemak dan protein.</p><p><img alt=\"\" src=\"/soal/96825_d0bc22f34a2bf781213209f6050af649.png\"/></p>",
    "questionText": "<p>Anak berusia 10 - 12 tahun membutuhkan protein paling sedikit 55 gram dalam sehari. Jika disediakan makanan berikut dengan berat masing-masing 250 gram, tentukanlah makanan yang dapat memenuhi kebutuhan protein harian mereka! Pilihlah jawaban yang benar! Jawaban benar lebih dari satu.</p>",
    "options": [
      {
        "key": "A",
        "text": "<p>Daging sapi</p>"
      },
      {
        "key": "B",
        "text": "<p>Telur ayam</p>"
      },
      {
        "key": "C",
        "text": "<p>Ikan</p>"
      }
    ],
    "correctAnswers": [
      "A",
      "C"
    ]
  },
  {
    "id": "tka-030",
    "type": "category",
    "subjectId": "sub-mat-sd",
    "topicId": "top-data",
    "subtopicId": "st-penyajian-data",
    "conceptId": "c-baca-tabel",
    "competency": "Menilai kecukupan gizi dari tabel dan catatan konsumsi",
    "difficulty": "menengah",
    "reasoningType": "penalaran",
    "contentFormat": "html",
    "stimulus": "<p><strong>LEMAK SEHAT UNTUK ANAK</strong></p><p>Tahukah kamu bahwa lemak dan protein merupakan nutrisi penting untuk tubuh? Kebutuhan lemak dan protein harus terpenuhi agar kesehatan tubuh terjaga. Lemak dan protein sangat mudah ditemukan bahkan dalam satu jenis makanan, lho. Berikut ini informasi tentang makanan yang mengandung lemak dan protein.</p><p><img alt=\"\" src=\"/soal/96825_d0bc22f34a2bf781213209f6050af649.png\"/></p><p>Menurut Kementerian Kesehatan RI, ibu hamil harus mengonsumsi lebih banyak makanan yang mengandung protein dan lemak. Hal ini disarankan agar memastikan jaringan dan organ bayi dapat tumbuh dengan baik. Ibu hamil perlu mengonsumsi 70 hingga 100 gram protein setiap hari, sedangkan lemak dapat dikonsumsi sebanyak 62 hingga 67 gram dalam sehari.<br/>Suatu hari, seorang ibu hamil mencatat banyak lemak dan protein yang dikonsumsi sebagai berikut.</p>",
    "questionText": "<p><img alt=\"\" height=\"532\" src=\"/soal/07803_76fb3de6685e5624d4054fc9bdd5d69e.png\" width=\"553\"/><br/>Berdasarkan informasi tersebut, tentukanlah <strong>Benar </strong>atau <strong>Salah </strong>pernyataan berikut mengenai kebutuhan lemak dan protein seorang ibu hamil jika menambah konsumsi makanan!</p>",
    "categories": [
      {
        "key": "B",
        "label": "Benar"
      },
      {
        "key": "S",
        "label": "Salah"
      }
    ],
    "statements": [
      {
        "id": "P1",
        "text": "<p>Ibu hamil dapat menambah konsumsi 50 gram ikan untuk memenuhi kebutuhan protein.</p>",
        "correctCategoryKey": "S"
      },
      {
        "id": "P2",
        "text": "<p>Ibu hamil dapat menambah konsumsi 50 gram keju untuk memenuhi kebutuhan lemak.</p>",
        "correctCategoryKey": "B"
      },
      {
        "id": "P3",
        "text": "<p>Ibu hamil dapat menambah konsumsi 50 gram daging sapi untuk memenuhi kebutuhan protein.</p>",
        "correctCategoryKey": "B"
      }
    ]
  }
];
