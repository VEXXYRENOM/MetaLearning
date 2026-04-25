/**
 * Lab Elements — Chemical elements, compounds, and equipment
 * for the Interactive Physics & Chemistry Lab.
 */

export type LabCategory = "element" | "compound" | "equipment";
export type ReactionEffect = "explosion" | "neutralization" | "oxidation" | "dissolution" | "combustion";

export interface LabElement {
  id: string;
  name: string;
  nameAr: string;
  nameFr: string;
  emoji: string;
  category: LabCategory;
  color: string;          // base 3D material color
  emissive: string;       // glow color
  mass: number;           // physics mass (0 = static)
  radius: number;         // sphere radius in 3D units
  metalness: number;
  roughness: number;
  description: string;
  descriptionAr: string;
}

export interface Reaction {
  effect: ReactionEffect;
  resultColor: string;
  smokeColor: string;
  hasSmoke: boolean;
  hasBubbles: boolean;
  hasExplosion: boolean;
  heat: number;           // 0-100 intensity
  xpReward: number;
  labelEn: string;
  labelAr: string;
}

// ─── Elements & Equipment ────────────────────────────────────
export const LAB_ELEMENTS: LabElement[] = [
  // Chemical elements
  {
    id: "Na", name: "Sodium", nameAr: "صوديوم", nameFr: "Sodium",
    emoji: "🔵", category: "element",
    color: "#7dd3fc", emissive: "#3b82f6",
    mass: 1, radius: 0.3, metalness: 0.9, roughness: 0.1,
    description: "Alkali metal — reacts violently with water",
    descriptionAr: "معدن قلوي — يتفاعل بعنف مع الماء",
  },
  {
    id: "Mg", name: "Magnesium", nameAr: "مغنيسيوم", nameFr: "Magnésium",
    emoji: "⚪", category: "element",
    color: "#e2e8f0", emissive: "#94a3b8",
    mass: 1, radius: 0.28, metalness: 0.95, roughness: 0.05,
    description: "Burns with a brilliant white flame",
    descriptionAr: "يحترق بلهب أبيض ساطع",
  },
  {
    id: "Fe", name: "Iron", nameAr: "حديد", nameFr: "Fer",
    emoji: "🟤", category: "element",
    color: "#78716c", emissive: "#44403c",
    mass: 2, radius: 0.35, metalness: 1.0, roughness: 0.3,
    description: "Common metal — rusts when exposed to oxygen",
    descriptionAr: "معدن شائع — يصدأ عند تعرضه للأكسجين",
  },
  {
    id: "Cu", name: "Copper", nameAr: "نحاس", nameFr: "Cuivre",
    emoji: "🟠", category: "element",
    color: "#b45309", emissive: "#92400e",
    mass: 1.5, radius: 0.3, metalness: 1.0, roughness: 0.2,
    description: "Reddish metal — excellent conductor",
    descriptionAr: "معدن أحمر — موصل ممتاز للكهرباء",
  },
  // Compounds
  {
    id: "H2O", name: "Water", nameAr: "ماء", nameFr: "Eau",
    emoji: "💧", category: "compound",
    color: "#38bdf8", emissive: "#0284c7",
    mass: 0.5, radius: 0.25, metalness: 0.0, roughness: 0.0,
    description: "Universal solvent",
    descriptionAr: "المذيب الكوني",
  },
  {
    id: "HCl", name: "Hydrochloric Acid", nameAr: "حمض كلوريدريك", nameFr: "Acide chlorhydrique",
    emoji: "🟡", category: "compound",
    color: "#fef08a", emissive: "#ca8a04",
    mass: 0.8, radius: 0.28, metalness: 0.0, roughness: 0.6,
    description: "Strong acid — dissolves many metals",
    descriptionAr: "حمض قوي — يذيب كثيراً من المعادن",
  },
  {
    id: "NaOH", name: "Sodium Hydroxide", nameAr: "هيدروكسيد الصوديوم", nameFr: "Hydroxyde de sodium",
    emoji: "🟣", category: "compound",
    color: "#a855f7", emissive: "#7c3aed",
    mass: 1.2, radius: 0.3, metalness: 0.0, roughness: 0.7,
    description: "Strong base — used in soap making",
    descriptionAr: "قاعدة قوية — تُستخدم في صنع الصابون",
  },
  {
    id: "H2O2", name: "Hydrogen Peroxide", nameAr: "فوق أكسيد الهيدروجين", nameFr: "Peroxyde d'hydrogène",
    emoji: "🔴", category: "compound",
    color: "#fca5a5", emissive: "#ef4444",
    mass: 0.6, radius: 0.25, metalness: 0.0, roughness: 0.5,
    description: "Oxidizer — decomposes releasing oxygen",
    descriptionAr: "عامل مؤكسد — يتحلل محرراً الأكسجين",
  },
  // Equipment
  {
    id: "beaker", name: "Beaker", nameAr: "كأس تدريجي", nameFr: "Bécher",
    emoji: "🧪", category: "equipment",
    color: "#e0f2fe", emissive: "#0ea5e9",
    mass: 0, radius: 0.6, metalness: 0.0, roughness: 0.0,
    description: "Glass container for mixing chemicals",
    descriptionAr: "وعاء زجاجي لخلط المواد الكيميائية",
  },
  {
    id: "burner", name: "Bunsen Burner", nameAr: "موقد بنزن", nameFr: "Bec Bunsen",
    emoji: "🔥", category: "equipment",
    color: "#f97316", emissive: "#ea580c",
    mass: 0, radius: 0.4, metalness: 0.6, roughness: 0.4,
    description: "Gas burner for heating reactions",
    descriptionAr: "موقد غازي لتسخين التفاعلات",
  },
];

// ─── Reactions Map ───────────────────────────────────────────
// Key: `${elementA}_${elementB}` (order-independent — check both)
export const REACTIONS: Record<string, Reaction> = {
  "Na_H2O": {
    effect: "explosion",
    resultColor: "#ff6600",
    smokeColor: "#9ca3af",
    hasSmoke: true, hasBubbles: true, hasExplosion: true,
    heat: 90, xpReward: 30,
    labelEn: "Sodium reacts with water → NaOH + H₂ gas (explosive!)",
    labelAr: "الصوديوم يتفاعل مع الماء → هيدروكسيد الصوديوم + غاز الهيدروجين (انفجاري!)",
  },
  "HCl_NaOH": {
    effect: "neutralization",
    resultColor: "#22c55e",
    smokeColor: "#86efac",
    hasSmoke: false, hasBubbles: true, hasExplosion: false,
    heat: 20, xpReward: 20,
    labelEn: "Acid + Base → Salt + Water (neutralization)",
    labelAr: "حمض + قاعدة → ملح + ماء (تعادل)",
  },
  "Fe_HCl": {
    effect: "dissolution",
    resultColor: "#10b981",
    smokeColor: "#6ee7b7",
    hasSmoke: false, hasBubbles: true, hasExplosion: false,
    heat: 30, xpReward: 20,
    labelEn: "Iron + HCl → FeCl₂ + H₂ (bubbles!)",
    labelAr: "حديد + HCl → كلوريد الحديد + هيدروجين (فقاعات!)",
  },
  "Mg_H2O": {
    effect: "oxidation",
    resultColor: "#f0f9ff",
    smokeColor: "#e0f2fe",
    hasSmoke: true, hasBubbles: true, hasExplosion: false,
    heat: 50, xpReward: 20,
    labelEn: "Magnesium reacts with water → Mg(OH)₂ + H₂",
    labelAr: "المغنيسيوم يتفاعل مع الماء → هيدروكسيد المغنيسيوم + هيدروجين",
  },
  "Mg_H2O2": {
    effect: "combustion",
    resultColor: "#fbbf24",
    smokeColor: "#fde68a",
    hasSmoke: true, hasBubbles: false, hasExplosion: true,
    heat: 80, xpReward: 35,
    labelEn: "Mg + H₂O₂ → combustion reaction",
    labelAr: "مغنيسيوم + فوق أكسيد الهيدروجين → تفاعل احتراق",
  },
  "Cu_HCl": {
    effect: "dissolution",
    resultColor: "#06b6d4",
    smokeColor: "#cffafe",
    hasSmoke: false, hasBubbles: true, hasExplosion: false,
    heat: 15, xpReward: 15,
    labelEn: "Copper doesn't react with HCl (no reaction)",
    labelAr: "النحاس لا يتفاعل مع HCl (لا تفاعل)",
  },
};

// ─── Helpers ─────────────────────────────────────────────────
export function getReaction(idA: string, idB: string): Reaction | null {
  return REACTIONS[`${idA}_${idB}`] ?? REACTIONS[`${idB}_${idA}`] ?? null;
}

export function getElementById(id: string): LabElement | undefined {
  return LAB_ELEMENTS.find(e => e.id === id);
}

export const ELEMENTS_ONLY  = LAB_ELEMENTS.filter(e => e.category !== "equipment");
export const EQUIPMENT_ONLY = LAB_ELEMENTS.filter(e => e.category === "equipment");
