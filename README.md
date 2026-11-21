# 🥚 Theziz AI - Egg Fertility Scanner

Aplikasi Full-Stack Web untuk mendeteksi kesuburan telur secara otomatis menggunakan model **YOLOv11** berbasis AI.

![Tech Stack](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)

---

## 📁 Struktur Folder

```
egg-fertile-infertile/
├── backend/
│   ├── main.py              # FastAPI server & endpoint prediksi
│   ├── requirements.txt     # Dependensi Python
│   └── best.pt              # Model YOLOv11 (letakkan secara manual)
│
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── App.tsx           # Komponen utama UI
│   │   ├── main.tsx          # Entry point React
│   │   └── index.css         # Tailwind CSS + custom styles
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
└── README.md
```

---

## ⚙️ Prasyarat

- **Python** 3.9+ → [Download](https://www.python.org/downloads/)
- **Node.js** 18+ → [Download](https://nodejs.org/)
- **File Model** `best.pt` (YOLOv11 yang sudah di-training untuk deteksi telur)

---

## 🚀 Cara Menjalankan

### Terminal 1: Backend (FastAPI)

```bash
# 1. Masuk ke folder backend
cd backend

# 2. (Opsional) Buat virtual environment
python -m venv venv

# Windows:
venv\Scripts\activate

# Mac/Linux:
source venv/bin/activate

# 3. Install dependensi
pip install -r requirements.txt

# 4. Pastikan file best.pt ada di folder backend/
#    Jika belum, salin file model YOLOv11 Anda ke sini.

# 5. Jalankan server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Server berjalan di: **http://localhost:8000**  
Dokumentasi API (Swagger): **http://localhost:8000/docs**

---

### Terminal 2: Frontend (React + Vite)

```bash
# 1. Masuk ke folder frontend
cd frontend

# 2. Install dependensi
npm install

# 3. Jalankan dev server
npm run dev
```

Aplikasi berjalan di: **http://localhost:5173**

---

## 🎯 Cara Menggunakan

1. Buka **http://localhost:5173** di browser.
2. **Upload** gambar telur (format JPG/PNG) menggunakan drag & drop atau klik area upload.
3. Klik tombol **"Deteksi Sekarang"**.
4. Tunggu proses inferensi AI selesai.
5. Lihat hasil:
   - **Gambar Asli** vs **Gambar Hasil Deteksi** (bounding box/segmentasi).
   - **Card Summary**: jumlah telur **Fertile (Subur)** 🟢 dan **Infertile (Kosong)** 🔴.
   - **Progress Bar** distribusi persentase.

---

## 🔌 API Endpoint

### `POST /predict`

**Request:** `multipart/form-data` dengan field `file` (gambar JPG/PNG)

**Response:**
```json
{
  "status": "success",
  "fertile_count": 5,
  "infertile_count": 3,
  "image_base64": "data:image/jpeg;base64,..."
}
```

### `GET /`

**Response:** Health check status server.

---

## 🛠️ Tech Stack

| Layer    | Teknologi                                  |
| -------- | ------------------------------------------ |
| Frontend | React, TypeScript, Vite, Tailwind CSS v4   |
| Backend  | Python, FastAPI, Uvicorn                   |
| AI/ML    | Ultralytics YOLOv11, Pillow                |
| Upload   | python-multipart                           |

---

## 📝 Catatan

- Pastikan **kedua server** (backend & frontend) berjalan bersamaan di terminal yang berbeda.
- File `best.pt` **tidak disertakan** di repository. Gunakan model yang sudah Anda training.
- Backend menggunakan CORS `allow_origins=["*"]` untuk development. Ubah untuk production.
- Confidence threshold: `0.5`, IoU threshold: `0.45` (dapat diubah di `main.py`).

---

## 📂 Dataset & Atribusi

**Dataset:** [Egg Fertile Infertile Dataset](https://universe.roboflow.com/skripsi-gqi1u/dataset-new-c9tqt/dataset/6) oleh Roboflow Universe — Lisensi [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

**Notebook Referensi:** `egg-fertility-classification-using-mobilenetv2.ipynb` merupakan notebook eksplorasi klasifikasi menggunakan MobileNetV2 yang diadaptasi dari Kaggle.
