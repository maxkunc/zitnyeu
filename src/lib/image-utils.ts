import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/**
 * Zmenší obrázek na max rozměr a vrátí Blob připravený k uploadu.
 * SVG necháváme beze změny (vektor).
 */
async function fileToCompressedBlob(
  file: File,
  opts: { maxSize?: number; quality?: number } = {},
): Promise<{ blob: Blob; ext: string; contentType: string }> {
  const { maxSize = 1600, quality = 0.85 } = opts;
  if (!file.type.startsWith("image/")) throw new Error("Soubor není obrázek");
  if (file.type === "image/svg+xml") {
    return { blob: file, ext: "svg", contentType: "image/svg+xml" };
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
  if (!ctx) throw new Error("Canvas není dostupný");
  ctx.drawImage(img, 0, 0, width, height);

  const isPng = file.type === "image/png";
  const mime = isPng ? "image/png" : "image/jpeg";
  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Komprese selhala"))), mime, quality),
  );
  return { blob, ext: isPng ? "png" : "jpg", contentType: mime };
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

/** Nahraje obrázek do storage bucketu `site-images` a vrátí veřejnou URL. */
export async function uploadImage(file: File): Promise<string> {
  const { blob, ext, contentType } = await fileToCompressedBlob(file);
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from("site-images")
    .upload(name, blob, { contentType, cacheControl: "31536000", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("site-images").getPublicUrl(name);
  return data.publicUrl;
}

export function handleImageUpload(cb: (url: string) => void) {
  return async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const t = toast.loading("Nahrávám obrázek…");
    try {
      const url = await uploadImage(f);
      cb(url);
      toast.success("Obrázek nahrán", { id: t });
    } catch (err) {
      console.error(err);
      toast.error("Nahrání obrázku selhalo", { id: t });
    } finally {
      e.target.value = "";
    }
  };
}
