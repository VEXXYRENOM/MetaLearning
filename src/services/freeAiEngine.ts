/**
 * Free AI Engine Service
 * Smart keyword matching + Real AI image search via Lexica.art (no API key needed)
 */

// ─── خريطة الكلمات المفتاحية للمجسمات الجاهزة ───────────────────────────────
export const presetModelsIndex: Record<string, string[]> = {
  pyramid:      ["هرم", "أهرامات", "فراعنة", "مصر", "pyramid", "giza", "pharaoh"],
  colosseum:    ["مدرج", "كولوسيوم", "روما", "colosseum", "rome"],
  carthage:     ["قرطاج", "تونس", "أطلال", "حنبعل", "carthage", "ruins"],
  heart:        ["قلب", "نبض", "دم", "شريان", "heart", "beating", "cardiac"],
  lungs:        ["رئة", "رئتين", "تنفس", "lungs", "breathing"],
  eye:          ["عين", "بصر", "رؤية", "eye", "vision"],
  vocal:        ["حنجرة", "صوت", "vocal", "throat"],
  dna:          ["حمض نووي", "جينات", "dna", "genes", "helix"],
  animal_cell:  ["خلية حيوانية", "cell", "animal cell"],
  plant_cell:   ["خلية نباتية", "plant cell"],
  solar_system: ["كواكب", "مجموعة شمسية", "فضاء", "شمس", "solar system", "planets", "space"],
  volcano:      ["بركان", "حمم", "ماجما", "volcano", "lava"],
  earth_layers: ["طبقات الأرض", "earth layers"],
  water_cycle:  ["دورة المياه", "water cycle"],
  water_molecule: ["جزيء ماء", "h2o"],
  atom:         ["ذرة", "نواة", "إلكترون", "atom", "nucleus"],
  robot:        ["روبوت", "robot", "arm"],
  painting:     ["لوحة", "رسم", "فن", "painting", "art"],
  arabic:       ["حروف", "عربي", "arabic", "letters"],
  pottery:      ["فخار", "طين", "pottery", "clay"],
};

// ─── البحث الذكي عن نموذج جاهز ──────────────────────────────────────────────
export function matchPromptToPresetModel(prompt: string): string | null {
  const normalized = prompt.toLowerCase().trim();
  for (const [id, keywords] of Object.entries(presetModelsIndex)) {
    if (keywords.some(kw => normalized.includes(kw.toLowerCase()))) return id;
  }
  return null;
}

// ─── قاموس ترجمة أساسي + ترجمة ديناميكية مجانية عبر Google Translate API ───
const arabicToEnglish: Record<string, string> = {
  "سيارة": "sports car", "سيارات": "cars", "طيارة": "airplane", "طائرة": "airplane",
  "قطار": "train", "دراجة": "bicycle", "سفينة": "ship", "غواصة": "submarine",
  "منزل": "house", "قصر": "palace", "برج": "skyscraper", "متحف": "museum",
  "شجرة": "tree", "زهرة": "flower", "بحر": "ocean", "جبل": "mountain",
  "نهر": "river", "صحراء": "desert", "غابة": "forest", "كهف": "cave",
  "أسد": "lion", "نمر": "tiger", "فيل": "elephant", "زرافة": "giraffe",
  "حوت": "whale", "قرش": "shark", "ديناصور": "dinosaur",
  "تنين": "dragon", "يونيكورن": "unicorn", "ذئب": "wolf",
  "كمبيوتر": "computer", "هاتف": "smartphone", "ساعة": "watch",
  "كأس": "trophy", "كرة": "soccer", "سيف": "sword",
  "مدينة": "city", "كوكب": "planet", "نجوم": "stars",
  "قلعة": "castle", "معبد": "temple", "جسر": "bridge",
  "دب": "bear", "أخطبوط": "octopus", "فراشة": "butterfly", "عقرب": "scorpion",
};

// ─── خريطة الإيموجي للرسم المحلي (يتحول لمجسم 3D) ─────────────────────────
const keywordToEmoji: Record<string, string> = {
  "car": "🚗", "sports car": "🏎️", "airplane": "✈️", "train": "🚂", "bicycle": "🚲", 
  "ship": "🚢", "submarine": "⛴️", "house": "🏠", "palace": "🏰", "skyscraper": "🏢", 
  "tree": "🌴", "flower": "🌺", "ocean": "🌊", "mountain": "🏔️", "desert": "🏜️", 
  "lion": "🦁", "tiger": "🐯", "elephant": "🐘", "giraffe": "🦒", "whale": "🐋", 
  "shark": "🦈", "dinosaur": "🦖", "dragon": "🐉", "unicorn": "🦄", "wolf": "🐺", 
  "computer": "💻", "smartphone": "📱", "watch": "⌚", "trophy": "🏆", "soccer": "⚽", 
  "sword": "🗡️", "city": "🏙️", "planet": "🌍", "stars": "✨", "castle": "🏰", 
  "temple": "🏛️", "bridge": "🌉", "bear": "🐻", "octopus": "🐙", "butterfly": "🦋", 
  "scorpion": "🦂", "apple": "🍎", "pizza": "🍕", "cake": "🎂", "heart": "❤️",
  "fire": "🔥", "robot": "🤖", "alien": "👽", "ghost": "👻", "rocket": "🚀", "dog": "🐶", "cat": "🐱"
};

async function translatePrompt(prompt: string): Promise<string> {
  let translated = prompt.toLowerCase().trim();
  
  // 1. تحقق من القاموس المحلي السريع
  for (const [ar, en] of Object.entries(arabicToEnglish)) {
    if (translated.includes(ar)) {
      return translated.replace(ar, en);
    }
  }

  // 2. إذا كان النص يحتوي على أحرف عربية ولم نجده، نترجمه فوراً عبر Google Translate مجاناً
  const hasArabic = /[\u0600-\u06FF]/.test(translated);
  if (hasArabic) {
    try {
      const gUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(translated)}`;
      const gRes = await fetch(gUrl);
      if (gRes.ok) {
        const data = await gRes.json();
        if (data && data[0] && data[0][0] && data[0][0][0]) {
          translated = data[0][0][0];
          console.log("[Auto-Translate]", prompt, "->", translated);
        }
      }
    } catch(e) {
      console.warn("Translation failed, proceeding with original", e);
    }
  }

  return translated;
}

// ─── دوال مُصدَّرة لاستخدامها في صفحة Text-to-3D ─────────────────────────
export const translateForCategory = translatePrompt;
export function detectCategory3D(word: string): string {
  const w = word.toLowerCase();
  if (/dog|cat|lion|tiger|bear|wolf|elephant|giraffe|whale|shark|dinosaur|animal|rabbit|fox/.test(w)) return "animal";
  if (/car|truck|vehicle|bus|train|airplane|ship|boat|rocket|bicycle/.test(w)) return "vehicle";
  if (/tree|flower|forest|mountain|ocean|desert|river|nature|grass|jungle/.test(w)) return "nature";
  if (/castle|palace|house|building|bridge|temple|tower|city/.test(w)) return "architecture";
  if (/robot|computer|phone|machine|tech|ai|android|cyber/.test(w)) return "tech";
  if (/heart|atom|dna|cell|brain|science|molecule/.test(w)) return "science";
  if (/dragon|unicorn|alien|ghost|fantasy|wizard|magic/.test(w)) return "fantasy";
  if (/planet|star|space|galaxy|moon|universe|solar/.test(w)) return "space";
  return "abstract";
}

// ─── البحث في Lexica.art باستخدام AllOrigins لتخطي مشكلة الـ CORS ──────────
async function fetchFromLexica(prompt: string): Promise<File> {
  const englishPrompt = await translatePrompt(prompt);
  const searchQuery = `${englishPrompt} 3d render detailed`;

  const targetUrl = `https://lexica.art/api/v1/search?q=${encodeURIComponent(searchQuery)}`;
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;

  const searchRes = await fetch(proxyUrl, { headers: { "Accept": "application/json" } });
  if (!searchRes.ok) throw new Error(`Lexica search failed: ${searchRes.status}`);

  const data = await searchRes.json();
  if (!data.images || data.images.length === 0) throw new Error("No Lexica results");

  const candidates = data.images.slice(0, 5);
  for (const img of candidates) {
    const imgUrl = img.srcSmall || img.src;
    if (!imgUrl) continue;
    try {
      const pUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(imgUrl)}`;
      const imgRes = await fetch(pUrl);
      if (imgRes.ok) {
        const blob = await imgRes.blob();
        if (blob.size > 1000) {
          return new File([blob], "lexica_ai.jpg", { type: "image/jpeg" });
        }
      }
    } catch (_) { continue; }
  }
  throw new Error("Could not fetch any Lexica image");
}

// ─── توليد صورة من Pollinations وتخطي حماية 403 باستخدام AllOrigins ────────
async function fetchFromPollinations(prompt: string): Promise<File> {
  const englishPrompt = await translatePrompt(prompt);
  const seed = Math.floor(Math.random() * 1000000);
  const encoded = encodeURIComponent(`${englishPrompt}, highly detailed 3d render, plain background`);
  
  const targetUrl = `https://image.pollinations.ai/prompt/${encoded}?width=512&height=512&nologo=true&seed=${seed}`;
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;

  const res = await fetch(proxyUrl);
  if (!res.ok) throw new Error(`Pollinations failed: ${res.status}`);
  
  const blob = await res.blob();
  if (blob.size < 1000) throw new Error("Response too small, not an image");
  return new File([blob], "pollinations_ai.jpg", { type: "image/jpeg" });
}

// ─── التوليد المحلي الاحترافي بالـ Canvas ─────────────────────────────────
export function generateLocalImageFromPrompt(prompt: string): Promise<File> {
  return new Promise(async (resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext("2d")!;
    const englishWord = await translatePrompt(prompt);
    const category = detectCategory(englishWord);
    drawScene(ctx, category, englishWord);
    canvas.toBlob((blob) => {
      resolve(new File([blob!], "generated_art.png", { type: "image/png" }));
    }, "image/png");
  });
}

function detectCategory(word: string): string {
  const w = word.toLowerCase();
  if (/dog|cat|lion|tiger|bear|wolf|elephant|giraffe|whale|shark|dinosaur|animal|rabbit|fox/.test(w)) return "animal";
  if (/car|truck|vehicle|bus|train|airplane|ship|boat|rocket|bicycle/.test(w)) return "vehicle";
  if (/tree|flower|forest|mountain|ocean|desert|river|nature|grass|jungle/.test(w)) return "nature";
  if (/castle|palace|house|building|bridge|temple|tower|city/.test(w)) return "architecture";
  if (/robot|computer|phone|machine|tech|ai|android|cyber/.test(w)) return "tech";
  if (/heart|atom|dna|cell|brain|science|molecule/.test(w)) return "science";
  if (/dragon|unicorn|alien|ghost|fantasy|wizard|magic/.test(w)) return "fantasy";
  if (/planet|star|space|galaxy|moon|universe|solar/.test(w)) return "space";
  return "abstract";
}

function drawScene(ctx: CanvasRenderingContext2D, category: string, label: string) {
  const W = 512, H = 512;
  // خلفية بيضاء/فاتحة لتحسين خريطة العمق 3D (الجسم الداكن يبرز للأمام)
  const palettes: Record<string, [string, string, string]> = {
    animal:       ["#fff8f0", "#ffeedd", "#8b4513"],
    vehicle:      ["#f0f5ff", "#ddeeff", "#1144aa"],
    nature:       ["#f0fff0", "#ddfff0", "#1a6a1a"],
    architecture: ["#fffff0", "#fffde0", "#806020"],
    tech:         ["#f0feff", "#d0faff", "#007799"],
    science:      ["#f8f0ff", "#eedcff", "#6600cc"],
    fantasy:      ["#fff0ff", "#ffd0ff", "#880088"],
    space:        ["#e8eeff", "#d0d8ff", "#1122aa"],
    abstract:     ["#f0f0ff", "#e0e0ff", "#4422aa"],
  };
  const [bg1, bg2, accent] = palettes[category] || palettes.abstract;
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, bg1); bgGrad.addColorStop(1, bg2);
  ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, W, H);
  // ظل خفيف دائري في المركز لإعطاء عمق للخلفية
  const glow = ctx.createRadialGradient(W/2, H/2, 30, W/2, H/2, 250);
  glow.addColorStop(0, "rgba(255,255,255,0)");
  glow.addColorStop(1, "rgba(200,200,220,0.5)");
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
  if (category === "animal") drawAnimal(ctx, W, H, accent);
  else if (category === "vehicle") drawVehicle(ctx, W, H, accent);
  else if (category === "nature") drawNature(ctx, W, H, accent);
  else if (category === "architecture") drawArchitecture(ctx, W, H, accent);
  else if (category === "tech") drawTech(ctx, W, H, accent);
  else if (category === "science") drawScience(ctx, W, H, accent);
  else if (category === "space") drawSpace(ctx, W, H, accent);
  else if (category === "fantasy") drawFantasy(ctx, W, H, accent);
  else drawAbstract(ctx, W, H, accent);
  ctx.font = "bold 18px Arial"; ctx.textAlign = "center";
  ctx.fillStyle = accent; ctx.shadowColor = accent + "88"; ctx.shadowBlur = 6;
  ctx.fillText(label.substring(0, 30).toUpperCase(), W/2, H - 18);
  ctx.shadowBlur = 0;
}

function drawAnimal(ctx: CanvasRenderingContext2D, W: number, H: number, accent: string) {
  // أضلع ظل أرضي أولاً
  const shadow = ctx.createRadialGradient(W/2, H-50, 0, W/2, H-50, 120);
  shadow.addColorStop(0, "rgba(100,50,0,0.25)"); shadow.addColorStop(1, "transparent");
  ctx.fillStyle = shadow; ctx.beginPath(); ctx.ellipse(W/2, H-50, 120, 28, 0, 0, Math.PI*2); ctx.fill();

  // جسم - ألوان داكنة تبرز أمام الخلفية البيضاء
  const body = ctx.createRadialGradient(W/2-20, H/2, 20, W/2, H/2+30, 130);
  body.addColorStop(0, "#cd6010"); body.addColorStop(0.5, "#7a3000"); body.addColorStop(1, "#3a1000");
  ctx.fillStyle = body; ctx.beginPath(); ctx.ellipse(W/2, H/2+40, 130, 110, 0, 0, Math.PI*2); ctx.fill();

  // رأس
  const head = ctx.createRadialGradient(W/2-15, H/2-90, 8, W/2, H/2-70, 82);
  head.addColorStop(0, "#dd8040"); head.addColorStop(0.6, "#994020"); head.addColorStop(1, "#3a1000");
  ctx.fillStyle = head; ctx.beginPath(); ctx.ellipse(W/2, H/2-70, 82, 77, -0.1, 0, Math.PI*2); ctx.fill();

  // أذنان
  ctx.fillStyle = "#6a2800";
  ctx.beginPath(); ctx.ellipse(W/2-65, H/2-135, 24, 32, -0.4, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(W/2+65, H/2-135, 24, 32, 0.4, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = "#cc6644";
  ctx.beginPath(); ctx.ellipse(W/2-65, H/2-135, 13, 20, -0.4, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(W/2+65, H/2-135, 13, 20, 0.4, 0, Math.PI*2); ctx.fill();

  // عيون بيضاء مع حدقة سوداء
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(W/2-28, H/2-80, 16, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(W/2+28, H/2-80, 16, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = "#111";
  ctx.beginPath(); ctx.arc(W/2-26, H/2-79, 9, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(W/2+30, H/2-79, 9, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(W/2-22, H/2-83, 4, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(W/2+34, H/2-83, 4, 0, Math.PI*2); ctx.fill();

  // أنف
  ctx.fillStyle = "#331100";
  ctx.beginPath(); ctx.ellipse(W/2, H/2-50, 16, 11, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = "#993322";
  ctx.beginPath(); ctx.ellipse(W/2, H/2-52, 8, 5, 0, 0, Math.PI*2); ctx.fill();

  // فم ابتسامة
  ctx.strokeStyle = "#331100"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(W/2, H/2-36, 18, 0.1, Math.PI-0.1); ctx.stroke();

  // ذيل
  ctx.strokeStyle = "#7a3000"; ctx.lineWidth = 14;
  ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(W/2+120, H/2+60);
  ctx.bezierCurveTo(W/2+190, H/2-10, W/2+170, H/2-90, W/2+125, H/2-75); ctx.stroke();

  // أرجل أمامية
  ctx.fillStyle = "#7a3000";
  ctx.beginPath(); ctx.ellipse(W/2-55, H/2+140, 30, 22, -0.2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(W/2+55, H/2+140, 30, 22, 0.2, 0, Math.PI*2); ctx.fill();
}

function drawVehicle(ctx: CanvasRenderingContext2D, W: number, H: number, accent: string) {
  const cx = W/2, cy = H/2 + 30;
  const body = ctx.createLinearGradient(cx-150, cy-60, cx+150, cy+60);
  body.addColorStop(0, "#4488dd"); body.addColorStop(0.5, "#2255aa"); body.addColorStop(1, "#001133");
  ctx.fillStyle = body;
  ctx.beginPath(); ctx.moveTo(cx-150, cy+40); ctx.lineTo(cx-160, cy); ctx.lineTo(cx-90, cy-60);
  ctx.lineTo(cx+90, cy-60); ctx.lineTo(cx+160, cy); ctx.lineTo(cx+150, cy+40); ctx.closePath(); ctx.fill();
  const roof = ctx.createLinearGradient(cx-80, cy-120, cx+80, cy-60);
  roof.addColorStop(0, "#6699ee"); roof.addColorStop(1, "#2244aa");
  ctx.fillStyle = roof;
  ctx.beginPath(); ctx.moveTo(cx-90, cy-60); ctx.lineTo(cx-60, cy-120); ctx.lineTo(cx+60, cy-120);
  ctx.lineTo(cx+90, cy-60); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "rgba(180,220,255,0.4)";
  ctx.beginPath(); ctx.moveTo(cx-80, cy-62); ctx.lineTo(cx-55, cy-115);
  ctx.lineTo(cx+55, cy-115); ctx.lineTo(cx+80, cy-62); ctx.closePath(); ctx.fill();
  for (const wx of [cx-100, cx+100]) {
    const w = ctx.createRadialGradient(wx-5, cy+42, 5, wx, cy+45, 38);
    w.addColorStop(0, "#555"); w.addColorStop(1, "#111");
    ctx.fillStyle = w; ctx.beginPath(); ctx.arc(wx, cy+45, 38, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "#888"; ctx.beginPath(); ctx.arc(wx, cy+45, 18, 0, Math.PI*2); ctx.fill();
  }
  const hl = ctx.createRadialGradient(cx+150, cy-10, 2, cx+155, cy-10, 15);
  hl.addColorStop(0, "#ffffaa"); hl.addColorStop(1, "transparent");
  ctx.fillStyle = hl; ctx.beginPath(); ctx.arc(cx+155, cy-10, 15, 0, Math.PI*2); ctx.fill();
}

function drawNature(ctx: CanvasRenderingContext2D, W: number, H: number, accent: string) {
  const sky = ctx.createLinearGradient(0, 0, 0, H*0.6);
  sky.addColorStop(0, "#001833"); sky.addColorStop(1, "#004488");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H*0.6);
  for (let i = 0; i < 60; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random()*0.8+0.2})`;
    ctx.beginPath(); ctx.arc(Math.random()*W, Math.random()*H*0.5, Math.random()*1.5+0.5, 0, Math.PI*2); ctx.fill();
  }
  const mt = ctx.createLinearGradient(W/2, H*0.1, W/2, H*0.55);
  mt.addColorStop(0, "#eee"); mt.addColorStop(0.3, "#aaa"); mt.addColorStop(1, "#446644");
  ctx.fillStyle = mt; ctx.beginPath();
  ctx.moveTo(0, H*0.55); ctx.lineTo(W/2, H*0.1); ctx.lineTo(W, H*0.55); ctx.closePath(); ctx.fill();
  const ground = ctx.createLinearGradient(0, H*0.55, 0, H);
  ground.addColorStop(0, "#3a8a3a"); ground.addColorStop(1, "#1a4a1a");
  ctx.fillStyle = ground; ctx.fillRect(0, H*0.55, W, H*0.45);
  ctx.fillStyle = "#5a3010"; ctx.fillRect(W/2-15, H*0.45, 30, H*0.35);
  const leaves = ctx.createRadialGradient(W/2, H*0.32, 10, W/2, H*0.35, 90);
  leaves.addColorStop(0, "#44cc44"); leaves.addColorStop(1, "#227722");
  ctx.fillStyle = leaves;
  ctx.beginPath(); ctx.arc(W/2, H*0.35, 90, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(W/2-50, H*0.42, 60, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(W/2+50, H*0.42, 60, 0, Math.PI*2); ctx.fill();
}

function drawArchitecture(ctx: CanvasRenderingContext2D, W: number, H: number, accent: string) {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#000011"); sky.addColorStop(1, "#001133");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  const wall = ctx.createLinearGradient(W/2-100, 0, W/2+100, 0);
  wall.addColorStop(0, "#c0a060"); wall.addColorStop(0.5, "#e8c878"); wall.addColorStop(1, "#806830");
  ctx.fillStyle = wall; ctx.fillRect(W/2-100, H*0.25, 200, H*0.65);
  ctx.fillStyle = "#d4b060"; ctx.fillRect(W/2-40, H*0.1, 80, H*0.8);
  const dome = ctx.createRadialGradient(W/2-10, H*0.07, 5, W/2, H*0.1, 50);
  dome.addColorStop(0, "#f0d080"); dome.addColorStop(1, "#806020");
  ctx.fillStyle = dome; ctx.beginPath(); ctx.arc(W/2, H*0.1, 50, Math.PI, 0); ctx.fill();
  ctx.fillStyle = "rgba(255, 220, 100, 0.8)";
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      ctx.fillRect(W/2-80 + col*65, H*0.33 + row*70, 25, 35);
    }
  }
}

function drawTech(ctx: CanvasRenderingContext2D, W: number, H: number, accent: string) {
  ctx.strokeStyle = accent + "33"; ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  const body = ctx.createLinearGradient(W/2-70, H/2-80, W/2+70, H/2+80);
  body.addColorStop(0, "#224466"); body.addColorStop(1, "#001122");
  ctx.fillStyle = body;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(W/2-70, H/2-60, 140, 120, 15);
  else ctx.rect(W/2-70, H/2-60, 140, 120);
  ctx.fill();
  ctx.fillStyle = accent + "88";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(W/2-55, H/2-45, 110, 80, 8);
  else ctx.rect(W/2-55, H/2-45, 110, 80);
  ctx.fill();
  ctx.shadowColor = accent; ctx.shadowBlur = 20; ctx.fillStyle = accent;
  ctx.beginPath(); ctx.arc(W/2-22, H/2-20, 12, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(W/2+22, H/2-20, 12, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#224466";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(W/2-50, H/2-120, 100, 60, 10);
  else ctx.rect(W/2-50, H/2-120, 100, 60);
  ctx.fill();
  ctx.fillStyle = accent + "aa"; ctx.beginPath(); ctx.arc(W/2, H/2-90, 18, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = "#1a3355";
  ctx.fillRect(W/2-50, H/2+60, 40, 80); ctx.fillRect(W/2+10, H/2+60, 40, 80);
}

function drawScience(ctx: CanvasRenderingContext2D, W: number, H: number, accent: string) {
  const cx = W/2, cy = H/2;
  const nucleus = ctx.createRadialGradient(cx-8, cy-8, 5, cx, cy, 40);
  nucleus.addColorStop(0, "#ffaaff"); nucleus.addColorStop(1, accent);
  ctx.fillStyle = nucleus; ctx.beginPath(); ctx.arc(cx, cy, 40, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = accent + "77"; ctx.lineWidth = 2;
  for (let angle = 0; angle < Math.PI; angle += Math.PI/3) {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle);
    ctx.beginPath(); ctx.ellipse(0, 0, 150, 55, 0, 0, Math.PI*2); ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.shadowColor = accent; ctx.shadowBlur = 15;
    ctx.beginPath(); ctx.arc(150*Math.cos(1.2), 55*Math.sin(1.2), 8, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0; ctx.restore();
  }
}

function drawSpace(ctx: CanvasRenderingContext2D, W: number, H: number, accent: string) {
  for (let i = 0; i < 150; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random()*0.9+0.1})`;
    ctx.beginPath(); ctx.arc(Math.random()*W, Math.random()*H, Math.random()*1.5+0.3, 0, Math.PI*2); ctx.fill();
  }
  const planet = ctx.createRadialGradient(W/2-40, H/2-40, 20, W/2, H/2, 130);
  planet.addColorStop(0, "#66aaff"); planet.addColorStop(0.5, "#2244aa"); planet.addColorStop(1, "#000033");
  ctx.fillStyle = planet; ctx.beginPath(); ctx.arc(W/2, H/2, 130, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = "rgba(180,160,100,0.7)"; ctx.lineWidth = 18;
  ctx.beginPath(); ctx.ellipse(W/2, H/2, 200, 60, -0.3, 0, Math.PI*2); ctx.stroke();
  const moon = ctx.createRadialGradient(W/2+170, H/2-130, 5, W/2+175, H/2-135, 30);
  moon.addColorStop(0, "#eee"); moon.addColorStop(1, "#888");
  ctx.fillStyle = moon; ctx.beginPath(); ctx.arc(W/2+175, H/2-135, 30, 0, Math.PI*2); ctx.fill();
}

function drawFantasy(ctx: CanvasRenderingContext2D, W: number, H: number, accent: string) {
  const sky = ctx.createLinearGradient(0, 0, W, H);
  sky.addColorStop(0, "#0a0020"); sky.addColorStop(1, "#200040");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  ctx.shadowColor = accent; ctx.shadowBlur = 30;
  const body = ctx.createRadialGradient(W/2, H/2, 10, W/2, H/2, 120);
  body.addColorStop(0, "#dd00ff"); body.addColorStop(0.6, "#880099"); body.addColorStop(1, "#220033");
  ctx.fillStyle = body;
  ctx.beginPath(); ctx.moveTo(W/2, H/2-120);
  ctx.bezierCurveTo(W/2+80, H/2-80, W/2+120, H/2, W/2+80, H/2+120);
  ctx.bezierCurveTo(W/2+40, H/2+160, W/2-40, H/2+160, W/2-80, H/2+120);
  ctx.bezierCurveTo(W/2-120, H/2, W/2-80, H/2-80, W/2, H/2-120); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#cc00ee55";
  ctx.beginPath(); ctx.moveTo(W/2-80, H/2);
  ctx.bezierCurveTo(20, H/2-100, 30, H*0.1, W/2-40, H/2-60); ctx.fill();
  ctx.beginPath(); ctx.moveTo(W/2+80, H/2);
  ctx.bezierCurveTo(W-20, H/2-100, W-30, H*0.1, W/2+40, H/2-60); ctx.fill();
}

function drawAbstract(ctx: CanvasRenderingContext2D, W: number, H: number, accent: string) {
  for (let i = 0; i < 8; i++) {
    const hue = (i * 43) % 360;
    ctx.fillStyle = `hsla(${hue}, 70%, 50%, 0.15)`;
    ctx.strokeStyle = `hsla(${hue}, 90%, 70%, 0.5)`;
    ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(W/2, H/2, 80 + i*25, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  }
  const poly = ctx.createRadialGradient(W/2-20, H/2-20, 10, W/2, H/2, 70);
  poly.addColorStop(0, accent); poly.addColorStop(1, accent + "22");
  ctx.fillStyle = poly; ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i/6)*Math.PI*2 - Math.PI/6;
    const x = W/2 + Math.cos(a)*70, y = H/2 + Math.sin(a)*70;
    i === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
  }
  ctx.closePath(); ctx.fill();
}


// ─── التوليد الذكي المتعدد المحاولات ─────────────────────────────────────────
export async function generateAIImageFromPrompt(
  prompt: string,
  onStatus?: (msg: string) => void
): Promise<File> {
  // المحاولة 1: Pollinations مباشر (يعمل في الإنتاج)
  try {
    onStatus?.("🤖 جاري الاتصال بـ Pollinations AI...");
    return await fetchFromPollinations(prompt);
  } catch (e) {
    console.warn("[TextTo3D] Pollinations failed:", e);
  }

  // المحاولة 2: Lexica.art (قاعدة صور AI ضخمة)
  try {
    onStatus?.("🔍 جاري البحث في مكتبة Lexica AI...");
    return await fetchFromLexica(prompt);
  } catch (e) {
    console.warn("[TextTo3D] Lexica failed:", e);
  }

  // المحاولة 3: Canvas محلي (دائماً يعمل)
  onStatus?.("⚡ جاري التوليد المحلي...");
  return generateLocalImageFromPrompt(prompt);
}
