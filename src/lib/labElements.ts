/**
 * Lab Elements — Stoichiometric Chemical Engine
 * for the Interactive Physics & Chemistry Lab.
 */

export type LabCategory = "element" | "compound" | "equipment";
export type ReactionEffect = "explosion" | "neutralization" | "oxidation" | "dissolution" | "combustion";
export type MatterState = "s" | "l" | "g" | "aq";

export interface LabElement {
  id: string;             // e.g., "Na", "H2O"
  name: string;
  nameAr: string;
  nameFr: string;
  emoji: string;
  category: LabCategory;
  state: MatterState;
  molarMass: number;      // g/mol
  density?: number;       // g/mL (required for liquids/aq to convert volume to mass)
  color: string;          // base 3D material color
  emissive: string;       // glow color
  description: string;
  descriptionAr: string;
}

export interface ReactionStoichiometry {
  reactants: Record<string, number>; // { "Na": 2, "H2O": 2 }  (molar coefficients)
  products: Record<string, number>;  // { "NaOH": 2, "H2": 1 }
  effect: ReactionEffect;
  resultColor: string;
  smokeColor: string;
  hasSmoke: boolean;
  hasBubbles: boolean;
  hasExplosion: boolean;
  heat: number;
  xpReward: number;
  labelEn: string;
  labelAr: string;
}

// ─── Elements & Equipment ────────────────────────────────────
export const LAB_ELEMENTS: LabElement[] = [
  {
    id: "Na", name: "Sodium", nameAr: "صوديوم", nameFr: "Sodium",
    emoji: "🔵", category: "element", state: "s",
    molarMass: 22.99, density: 0.97,
    color: "#7dd3fc", emissive: "#3b82f6",
    description: "Alkali metal — reacts violently with water",
    descriptionAr: "معدن قلوي — يتفاعل بعنف مع الماء",
  },
  {
    id: "Mg", name: "Magnesium", nameAr: "مغنيسيوم", nameFr: "Magnésium",
    emoji: "⚪", category: "element", state: "s",
    molarMass: 24.30, density: 1.74,
    color: "#e2e8f0", emissive: "#94a3b8",
    description: "Burns with a brilliant white flame",
    descriptionAr: "يحترق بلهب أبيض ساطع",
  },
  {
    id: "Fe", name: "Iron", nameAr: "حديد", nameFr: "Fer",
    emoji: "🟤", category: "element", state: "s",
    molarMass: 55.85, density: 7.87,
    color: "#78716c", emissive: "#44403c",
    description: "Common metal — rusts when exposed to oxygen",
    descriptionAr: "معدن شائع — يصدأ عند تعرضه للأكسجين",
  },
  {
    id: "Cu", name: "Copper", nameAr: "نحاس", nameFr: "Cuivre",
    emoji: "🟠", category: "element", state: "s",
    molarMass: 63.55, density: 8.96,
    color: "#b45309", emissive: "#92400e",
    description: "Reddish metal — excellent conductor",
    descriptionAr: "معدن أحمر — موصل ممتاز للكهرباء",
  },
  // Compounds
  {
    id: "H2O", name: "Water", nameAr: "ماء", nameFr: "Eau",
    emoji: "💧", category: "compound", state: "l",
    molarMass: 18.015, density: 1.0,
    color: "#38bdf8", emissive: "#0284c7",
    description: "Universal solvent",
    descriptionAr: "المذيب الكوني",
  },
  {
    id: "K", name: "Potassium", nameAr: "بوتاسيوم", nameFr: "Potassium",
    emoji: "🟣", category: "element", state: "s",
    molarMass: 39.10, density: 0.86,
    color: "#c084fc", emissive: "#9333ea",
    description: "Highly reactive alkali metal (Lilac flame)",
    descriptionAr: "معدن قلوي شديد التفاعل (لهب أرجواني)",
  },
  {
    id: "Zn", name: "Zinc", nameAr: "زنك", nameFr: "Zinc",
    emoji: "🪙", category: "element", state: "s",
    molarMass: 65.38, density: 7.14,
    color: "#94a3b8", emissive: "#64748b",
    description: "Transition metal, reacts with acids",
    descriptionAr: "معدن انتقالي، يتفاعل مع الأحماض",
  },
  {
    id: "CaCO3", name: "Calcium Carbonate", nameAr: "كربونات الكالسيوم", nameFr: "Carbonate de calcium",
    emoji: "🪨", category: "compound", state: "s",
    molarMass: 100.09, density: 2.71,
    color: "#f8fafc", emissive: "#e2e8f0",
    description: "Chalk/Limestone. Produces CO2 with acids",
    descriptionAr: "طبشور/حجر جيري. ينتج ثاني أكسيد الكربون مع الأحماض",
  },
  {
    id: "CuSO4", name: "Copper(II) Sulfate", nameAr: "كبريتات النحاس", nameFr: "Sulfate de cuivre",
    emoji: "🔷", category: "compound", state: "aq",
    molarMass: 159.61, density: 1.15,
    color: "#3b82f6", emissive: "#2563eb",
    description: "Bright blue solution",
    descriptionAr: "محلول أزرق ساطع",
  },
  {
    id: "H2SO4", name: "Sulfuric Acid (1M)", nameAr: "حمض الكبريتيك", nameFr: "Acide sulfurique",
    emoji: "🧪", category: "compound", state: "aq",
    molarMass: 98.08, density: 1.06,
    color: "#fef08a", emissive: "#ca8a04",
    description: "Strong mineral acid",
    descriptionAr: "حمض معدني قوي",
  },
  {
    id: "HCl", name: "Hydrochloric Acid (1M)", nameAr: "حمض كلوريدريك", nameFr: "Acide chlorhydrique",
    emoji: "🟡", category: "compound", state: "aq",
    molarMass: 36.46, density: 1.02, // approx 1M density
    color: "#fef08a", emissive: "#ca8a04",
    description: "Strong acid — dissolves many metals",
    descriptionAr: "حمض قوي — يذيب كثيراً من المعادن",
  },
  {
    id: "NaOH", name: "Sodium Hydroxide (1M)", nameAr: "هيدروكسيد الصوديوم", nameFr: "Hydroxyde de sodium",
    emoji: "🟣", category: "compound", state: "aq",
    molarMass: 40.00, density: 1.04, // approx 1M density
    color: "#a855f7", emissive: "#7c3aed",
    description: "Strong base — used in soap making",
    descriptionAr: "قاعدة قوية — تُستخدم في صنع الصابون",
  },
  {
    id: "H2O2", name: "Hydrogen Peroxide (30%)", nameAr: "فوق أكسيد الهيدروجين", nameFr: "Peroxyde d'hydrogène",
    emoji: "🔴", category: "compound", state: "aq",
    molarMass: 34.01, density: 1.11,
    color: "#fca5a5", emissive: "#ef4444",
    description: "Oxidizer — decomposes releasing oxygen",
    descriptionAr: "عامل مؤكسد — يتحلل محرراً الأكسجين",
  },
  // Equipment
  {
    id: "BunsenBurner", name: "Bunsen Burner", nameAr: "موقد بنزن", nameFr: "Bec Bunsen",
    emoji: "🔥", category: "equipment", state: "s",
    molarMass: 1, color: "#94a3b8", emissive: "#000000",
    description: "Heating device to accelerate reactions",
    descriptionAr: "جهاز تسخين لتسريع التفاعلات الكيميائية",
  },
  // We need products too, even if not draggable, they exist in the beaker.
  {
    id: "H2", name: "Hydrogen Gas", nameAr: "غاز الهيدروجين", nameFr: "Gaz Hydrogène",
    emoji: "💨", category: "compound", state: "g",
    molarMass: 2.02,
    color: "#ffffff", emissive: "#ffffff",
    description: "Highly flammable gas",
    descriptionAr: "غاز شديد الاشتعال",
  },
  {
    id: "NaCl", name: "Salt Water", nameAr: "ماء مالح", nameFr: "Eau salée",
    emoji: "🧂", category: "compound", state: "aq",
    molarMass: 58.44, density: 1.03,
    color: "#ccfbf1", emissive: "#5eead4",
    description: "Salt dissolved in water",
    descriptionAr: "ملح مذاب في الماء",
  },
  {
    id: "KOH", name: "Potassium Hydroxide", nameAr: "هيدروكسيد البوتاسيوم", nameFr: "Hydroxyde de potassium",
    emoji: "🧪", category: "compound", state: "aq",
    molarMass: 56.11, density: 1.05,
    color: "#e9d5ff", emissive: "#d8b4e2",
    description: "Strong base from Potassium reaction",
    descriptionAr: "قاعدة قوية ناتجة عن تفاعل البوتاسيوم",
  },
  {
    id: "CO2", name: "Carbon Dioxide Gas", nameAr: "غاز ثاني أكسيد الكربون", nameFr: "Dioxyde de carbone",
    emoji: "🫧", category: "compound", state: "g",
    molarMass: 44.01,
    color: "#ffffff", emissive: "#ffffff",
    description: "Invisible gas bubbles",
    descriptionAr: "فقاعات غاز غير مرئية",
  },
  {
    id: "CaCl2", name: "Calcium Chloride", nameAr: "كلوريد الكالسيوم", nameFr: "Chlorure de calcium",
    emoji: "🧪", category: "compound", state: "aq",
    molarMass: 110.98, density: 1.10,
    color: "#f1f5f9", emissive: "#e2e8f0",
    description: "Dissolved calcium salt",
    descriptionAr: "ملح كالسيوم مذاب",
  },
  {
    id: "ZnCl2", name: "Zinc Chloride", nameAr: "كلوريد الزنك", nameFr: "Chlorure de zinc",
    emoji: "🧪", category: "compound", state: "aq",
    molarMass: 136.30, density: 1.15,
    color: "#f8fafc", emissive: "#e2e8f0",
    description: "Dissolved zinc salt",
    descriptionAr: "ملح زنك مذاب",
  },
  {
    id: "FeSO4", name: "Iron(II) Sulfate", nameAr: "كبريتات الحديد", nameFr: "Sulfate de fer",
    emoji: "🧪", category: "compound", state: "aq",
    molarMass: 151.91, density: 1.08,
    color: "#86efac", emissive: "#4ade80",
    description: "Pale green solution",
    descriptionAr: "محلول أخضر شاحب",
  },
];

// ─── Balanced Chemical Equations ──────────────────────────────
export const STOICHIOMETRIC_REACTIONS: ReactionStoichiometry[] = [
  {
    // 2Na + 2H2O -> 2NaOH + H2
    reactants: { "Na": 2, "H2O": 2 },
    products: { "NaOH": 2, "H2": 1 },
    effect: "explosion",
    resultColor: "#ff6600",
    smokeColor: "#9ca3af",
    hasSmoke: true, hasBubbles: true, hasExplosion: true,
    heat: 90, xpReward: 30,
    labelEn: "2Na(s) + 2H₂O(l) → 2NaOH(aq) + H₂(g) (Explosive!)",
    labelAr: "الصوديوم يتفاعل مع الماء → هيدروكسيد الصوديوم + غاز الهيدروجين (انفجاري!)",
  },
  {
    // HCl + NaOH -> NaCl + H2O
    reactants: { "HCl": 1, "NaOH": 1 },
    products: { "NaCl": 1, "H2O": 1 },
    effect: "neutralization",
    resultColor: "#22c55e",
    smokeColor: "#86efac",
    hasSmoke: false, hasBubbles: true, hasExplosion: false,
    heat: 20, xpReward: 20,
    labelEn: "HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l) (Neutralization)",
    labelAr: "حمض + قاعدة → ملح + ماء (تعادل)",
  },
  {
    // 2K + 2H2O -> 2KOH + H2
    reactants: { "K": 2, "H2O": 2 },
    products: { "KOH": 2, "H2": 1 },
    effect: "explosion",
    resultColor: "#d8b4e2",
    smokeColor: "#c084fc",
    hasSmoke: true, hasBubbles: true, hasExplosion: true,
    heat: 100, xpReward: 40,
    labelEn: "2K(s) + 2H₂O(l) → 2KOH(aq) + H₂(g) (Violent Lilac Explosion!)",
    labelAr: "البوتاسيوم يتفاعل مع الماء → هيدروكسيد البوتاسيوم + هيدروجين (انفجار بنفسجي!)",
  },
  {
    // Zn + 2HCl -> ZnCl2 + H2
    reactants: { "Zn": 1, "HCl": 2 },
    products: { "ZnCl2": 1, "H2": 1 },
    effect: "dissolution",
    resultColor: "#f1f5f9",
    smokeColor: "#cbd5e1",
    hasSmoke: false, hasBubbles: true, hasExplosion: false,
    heat: 30, xpReward: 25,
    labelEn: "Zn(s) + 2HCl(aq) → ZnCl₂(aq) + H₂(g) (Vigorous Bubbling)",
    labelAr: "الزنك يتفاعل مع الحمض → كلوريد الزنك + غاز الهيدروجين (فقاعات قوية)",
  },
  {
    // CaCO3 + 2HCl -> CaCl2 + H2O + CO2
    reactants: { "CaCO3": 1, "HCl": 2 },
    products: { "CaCl2": 1, "H2O": 1, "CO2": 1 },
    effect: "dissolution",
    resultColor: "#f8fafc",
    smokeColor: "#ffffff",
    hasSmoke: false, hasBubbles: true, hasExplosion: false,
    heat: 10, xpReward: 25,
    labelEn: "CaCO₃(s) + 2HCl(aq) → CaCl₂(aq) + H₂O(l) + CO₂(g)",
    labelAr: "كربونات الكالسيوم + الحمض → كلوريد الكالسيوم + ماء + غاز CO2",
  },
  {
    // Fe + CuSO4 -> FeSO4 + Cu
    reactants: { "Fe": 1, "CuSO4": 1 },
    products: { "FeSO4": 1, "Cu": 1 },
    effect: "oxidation",
    resultColor: "#86efac", // turns from blue to pale green
    smokeColor: "#4ade80",
    hasSmoke: false, hasBubbles: false, hasExplosion: false,
    heat: 20, xpReward: 35,
    labelEn: "Fe(s) + CuSO₄(aq) → FeSO₄(aq) + Cu(s) (Single Replacement)",
    labelAr: "الحديد يحل محل النحاس في المحلول (تغير اللون من أزرق إلى أخضر)",
  },
];

// ─── Engine Helpers ──────────────────────────────────────────
export function getElementById(id: string): LabElement | undefined {
  return LAB_ELEMENTS.find(e => e.id === id);
}

export const ELEMENTS_ONLY  = LAB_ELEMENTS.filter(e => e.category !== "equipment" && e.state !== "g" && e.id !== "NaCl");
export const EQUIPMENT_ONLY = LAB_ELEMENTS.filter(e => e.category === "equipment");

/**
 * Represents an amount of a substance in the beaker.
 */
export interface BeakerSubstance {
  elementId: string;
  moles: number;
  mass: number;     // g
  volume?: number;  // mL (if applicable)
}

/**
 * Calculates the total volume in mL of all substances in the beaker.
 */
export function calculateTotalVolume(substances: BeakerSubstance[]): number {
  return substances.reduce((total, sub) => {
    const el = getElementById(sub.elementId);
    if (!el) return total;
    if (el.state === "s") return total; // Assume solids take negligible volume for now, or use density
    if (el.state === "g") return total; // Gases escape
    // Calculate volume: V = m / d
    const density = el.density || 1.0;
    return total + (sub.mass / density);
  }, 0);
}

/**
 * Calculates the resulting color of a mixture.
 */
export function calculateMixtureColor(substances: BeakerSubstance[]): string {
  if (substances.length === 0) return "#ffffff";
  
  // Very simplistic color mixing based on mole fraction (just for visuals)
  // In reality, this would be highly complex.
  const totalMoles = substances.reduce((sum, s) => sum + s.moles, 0);
  
  // Find the dominant substance (or just use the highest mole fraction)
  const sorted = [...substances].sort((a, b) => b.moles - a.moles);
  const dominant = getElementById(sorted[0].elementId);
  return dominant ? dominant.color : "#ffffff";
}
