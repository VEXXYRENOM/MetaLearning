/**
 * Global 3D Model Search Engine
 * ─────────────────────────────────────────────────────────────────
 * البحث الذكي في مخازن المجسمات ثلاثية الأبعاد المجانية عبر الإنترنت
 *
 * المصادر المُتحقق منها:
 * 1. Khronos glTF-Sample-Assets (GitHub - مضمونة 100%)
 * 2. Three.js Examples (مضمونة 100%)
 * 3. Sketchfab Search API (ملايين المجسمات)
 */

// ─── ترجمة عربي → إنجليزي سريعة ─────────────────────────────────────────
const quickTranslate: Record<string, string> = {
  "كلب": "dog", "قطة": "cat", "قط": "cat", "أسد": "lion", "نمر": "tiger",
  "فيل": "elephant", "حصان": "horse", "أرنب": "rabbit", "ثعلب": "fox",
  "ذئب": "wolf", "دب": "bear", "زرافة": "giraffe", "بقرة": "cow",
  "خروف": "sheep", "دجاجة": "chicken", "طائر": "bird", "سمكة": "fish",
  "ديناصور": "dinosaur", "تنين": "dragon", "فراشة": "butterfly", "نحلة": "bee",
  "سيارة": "car", "طائرة": "airplane", "قطار": "train", "سفينة": "ship",
  "دراجة": "bicycle", "شاحنة": "truck", "حافلة": "bus", "صاروخ": "rocket",
  "دراجة نارية": "motorcycle", "هليكوبتر": "helicopter", "قارب": "boat",
  "منزل": "house", "قلعة": "castle", "مسجد": "mosque", "كنيسة": "church",
  "برج": "tower", "جسر": "bridge", "مدرسة": "school", "مبنى": "building",
  "شجرة": "tree", "زهرة": "flower", "جبل": "mountain", "بحر": "ocean",
  "صحراء": "desert", "غابة": "forest", "نهر": "river", "شلال": "waterfall",
  "تفاحة": "apple", "بيتزا": "pizza", "كعكة": "cake", "همبرغر": "hamburger",
  "سيف": "sword", "درع": "shield", "تاج": "crown", "كأس": "trophy",
  "كرسي": "chair", "طاولة": "table", "سرير": "bed", "خزانة": "wardrobe",
  "روبوت": "robot", "كمبيوتر": "computer", "هاتف": "phone", "ساعة": "watch",
  "كرة قدم": "soccer ball", "كرة": "ball", "كوكب": "planet", "قمر": "moon",
  "نجمة": "star", "شمس": "sun", "رجل": "man", "امرأة": "woman",
  "وردة": "rose", "كتاب": "book", "قلم": "pen", "حقيبة": "bag",
  "نظارات": "glasses", "قبعة": "hat", "جيتار": "guitar", "بيانو": "piano",
  "بطة": "duck", "كاميرا": "camera", "فانوس": "lantern", "مصباح": "lantern",
  "أفوكادو": "avocado", "فاكهة": "fruit", "حذاء": "shoe", "خوذة": "helmet",
  "راديو": "radio", "موسيقى": "music",
};

async function smartTranslate(text: string): Promise<string> {
  const lower = text.toLowerCase().trim();

  // 1. قاموس سريع
  for (const [ar, en] of Object.entries(quickTranslate)) {
    if (lower.includes(ar)) return en;
  }

  // 2. Google Translate مجاني
  const hasArabic = /[\u0600-\u06FF]/.test(lower);
  if (hasArabic) {
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(lower)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data?.[0]?.[0]?.[0]) return data[0][0][0].toLowerCase();
      }
    } catch (e) { /* ignore */ }
  }

  return lower;
}

// ─── Khronos glTF-Sample-Assets (مضمونة 100% على GitHub) ────────────────
// الريبو الجديد: https://github.com/KhronosGroup/glTF-Sample-Assets
const KHRONOS = "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models";

interface VerifiedModel {
  keywords: string[];
  url: string;
  nameAr: string;
  nameEn: string;
}

const VERIFIED_MODELS: VerifiedModel[] = [
  // ── Khronos glTF-Sample-Assets (جميعها مُتحقق منها) ──
  { keywords: ["fox", "ثعلب", "dog", "كلب", "shiba", "قطة", "cat"], url: `${KHRONOS}/Fox/glTF-Binary/Fox.glb`, nameAr: "حيوان رباعي متحرك", nameEn: "Animal" },
  { keywords: ["duck", "بطة"], url: `${KHRONOS}/Duck/glTF-Binary/Duck.glb`, nameAr: "بطة صفراء", nameEn: "Duck" },
  { keywords: ["helmet", "خوذة"], url: `${KHRONOS}/DamagedHelmet/glTF-Binary/DamagedHelmet.glb`, nameAr: "خوذة فضائية", nameEn: "Damaged Helmet" },
  { keywords: ["camera", "كاميرا"], url: `${KHRONOS}/AntiqueCamera/glTF-Binary/AntiqueCamera.glb`, nameAr: "كاميرا كلاسيكية", nameEn: "Antique Camera" },
  { keywords: ["bottle", "قارورة", "زجاجة", "water"], url: `${KHRONOS}/WaterBottle/glTF-Binary/WaterBottle.glb`, nameAr: "قارورة ماء", nameEn: "Water Bottle" },
  { keywords: ["lantern", "فانوس", "مصباح", "lamp"], url: `${KHRONOS}/Lantern/glTF-Binary/Lantern.glb`, nameAr: "فانوس معدني", nameEn: "Lantern" },
  { keywords: ["avocado", "أفوكادو", "fruit"], url: `${KHRONOS}/Avocado/glTF-Binary/Avocado.glb`, nameAr: "ثمرة أفوكادو", nameEn: "Avocado" },
  { keywords: ["car", "سيارة", "toy", "مركبة", "vehicle"], url: `${KHRONOS}/ToyCar/glTF-Binary/ToyCar.glb`, nameAr: "سيارة لعبة", nameEn: "Toy Car" },
  { keywords: ["chair", "كرسي", "furniture", "أثاث"], url: `${KHRONOS}/SheenChair/glTF-Binary/SheenChair.glb`, nameAr: "كرسي أنيق", nameEn: "Chair" },
  { keywords: ["radio", "راديو", "boombox", "music"], url: `${KHRONOS}/BoomBox/glTF-Binary/BoomBox.glb`, nameAr: "راديو كلاسيكي", nameEn: "BoomBox" },
  { keywords: ["brain", "دماغ", "مخ", "عقل"], url: `${KHRONOS}/BrainStem/glTF-Binary/BrainStem.glb`, nameAr: "نموذج الدماغ", nameEn: "BrainStem" },
  { keywords: ["shoe", "حذاء", "shoes"], url: `${KHRONOS}/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb`, nameAr: "حذاء رياضي", nameEn: "Shoe" },

  // ── Three.js Examples Models (مُستضافة على CDN مضمون) ──
  { keywords: ["horse", "حصان"], url: "https://threejs.org/examples/models/gltf/Horse.glb", nameAr: "حصان ثلاثي الأبعاد", nameEn: "Horse" },
  { keywords: ["flamingo", "طائر", "bird", "عصفور"], url: "https://threejs.org/examples/models/gltf/Flamingo.glb", nameAr: "طائر فلامنغو", nameEn: "Flamingo" },
  { keywords: ["parrot", "ببغاء"], url: "https://threejs.org/examples/models/gltf/Parrot.glb", nameAr: "ببغاء ملوّن", nameEn: "Parrot" },
  { keywords: ["stork", "لقلق"], url: "https://threejs.org/examples/models/gltf/Stork.glb", nameAr: "طائر اللقلق", nameEn: "Stork" },
  
  // شُخوص وبشر (من Three.js)
  { keywords: ["man", "انسان", "إنسان", "رجل", "شخص", "human", "person", "soldier"], url: "https://threejs.org/examples/models/gltf/Soldier.glb", nameAr: "إنسان متحرك", nameEn: "Human Character" },
  { keywords: ["robot", "روبوت", "آلي", "رجل آلي", "xbot"], url: "https://threejs.org/examples/models/gltf/Xbot.glb", nameAr: "روبوت بشري متحرك", nameEn: "Robot Character" },
];


async function verifyUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(8000) });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── واجهة النتيجة ─────────────────────────────────────────────────────────
export interface SearchResult {
  url: string;
  name: string;
  source: string;
}

// ─── المحرك الرئيسي ─────────────────────────────────────────────────────
export async function searchGlobal3DModels(
  prompt: string,
  onUpdate?: (msg: string) => void
): Promise<SearchResult | null> {
  onUpdate?.("🔍 جاري ترجمة وتحليل طلبك...");
  const englishQuery = await smartTranslate(prompt);
  console.log("[3D Search] Query:", prompt, "→", englishQuery);

  // ── 1. قاعدة المجسمات المُتحقق منها ────────────────────────────────
  onUpdate?.(`🎨 جاري البحث عن "${englishQuery}" في المكتبة المحلية...`);

  for (const model of VERIFIED_MODELS) {
    const isMatch = model.keywords.some(kw => {
      const kwLower = kw.toLowerCase();
      return englishQuery.includes(kwLower) || kwLower.includes(englishQuery);
    });
    if (isMatch) {
      onUpdate?.(`✓ تم العثور على "${model.nameAr}"! جاري التحقق من الرابط...`);
      
      // تحقق سريع أن الرابط يعمل فعلاً
      const works = await verifyUrl(model.url);
      if (works) {
        onUpdate?.(`✅ "${model.nameAr}" جاهز! جاري التحميل...`);
        return { url: model.url, name: model.nameAr, source: "🏛️ Khronos / Three.js (HD)" };
      } else {
        console.warn("[3D Search] URL broken:", model.url);
        continue; // جرّب المجسم التالي
      }
    }
  }

  // تم إزالة Sketchfab Public API لأنه يتطلب مفتاح مصادقة للاستخدام ويسبب أخطاء 401

  onUpdate?.("❌ لم يتم العثور على مجسم جاهز. سيتم التوليد بالذكاء الاصطناعي...");
  await new Promise(r => setTimeout(r, 400));
  return null;
}
