# 🥚 Theziz AI — Egg Fertility Scanner

Aplikasi web full-stack untuk mendeteksi kesuburan telur ayam secara otomatis menggunakan model **YOLOv11** berbasis computer vision.

![React](https://img.shields.io/badge/React_19-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=flat&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python_3.9+-3776AB?style=flat&logo=python&logoColor=white)
![YOLOv11](https://img.shields.io/badge/YOLOv11-00FFFF?style=flat&logo=ultralytics&logoColor=black)

---

## 📸 Demo

Upload gambar telur → AI mendeteksi dan mensegmentasi setiap telur → hasil menampilkan jumlah telur **fertile** dan **infertile** beserta visualisasi bounding box.

---

## 📁 Struktur Proyek

```
egg-fertile-infertile/
├── backend/
│   ├── main.py                   # FastAPI server & endpoint prediksi
│   ├── requirements.txt          # Dependensi Python
│   └── best.pt                   # ⚠️ Model YOLOv11 (tidak disertakan, lihat setup)
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/
│   │   ├── assets/
│   │   │   └── hero.png
│   │   ├── App.tsx               # Komponen utama UI
│   │   ├── main.tsx              # Entry point React
│   │   └── index.css             # Tailwind CSS + custom styles
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── egg-fertility-classification-using-mobilenetv2.ipynb  # Notebook eksplorasi MobileNetV2
├── data.yaml                     # Konfigurasi dataset YOLO (Roboflow)
├── dataset.yaml                  # Konfigurasi training YOLO lokal
└── README.md
```

---

## ⚙️ Prasyarat

Pastikan sudah terinstall:

- **Python** 3.9+ → [python.org](https://www.python.org/downloads/)
- **Node.js** 18+ → [nodejs.org](https://nodejs.org/)
- **File model** `best.pt` hasil training YOLOv11 (lihat bagian [Model](#-model) di bawah)

---

## 🚀 Cara Menjalankan

### 1. Clone Repository

```bash
git clone https://github.com/faiqyr/egg-fertile-infertile.git
cd egg-fertile-infertile
```

### 2. Backend (FastAPI)

```bash
cd backend
```

Buat virtual environment (opsional tapi dianjurkan):

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac / Linux
python -m venv venv
source venv/bin/activate
```

Install dependensi:

```bash
pip install -r requirements.txt
```

Letakkan file `best.pt` di folder `backend/` (lihat bagian [Model](#-model)).

Jalankan server:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

| URL | Keterangan |
|-----|-----------|
| `http://localhost:8000` | Health check |
| `http://localhost:8000/docs` | Swagger UI / dokumentasi API |

---

### 3. Frontend (React + Vite)

Buka terminal baru:

```bash
cd frontend
npm install
npm run dev
```

Aplikasi berjalan di: **http://localhost:5173**

> Pastikan backend sudah berjalan sebelum menggunakan fitur deteksi.

---

## 🎯 Cara Menggunakan

1. Buka **http://localhost:5173** di browser.
2. **Upload** gambar telur (JPG/PNG) via drag & drop atau klik area upload.
3. Klik **"Deteksi Sekarang"**.
4. Tunggu proses inferensi AI.
5. Lihat hasil:
   - **Gambar Asli** vs **Gambar Hasil Deteksi** (dengan bounding box/segmentasi overlay).
   - **Card Summary**: jumlah telur Fertile 🟢 dan Infertile 🔴.
   - **Progress Bar** distribusi persentase fertile vs infertile.

---

## 🔌 API Endpoint

### `POST /predict`

Menerima gambar dan mengembalikan hasil deteksi.

**Request:** `multipart/form-data`

| Field | Tipe | Keterangan |
|-------|------|-----------|
| `file` | `File` | Gambar telur (JPG/PNG) |

**Response:**

```json
{
  "status": "success",
  "fertile_count": 5,
  "infertile_count": 3,
  "image_base64": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

**Error Response:**

```json
{
  "detail": "Format file tidak didukung. Gunakan JPG atau PNG."
}
```

---

### `GET /`

Health check dan status model.

**Response:**

```json
{
  "service": "Theziz AI - Egg Fertility Detection",
  "status": "running",
  "model_loaded": true
}
```

---

## 🧠 Model

File `best.pt` adalah model YOLOv11 yang telah di-training untuk mendeteksi dan mensegmentasi telur fertile vs infertile. File ini **tidak disertakan** di repository karena ukurannya besar (~6 MB).

**Untuk mendapatkan model:**
- Gunakan model hasil training sendiri dari notebook `egg-fertility-classification-using-mobilenetv2.ipynb`.
- Atau training ulang menggunakan dataset di bawah dengan konfigurasi `dataset.yaml`.

Setelah mendapat file `best.pt`, letakkan di:
```
backend/
└── best.pt   ← letakkan di sini
```

---

## 🛠️ Tech Stack

| Layer | Teknologi | Versi |
|-------|-----------|-------|
| Frontend | React | 19 |
| Frontend | TypeScript | ~6.0 |
| Frontend | Vite | 8 |
| Frontend | Tailwind CSS | v4 |
| Backend | Python | 3.9+ |
| Backend | FastAPI | latest |
| Backend | Uvicorn | latest |
| AI/ML | Ultralytics YOLOv11 | latest |
| AI/ML | Pillow | latest |

---

## 📝 Catatan Development

- **CORS** saat ini dikonfigurasi `allow_origins=["*"]` untuk kemudahan development. Ganti ke domain spesifik untuk production.
- **Confidence threshold**: `0.5` | **IoU threshold**: `0.45` — dapat diubah di `backend/main.py` pada baris `model.predict(conf=0.5, iou=0.45)`.
- Notebook `.ipynb` adalah eksplorasi tambahan menggunakan MobileNetV2 untuk klasifikasi — model utama yang dipakai di aplikasi ini adalah YOLOv11.

---

## 📂 Dataset & Atribusi

**Dataset:** [Egg Fertile Infertile Dataset v6](https://universe.roboflow.com/skripsi-gqi1u/dataset-new-c9tqt/dataset/6) — Roboflow Universe
Lisensi: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) · 536 gambar total · dianotasi otomatis oleh Roboflow Auto-Label

**Notebook:** `egg-fertility-classification-using-mobilenetv2.ipynb` merupakan notebook eksplorasi klasifikasi MobileNetV2 yang diadaptasi dari Kaggle.

---

## 📄 Lisensi

Proyek ini menggunakan lisensi **MIT**. Dataset menggunakan lisensi **CC BY 4.0** (atribusi wajib).
