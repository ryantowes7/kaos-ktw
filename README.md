"# 👕 Aplikasi Pemesanan Kaos "Khatulistiwa" Batch 1

Aplikasi web untuk mendata pemesanan kaos dengan form yang diisi langsung oleh konsumen. Data tersimpan otomatis ke database Supabase.

![Status](https://img.shields.io/badge/status-production%20ready-success)
![Frontend](https://img.shields.io/badge/frontend-React-blue)
![Backend](https://img.shields.io/badge/backend-FastAPI-green)
![Database](https://img.shields.io/badge/database-Supabase-orange)

---

## ✨ Fitur

- 📝 **Form Pemesanan Lengkap**: Input data pelanggan (Nama, No HP, Alamat)
- 👕 **Size Selection**: 
  - Kaos Anak: XS, S, M, L, XL, XXL (Lengan Pendek/Panjang)
  - Kaos Dewasa: S, M, L, XL, XXL, XXXL, 4XL, 5XL (Lengan Pendek/Panjang)
- 💰 **Perhitungan Otomatis**: 
  - Kaos Anak: Rp 50.000 (pendek) / Rp 60.000 (panjang)
  - Kaos Dewasa: Rp 100.000 (pendek) / Rp 110.000 (panjang)
- ✅ **Halaman Konfirmasi**: Success page dengan tombol WhatsApp
- 📱 **Responsive Design**: Mobile-friendly
- 🖼️ **Mockup Display**: Menampilkan desain kaos
- 📊 **Database Integration**: Semua order tersimpan di Supabase PostgreSQL

---

## 🛠️ Tech Stack

### Frontend
- **React** 19.0
- **TailwindCSS** 3.4 - Styling
- **Shadcn/UI** - Component library
- **Axios** - HTTP client
- **Sonner** - Toast notifications
- **Lucide React** - Icons

### Backend
- **FastAPI** - Python web framework
- **SQLAlchemy** 2.0 - ORM
- **Alembic** - Database migrations
- **AsyncPG** - Async PostgreSQL driver
- **Pydantic** - Data validation

### Database
- **Supabase PostgreSQL** - Cloud database

---

## 📦 Instalasi Lokal

### Prerequisites
- Python 3.11+
- Node.js 18+
- Yarn package manager

### 1. Clone Repository

```bash
git clone https://github.com/<username>/kaos-khatulistiwa-order.git
cd kaos-khatulistiwa-order
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env dan isi DATABASE_URL dengan Supabase connection string

# Run migrations
alembic upgrade head

# Start backend server
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
yarn install

# Setup environment variables
cp .env.example .env
# Edit .env dan isi REACT_APP_BACKEND_URL

# Start frontend
yarn start
```

Aplikasi akan berjalan di:
- Frontend: http://localhost:3000
- Backend: http://localhost:8001

---

## 🌐 Deployment

Lihat panduan lengkap di [LANGKAH_DEPLOYMENT.md](./LANGKAH_DEPLOYMENT.md)

**Summary:**
1. Push code ke GitHub
2. Deploy Frontend ke Vercel
3. Deploy Backend ke Railway
4. Configure environment variables
5. Test production deployment

---

## 📊 Database Schema

### Table: `orders`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| nama | VARCHAR(255) | Nama pemesan |
| no_hp | VARCHAR(50) | Nomor HP/WhatsApp |
| alamat | TEXT | Alamat lengkap |
| size_anak_pendek | JSON | Data ukuran anak lengan pendek |
| size_anak_panjang | JSON | Data ukuran anak lengan panjang |
| size_dewasa_pendek | JSON | Data ukuran dewasa lengan pendek |
| size_dewasa_panjang | JSON | Data ukuran dewasa lengan panjang |
| total_harga | INTEGER | Total pembayaran |
| created_at | TIMESTAMP | Waktu pemesanan |

---

## 🔌 API Endpoints

### GET `/api/`
Health check endpoint

**Response:**
```json
{
  "message": "Kaos Khatulistiwa Order API"
}
```

### POST `/api/orders`
Create new order

**Request Body:**
```json
{
  "nama": "Budi Santoso",
  "no_hp": "081234567890",
  "alamat": "Jl. Merdeka No. 45, Jakarta",
  "size_anak_pendek": {"M": 5},
  "size_anak_panjang": {},
  "size_dewasa_pendek": {"L": 3, "XL": 2},
  "size_dewasa_panjang": {"XL": 10},
  "total_harga": 1850000
}
```

**Response:**
```json
{
  "id": "uuid-here",
  "nama": "Budi Santoso",
  "no_hp": "081234567890",
  "alamat": "Jl. Merdeka No. 45, Jakarta",
  "size_anak_pendek": {"M": 5},
  "size_anak_panjang": {},
  "size_dewasa_pendek": {"L": 3, "XL": 2},
  "size_dewasa_panjang": {"XL": 10},
  "total_harga": 1850000,
  "created_at": "2026-03-07T16:55:20.268605+00:00"
}
```

### GET `/api/orders`
Get all orders (for viewing in database)

---

## 📱 Contact Person

**Pemesanan Kaos Khatulistiwa Batch 1**

- 085338538900 (Mendem)
- 081519719102 (Pulu)

---

## 📸 Screenshots

### Home Page
Form pemesanan dengan header informasi dan mockup kaos

### Success Page
Halaman konfirmasi dengan tombol WhatsApp

---

## 🤝 Contributing

Ini adalah private project untuk pemesanan internal. Tidak menerima contribution dari luar.

---

## 📄 License

Private - All Rights Reserved

---

## 🙏 Credits

Developed with ❤️ for Khatulistiwa Community

**Technology Stack:**
- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)
- [Supabase](https://supabase.com/)
- [Vercel](https://vercel.com/)
- [Railway](https://railway.app/)
"