/**
 * Lab AI Service
 * Bridges the live beaker state to the /api/lab-ai endpoint.
 * Converts internal element IDs to human-readable names for the AI prompt.
 */

export interface LabSubstanceForAI {
  elementId: string;
  name: string;
  moles: number;
  mass: number;
}

export interface LabContextForAI {
  substances: LabSubstanceForAI[];
  temperature: number;
  isBoiling: boolean;
  burnerOn: boolean;
  hasStirrer: boolean;
  litmusColor?: string;
}

export interface LabAIResponse {
  answer: string;
  contextUsed?: { substanceCount: number; temperature: number };
  fallback?: boolean;
}

const ELEMENT_NAMES: Record<string, string> = {
  Na: 'Sodium', Mg: 'Magnesium', Fe: 'Iron', Cu: 'Copper',
  H2O: 'Water', K: 'Potassium', Zn: 'Zinc', CaCO3: 'Calcium Carbonate',
  CuSO4: 'Copper(II) Sulfate', HCl: 'Hydrochloric Acid',
  NaOH: 'Sodium Hydroxide', H2SO4: 'Sulfuric Acid', KOH: 'Potassium Hydroxide',
  H2O2: 'Hydrogen Peroxide', NaCl: 'Sodium Chloride', CaO: 'Calcium Oxide',
  NaHCO3: 'Sodium Bicarbonate', FeSO4: 'Iron(II) Sulfate',
  CO2: 'Carbon Dioxide', H2: 'Hydrogen Gas', O2: 'Oxygen Gas',
};

export function buildLabContext(
  substances: { elementId: string; moles: number; mass: number }[],
  temperature: number,
  isBoiling: boolean,
  burnerOn: boolean,
  hasStirrer: boolean,
  litmusColor?: string
): LabContextForAI {
  return {
    substances: substances.map(s => ({
      elementId: s.elementId,
      name: ELEMENT_NAMES[s.elementId] || s.elementId,
      moles: s.moles,
      mass: s.mass,
    })),
    temperature,
    isBoiling,
    burnerOn,
    hasStirrer,
    litmusColor,
  };
}

const IS_DEV = typeof window !== 'undefined' && window.location.hostname === 'localhost';

export async function askLabAI(
  question: string,
  context: LabContextForAI
): Promise<LabAIResponse> {
  const endpoint = IS_DEV ? 'http://localhost:3000/api/lab-ai' : '/api/lab-ai';

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, labContext: context }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[LabAI] API call failed, using local fallback:', err);
    return generateFallbackResponse(question, context);
  }
}

/** Rule-based fallback for offline/error states */
function generateFallbackResponse(question: string, ctx: LabContextForAI): LabAIResponse {
  const lq = question.toLowerCase();
  const { substances, temperature, isBoiling, burnerOn } = ctx;
  const isEmpty = substances.length === 0;

  // pH question
  if (lq.includes('ph') || lq.includes('acid') || lq.includes('حمض') || lq.includes('قاعدة')) {
    return {
      answer: '🧪 Drag the Litmus Paper from the Equipment tab and drop it into the beaker to test the pH visually! Red = Acidic, Blue = Basic.',
      fallback: true,
    };
  }

  // Temperature question
  if (lq.includes('temp') || lq.includes('heat') || lq.includes('حرار')) {
    return {
      answer: burnerOn
        ? `🌡️ The temperature is ${temperature.toFixed(1)}°C. The Bunsen Burner is ON — substances are heating up!`
        : `🌡️ Temperature is ${temperature.toFixed(1)}°C. Drag the Bunsen Burner from Equipment to start heating.`,
      fallback: true,
    };
  }

  // Empty beaker
  if (isEmpty) {
    return {
      answer: '⚗️ Your beaker is empty! Try adding Water (H₂O) first, then drop in Sodium (Na) for a dramatic reaction.',
      fallback: true,
    };
  }

  // Boiling
  if (isBoiling) {
    return {
      answer: '♨️ Water is boiling at 100°C! If you have dissolved substances, evaporation is now concentrating the solution.',
      fallback: true,
    };
  }

  // Generic
  const substanceNames = substances.map(s => s.name).join(', ');
  return {
    answer: `🔬 Your beaker contains: ${substanceNames} at ${temperature.toFixed(1)}°C. Try adding an acid like HCl or a base like NaOH to trigger a reaction!`,
    fallback: true,
  };
}
