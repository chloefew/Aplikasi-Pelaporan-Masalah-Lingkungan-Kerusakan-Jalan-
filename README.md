# Aplikasi Pelaporan Masalah Lingkungan - Kerusakan Jalan

Aplikasi ini dirancang untuk membantu masyarakat melaporkan kerusakan jalan kepada pemerintah dengan lebih cepat dan mudah.

Fitur utama:
- Laporan dilengkapi lokasi GPS secara realtime.
- Bukti foto kerusakan dapat diunggah langsung dari perangkat.
- Riwayat laporan ditampilkan untuk memudahkan pemantauan.

## Struktur Proyek
- `server.py` - backend Python Flask untuk menerima laporan.
- `requirements.txt` - daftar dependensi Python.
- `public/index.html` - antarmuka pengguna untuk membuat laporan.
- `public/app.js` - logika frontend untuk GPS dan kirim laporan.
- `public/style.css` - gaya tampilan aplikasi.
- `uploads/` - folder tempat foto yang diunggah disimpan.
- `reports.json` - data laporan yang tersimpan.

## Cara Menjalankan
1. Pastikan Python 3 sudah terpasang.
2. Buat lingkungan virtual:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Instal dependensi:
   ```bash
   pip install -r requirements.txt
   ```
4. Jalankan aplikasi:
   ```bash
   python server.py
   ```
5. Buka `http://localhost:3000` di browser.

## Penggunaan
1. Isi nama jalan atau lokasi.
2. Tekan tombol "Dapatkan Lokasi" untuk mengambil koordinat GPS.
3. Unggah foto bukti kerusakan jalan.
4. Tekan tombol "Kirim Laporan".

Aplikasi ini bisa dikembangkan lebih lanjut dengan fitur validasi, notifikasi, dan dashboard pengelolaan laporan untuk pemerintah.
