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
