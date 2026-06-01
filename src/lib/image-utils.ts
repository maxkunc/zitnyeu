import { toast } from "sonner";

/**
 * Načte obrázek z File, zmenší na max rozměr a vrátí komprimovaný dataURL.
 * Brání překročení kvóty localStorage při ukládání obrázků k projektům / partnerům.
 */
export async function fileToCompressedDataUrl(
  file: File,
  opts: { maxSize?: number; quality?: number; mime?: string } = {}
): Promise<string> {
  const { maxSize = 1280, quality = 0.82 } = opts;

  if (!file.type.startsWith("image/")) {
    throw new Error("Soubor není obrázek");
  }

  // SVG necháváme jak je (vektor, malý)
  if (file.type === "image/svg+xml") {
    return await readAsDataUrl(file);
  }

  const dataUrl = await readAsDataUrl(file);
  const img = await loadImage(dataUrl);

  let { width, height } = img;
  if (width > maxSize || height > maxSize) {
    const ratio = Math.min(maxSize / width, maxSize / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, width, height);

  // PNG s průhledností zachováme jako PNG, jinak JPEG (menší)
  const outMime = opts.mime ?? (file.type === "image/png" ? "image/png" : "image/jpeg");
  return canvas.toDataURL(outMime, quality);
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function handleImageUpload(cb: (dataUrl: string) => void) {
  return async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const url = await fileToCompressedDataUrl(f);
      cb(url);
      toast.success("Obrázek nahrán");
    } catch (err) {
      console.error(err);
      toast.error("Nahrání obrázku selhalo");
    } finally {
      e.target.value = "";
    }
  };
}
