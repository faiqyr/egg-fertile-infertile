import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from "react";

/* ─── Types ─────────────────────────────────── */
interface PredictionResult {
  status: string;
  fertile_count: number;
  infertile_count: number;
  image_base64: string;
}

/* ─── Constants ─────────────────────────────── */
const API_URL = "http://localhost:8000/predict";
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/jpg"];

/* ─── App ───────────────────────────────────── */
export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── File Handling ─────────────────────────── */
  const handleFile = useCallback((f: File) => {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setError("Format tidak didukung. Gunakan file JPG atau PNG.");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError(null);
  }, []);

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFile(droppedFile);
    },
    [handleFile]
  );

  const onFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected) handleFile(selected);
    },
    [handleFile]
  );

  const resetAll = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  /* ── Prediction ────────────────────────────── */
  const handlePredict = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || `Server error: ${res.status}`);
      }

      const data: PredictionResult = await res.json();
      setResult(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Terjadi kesalahan tidak diketahui.";
      setError(
        message.includes("fetch")
          ? "Tidak dapat menghubungi server. Pastikan backend berjalan di http://localhost:8000"
          : message
      );
    } finally {
      setLoading(false);
    }
  };

  /* ── Render ────────────────────────────────── */
  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ────────────────────────────── */}
      <header className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 via-purple-600/20 to-primary-600/20" />
        <div className="relative max-w-6xl mx-auto px-4 py-8 sm:py-12 text-center">
          {/* Logo / Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 shadow-lg shadow-primary-500/25 mb-5">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-primary-200 to-purple-300 bg-clip-text text-transparent">
            Egg Fertility Scanner
          </h1>
        
          <p className="mt-3 text-sm text-slate-400 max-w-md mx-auto">
            Deteksi kesuburan telur secara otomatis menggunakan teknologi <span className="text-primary-300 font-semibold">YOLOv11</span> berbasis AI
          </p>
        </div>
      </header>

      {/* ── Main Content ──────────────────────── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 sm:py-12">
        {/* ── Upload Area ─────────────────────── */}
        <section className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`
              relative cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-12
              transition-all duration-300 ease-out text-center group
              ${
                isDragging
                  ? "border-primary-400 bg-primary-500/10 scale-[1.02]"
                  : preview
                    ? "border-primary-500/50 bg-surface-card/50"
                    : "border-slate-600 bg-surface-card/30 hover:border-primary-500/50 hover:bg-surface-card/50"
              }
            `}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={onFileChange}
              className="hidden"
              id="file-upload"
            />

            {preview ? (
              <div className="space-y-4">
                <img
                  src={preview}
                  alt="Preview gambar yang diupload"
                  className="max-h-64 mx-auto rounded-xl shadow-2xl shadow-black/40 object-contain"
                />
                <p className="text-sm text-slate-400">
                  <span className="font-medium text-white">{file?.name}</span>
                  <span className="mx-2">·</span>
                  {file && (file.size / 1024).toFixed(1)} KB
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetAll();
                  }}
                  className="text-xs text-red-400 hover:text-red-300 underline underline-offset-2 transition-colors"
                >
                  Hapus & Upload Ulang
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-700/50 group-hover:bg-primary-500/20 transition-colors">
                  <svg className="w-8 h-8 text-slate-400 group-hover:text-primary-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-200 group-hover:text-white transition-colors">
                    Drag & Drop gambar di sini
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    atau <span className="text-primary-400 font-medium">klik untuk memilih file</span>
                  </p>
                </div>
                <p className="text-xs text-slate-600">
                  Format: JPG, PNG • Maks: 10MB
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── Action Button ───────────────────── */}
        {preview && (
          <section className="mt-6 text-center animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <button
              onClick={handlePredict}
              disabled={loading}
              className={`
                relative inline-flex items-center gap-3 px-8 py-4 rounded-xl
                font-semibold text-base tracking-wide
                transition-all duration-300 ease-out
                ${
                  loading
                    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-primary-600 to-purple-600 text-white hover:from-primary-500 hover:to-purple-500 hover:shadow-xl hover:shadow-primary-500/25 hover:scale-[1.03] active:scale-[0.98]"
                }
              `}
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Memproses AI...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  Deteksi Sekarang
                </>
              )}
            </button>
          </section>
        )}

        {/* ── Error Toast ─────────────────────── */}
        {error && (
          <div className="mt-6 animate-fade-in-up">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 max-w-2xl mx-auto">
              <svg className="w-5 h-5 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <div className="text-left">
                <p className="text-sm font-semibold text-red-300">Terjadi Kesalahan</p>
                <p className="text-sm text-red-400/80 mt-0.5">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400/60 hover:text-red-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ── Loading Skeleton ────────────────── */}
        {loading && (
          <section className="mt-10 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[0, 1].map((i) => (
                <div key={i} className="rounded-2xl bg-surface-card/60 p-4 space-y-4">
                  <div className="h-4 w-32 bg-slate-700 rounded animate-shimmer" />
                  <div className="aspect-[4/3] bg-slate-700/50 rounded-xl animate-shimmer" />
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-center gap-6">
              {[0, 1].map((i) => (
                <div key={i} className="h-24 w-48 bg-surface-card/60 rounded-2xl animate-shimmer" />
              ))}
            </div>
          </section>
        )}

        {/* ── Results ─────────────────────────── */}
        {result && !loading && (
          <section className="mt-10 space-y-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            {/* Image Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Original */}
              <div className="rounded-2xl bg-surface-card/60 backdrop-blur-sm border border-white/5 overflow-hidden group hover:border-primary-500/30 transition-all duration-300">
                <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-sm font-medium text-slate-300">Gambar Asli</span>
                </div>
                <div className="p-4">
                  <img
                    src={preview!}
                    alt="Gambar asli telur"
                    className="w-full rounded-xl object-contain max-h-[400px] shadow-lg shadow-black/20 group-hover:shadow-xl transition-shadow"
                  />
                </div>
              </div>

              {/* Prediction */}
              <div className="rounded-2xl bg-surface-card/60 backdrop-blur-sm border border-white/5 overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
                <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400" />
                  <span className="text-sm font-medium text-slate-300">Hasil Deteksi AI</span>
                </div>
                <div className="p-4">
                  <img
                    src={result.image_base64}
                    alt="Hasil prediksi AI"
                    className="w-full rounded-xl object-contain max-h-[400px] shadow-lg shadow-black/20 group-hover:shadow-xl transition-shadow"
                  />
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {/* Fertile Card */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 p-6 group hover:border-emerald-400/40 transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/20">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                      Fertile
                    </span>
                  </div>
                  <p className="text-4xl font-extrabold text-emerald-300">
                    {result.fertile_count}
                  </p>
                  <p className="text-sm text-emerald-400/70 mt-1">Telur Subur</p>
                </div>
              </div>

              {/* Infertile Card */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 p-6 group hover:border-red-400/40 transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/20">
                      <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest text-red-400">
                      Infertile
                    </span>
                  </div>
                  <p className="text-4xl font-extrabold text-red-300">
                    {result.infertile_count}
                  </p>
                  <p className="text-sm text-red-400/70 mt-1">Telur Kosong</p>
                </div>
              </div>
            </div>

            {/* Total Summary Bar */}
            <div className="max-w-2xl mx-auto rounded-2xl bg-surface-card/60 backdrop-blur-sm border border-white/5 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-400">Distribusi Hasil</span>
                <span className="text-sm font-semibold text-slate-200">
                  Total: {result.fertile_count + result.infertile_count} telur
                </span>
              </div>
              {(result.fertile_count + result.infertile_count) > 0 && (
                <div className="w-full h-3 bg-slate-700/50 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700 ease-out rounded-l-full"
                    style={{
                      width: `${(result.fertile_count / (result.fertile_count + result.infertile_count)) * 100}%`,
                    }}
                  />
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-700 ease-out rounded-r-full"
                    style={{
                      width: `${(result.infertile_count / (result.fertile_count + result.infertile_count)) * 100}%`,
                    }}
                  />
                </div>
              )}
              <div className="flex justify-between mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Fertile ({result.fertile_count > 0 ? ((result.fertile_count / (result.fertile_count + result.infertile_count)) * 100).toFixed(1) : 0}%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  Infertile ({result.infertile_count > 0 ? ((result.infertile_count / (result.fertile_count + result.infertile_count)) * 100).toFixed(1) : 0}%)
                </span>
              </div>
            </div>

            {/* New Scan Button */}
            <div className="text-center">
              <button
                onClick={resetAll}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-card/80 border border-white/10 text-sm font-medium text-slate-300 hover:text-white hover:border-primary-500/40 hover:bg-surface-card transition-all duration-300"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M4.031 9.865" />
                </svg>
                Scan Ulang
              </button>
            </div>
          </section>
        )}
      </main>

      {/* ── Footer ────────────────────────────── */}
      <footer className="border-t border-white/5 py-6 text-center">
        <p className="text-xs text-slate-600">
          © 2026 Theziz AI · Powered by YOLOv11 & FastAPI
        </p>
      </footer>
    </div>
  );
}
