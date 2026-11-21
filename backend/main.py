import io
import base64
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import numpy as np
from ultralytics import YOLO

# ──────────────────────────────────────────────
# Inisialisasi FastAPI
# ──────────────────────────────────────────────
app = FastAPI(
    title="Theziz AI - Egg Fertility Detection API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────────────────────────────
# Load YOLOv11 model saat server startup
# ──────────────────────────────────────────────
MODEL_PATH = Path(__file__).parent / "best.pt"
model: YOLO | None = None


@app.on_event("startup")
async def load_model():
    global model
    if not MODEL_PATH.exists():
        print(f"⚠️  Model file tidak ditemukan di {MODEL_PATH}")
        print("   Letakkan file best.pt di folder backend/ lalu restart server.")
    else:
        model = YOLO(str(MODEL_PATH))
        print(f"✅ Model YOLOv11 berhasil dimuat dari {MODEL_PATH}")


# ──────────────────────────────────────────────
# Endpoint Prediksi
# ──────────────────────────────────────────────
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """Menerima gambar telur, menjalankan inferensi YOLOv11,
    dan mengembalikan hasil segmentasi + jumlah fertile/infertile."""

    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Model belum dimuat. Pastikan file best.pt tersedia di folder backend/.",
        )

    # Validasi tipe file
    if file.content_type not in ("image/jpeg", "image/png", "image/jpg"):
        raise HTTPException(
            status_code=400,
            detail="Format file tidak didukung. Gunakan JPG atau PNG.",
        )

    try:
        # 1. Baca gambar dari upload
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert("RGB")

        # 2. Jalankan inferensi
        results = model.predict(source=img, conf=0.5, iou=0.45)
        result = results[0]

        # 3. Dapatkan gambar hasil segmentasi/deteksi
        annotated_bgr = result.plot()  # numpy array BGR
        annotated_rgb = annotated_bgr[:, :, ::-1]  # konversi ke RGB

        # 4. Encode ke Base64
        pil_result = Image.fromarray(annotated_rgb)
        buffer = io.BytesIO()
        pil_result.save(buffer, format="JPEG", quality=90)
        img_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

        # 5. Hitung jumlah per kelas
        class_names = result.names  # {0: "infertile", 1: "fertile"} (sesuai training)
        boxes = result.boxes
        fertile_count = 0
        infertile_count = 0

        if boxes is not None:
            for cls_id in boxes.cls.tolist():
                cls_id = int(cls_id)
                name = class_names.get(cls_id, "").lower()
                if name == "fertile":
                    fertile_count += 1
                elif name == "infertile":
                    infertile_count += 1

        return {
            "status": "success",
            "fertile_count": fertile_count,
            "infertile_count": infertile_count,
            "image_base64": f"data:image/jpeg;base64,{img_base64}",
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan saat inferensi: {str(e)}")


# ──────────────────────────────────────────────
# Health Check
# ──────────────────────────────────────────────
@app.get("/")
async def root():
    return {
        "service": "Theziz AI - Egg Fertility Detection",
        "status": "running",
        "model_loaded": model is not None,
    }
