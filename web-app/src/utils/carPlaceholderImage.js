/**
 * Ảnh minh họa (BE chưa có URL Cloudinary) — map theo hãng để đa dạng giao diện.
 */
const UNSPLASH = {
  default:
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80",
  toyota:
    "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1200&q=80",
  ford: "https://images.unsplash.com/photo-1533473359331-0135ef1b58aa?auto=format&fit=crop&w=1200&q=80",
  honda:
    "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80",
};

function optimizeCloudinaryUrl(url, transform = "w_1200,f_auto,q_auto") {
  if (!url || typeof url !== "string") return "";
  const marker = "/image/upload/";
  if (!url.includes("res.cloudinary.com") || !url.includes(marker)) return url;
  if (url.includes(`/${transform}/`)) return url;
  return url.replace(marker, `${marker}${transform}/`);
}

function isValidImageUrl(url) {
  if (!url || typeof url !== "string") return false;
  const normalized = url.trim();
  if (!/^https?:\/\//i.test(normalized)) return false;
  if (normalized.includes("/image/upload/")) return true;
  return /\.(png|jpe?g|gif|webp|avif|bmp|svg)(\?|#|$)/i.test(normalized);
}

export function getCarImageGallery(car) {
  const candidates = [...(Array.isArray(car?.imageUrls) ? car.imageUrls : []), car?.imageUrl];
  const unique = Array.from(new Set(candidates.map((item) => String(item || "").trim()).filter(Boolean)));
  return unique.filter(isValidImageUrl).map((url) => optimizeCloudinaryUrl(url));
}

export function getCarHeroImage(car) {
  const gallery = getCarImageGallery(car);
  if (gallery.length > 0) {
    return gallery[0];
  }
  const b = (car?.brand || "").toLowerCase();
  if (b.includes("toyota")) return UNSPLASH.toyota;
  if (b.includes("ford")) return UNSPLASH.ford;
  if (b.includes("honda")) return UNSPLASH.honda;
  return UNSPLASH.default;
}
