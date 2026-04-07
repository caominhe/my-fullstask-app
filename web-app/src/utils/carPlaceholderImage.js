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

export function getCarHeroImage(car) {
  const b = (car?.brand || "").toLowerCase();
  if (b.includes("toyota")) return UNSPLASH.toyota;
  if (b.includes("ford")) return UNSPLASH.ford;
  if (b.includes("honda")) return UNSPLASH.honda;
  return UNSPLASH.default;
}
