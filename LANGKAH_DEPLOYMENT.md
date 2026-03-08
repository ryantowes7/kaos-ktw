"# 📋 Panduan Deployment - Aplikasi Pemesanan Kaos Khatulistiwa

## ✅ Status Aplikasi
Aplikasi **SUDAH BERFUNGSI SEMPURNA** di environment development dengan:
- ✅ Backend FastAPI + Supabase (PostgreSQL)
- ✅ Frontend React dengan form pemesanan
- ✅ Perhitungan harga otomatis
- ✅ Halaman success dengan tombol WhatsApp konfirmasi
- ✅ Data tersimpan ke database Supabase

---

## 📦 Struktur Project

```
/app/
├── backend/              # FastAPI Backend
│   ├── server.py        # Main API server
│   ├── database.py      # Supabase connection
│   ├── models.py        # Database models
│   ├── requirements.txt # Python dependencies
│   ├── .env            # Environment variables
│   └── alembic/        # Database migrations
│
└── frontend/           # React Frontend
    ├── src/
    │   ├── App.js      # Main application
    │   ├── App.css     # Styling
    │   └── index.js    # Entry point
    ├── public/
    │   └── mockup-kaos.png  # T-shirt mockup image
    └── package.json    # Node dependencies
```

---

## 🚀 Langkah 1: Push ke GitHub

### A. Inisialisasi Git Repository

```bash
cd /app
git init
git add .
git commit -m "Initial commit: Kaos Khatulistiwa order system"
```

### B. Buat Repository di GitHub

1. Buka [github.com](https://github.com) dan login
2. Klik tombol **"New"** atau **"+"** di pojok kanan atas
3. Isi detail repository:
   - **Repository name**: `kaos-khatulistiwa-order`
   - **Description**: Aplikasi pemesanan Kaos Khatulistiwa Batch 1
   - **Visibility**: Private atau Public (terserah Anda)
4. **JANGAN** centang "Initialize with README"
5. Klik **"Create repository"**

### C. Push Code ke GitHub

```bash
# Ganti <username> dengan username GitHub Anda
git remote add origin https://github.com/<username>/kaos-khatulistiwa-order.git
git branch -M main
git push -u origin main
```

**Catatan**: Anda akan diminta username dan password GitHub. Untuk password, gunakan **Personal Access Token** (bukan password akun).

Cara membuat Personal Access Token:
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token → Centang `repo` → Generate token
3. Copy token dan simpan (hanya muncul sekali!)

---

## 🌐 Langkah 2: Deploy Frontend ke Vercel

### A. Persiapan File untuk Vercel

Buat file `vercel.json` di folder `/app`:

```bash
cat > /app/vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ]
}
EOF
```

Buat file `.vercelignore`:

```bash
cat > /app/.vercelignore << 'EOF'
backend/
__pycache__/
*.pyc
.env
.git/
node_modules/
alembic/
EOF
```

### B. Deploy ke Vercel

**Via Vercel Dashboard (Recommended)**

1. Buka [vercel.com](https://vercel.com) dan login dengan GitHub
2. Klik **"Add New Project"**
3. Import repository `kaos-khatulistiwa-order` dari GitHub
4. Configure project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `yarn build` (default)
   - **Output Directory**: `build` (default)
5. **Environment Variables** - Tambahkan:
   ```
   REACT_APP_BACKEND_URL=https://shirt-order-system.preview.emergentagent.com
   ```
   (Nanti akan diganti dengan URL Railway)
6. Klik **"Deploy"**

**Via Vercel CLI (Alternative)**

```bash
npm install -g vercel
cd /app/frontend
vercel login
vercel --prod
```

---

## 🚂 Langkah 3: Deploy Backend ke Railway

### A. Persiapan File untuk Railway

Buat file `railway.json`:

```bash
cat > /app/backend/railway.json << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn server:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF
```

Buat file `Procfile` (untuk Railway):

```bash
cat > /app/backend/Procfile << 'EOF'
web: uvicorn server:app --host 0.0.0.0 --port $PORT
EOF
```

### B. Deploy ke Railway

1. Buka [railway.app](https://railway.app) dan login dengan GitHub
2. Klik **"New Project"**
3. Pilih **"Deploy from GitHub repo"**
4. Select repository `kaos-khatulistiwa-order`
5. Railway akan auto-detect Python app

### C. Configure Railway

1. **Root Directory**: Klik Settings → Set root directory ke `backend`
2. **Environment Variables** - Tambahkan:
   ```
   DATABASE_URL=postgresql://postgres.knjnocwohgyaxodcyeji:QNtMbVqLmpMoltPj@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres
   CORS_ORIGINS=*
   ```
3. **Generate Domain**: 
   - Settings → Generate Domain
   - Copy URL (misal: `https://kaos-khatulistiwa-backend-production.up.railway.app`)

### D. Jalankan Migration di Railway

Setelah deploy:
1. Railway Dashboard → Service → Settings
2. Scroll ke **"Build & Deploy"**
3. Add **Custom Start Command**:
   ```
   alembic upgrade head && uvicorn server:app --host 0.0.0.0 --port $PORT
   ```
4. Redeploy

---

## 🔄 Langkah 4: Update Frontend dengan Railway Backend URL

### Update di Vercel

1. Vercel Dashboard → Project → Settings → Environment Variables
2. Edit `REACT_APP_BACKEND_URL`:
   ```
   REACT_APP_BACKEND_URL=https://kaos-khatulistiwa-backend-production.up.railway.app
   ```
3. Redeploy frontend

---

## 🧪 Langkah 5: Testing Production

### Test Backend

```bash
curl https://kaos-khatulistiwa-backend-production.up.railway.app/api/
```

Expected response: `{"message":"Kaos Khatulistiwa Order API"}`

### Test Frontend

1. Buka URL Vercel (misal: `https://kaos-khatulistiwa-order.vercel.app`)
2. Isi form pemesanan
3. Submit dan pastikan muncul halaman success
4. Klik tombol "Konfirmasi via WhatsApp"

---

## 📊 Melihat Data di Supabase

1. Login ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Klik **"Table Editor"** di sidebar
4. Pilih table `orders`
5. Lihat semua order yang masuk

---

## 🔧 Troubleshooting

### Frontend tidak bisa connect ke Backend
- Pastikan `REACT_APP_BACKEND_URL` di Vercel sudah benar
- Pastikan CORS sudah di-enable di backend
- Check browser console untuk error

### Database connection error di Railway
- Pastikan `DATABASE_URL` menggunakan **Transaction Pooler** (port 6543)
- Bukan Direct Connection (port 5432)

### Migration error
- SSH ke Railway container dan jalankan manual:
  ```bash
  railway run alembic upgrade head
  ```

---

## 📝 Environment Variables Summary

### Frontend (.env atau Vercel)
```
REACT_APP_BACKEND_URL=https://your-backend-url.railway.app
```

### Backend (.env atau Railway)
```
DATABASE_URL=postgresql://postgres.knjnocwohgyaxodcyeji:QNtMbVqLmpMoltPj@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres
CORS_ORIGINS=*
```

---

## ✅ Checklist Deployment

- [ ] Code di-push ke GitHub
- [ ] Frontend deployed ke Vercel
- [ ] Backend deployed ke Railway  
- [ ] Database migrations dijalankan di Railway
- [ ] Frontend environment variable updated dengan Railway URL
- [ ] Test form submission end-to-end
- [ ] Test WhatsApp confirmation button
- [ ] Verify data masuk ke Supabase

---

## 🎉 Selesai!

Aplikasi pemesanan Kaos Khatulistiwa sudah live di production! 

**URL yang akan Anda dapatkan:**
- Frontend: `https://kaos-khatulistiwa-order.vercel.app`
- Backend: `https://kaos-khatulistiwa-backend.railway.app`

Share URL frontend ke pelanggan Anda dan mereka bisa langsung pesan!
"