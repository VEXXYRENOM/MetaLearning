/**
 * Daily Challenges — Rotating static list (no DB cost).
 * Rotates by dayOfYear % CHALLENGES.length
 * Supports: Arabic (ar), French (fr), English (en), Spanish (es)
 */

export interface DailyChallenge {
  id: number;
  category: "ai" | "robotics" | "logic" | "critical";
  categoryIcon: string;
  question: { ar: string; fr: string; en: string; es: string };
  hint:     { ar: string; fr: string; en: string; es: string };
  xpReward: number;
}

export const DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: 1, category: "ai", categoryIcon: "🤖", xpReward: 20,
    question: {
      ar: "ما هو التعلم الآلي بكلمة واحدة؟",
      fr: "Qu'est-ce que le machine learning en un mot ?",
      en: "What is machine learning in one word?",
      es: "¿Qué es el aprendizaje automático en una palabra?",
    },
    hint: {
      ar: "النظام يتعلم من البيانات دون برمجة صريحة.",
      fr: "Le système apprend à partir de données sans programmation explicite.",
      en: "The system learns from data without explicit programming.",
      es: "El sistema aprende de datos sin programación explícita.",
    },
  },
  {
    id: 2, category: "logic", categoryIcon: "🧩", xpReward: 15,
    question: {
      ar: "أكمل المتتالية: 2، 4، 8، 16، ؟",
      fr: "Complète la suite : 2, 4, 8, 16, ?",
      en: "Complete the sequence: 2, 4, 8, 16, ?",
      es: "Completa la secuencia: 2, 4, 8, 16, ?",
    },
    hint: {
      ar: "كل رقم يساوي ضعف الرقم السابق.",
      fr: "Chaque nombre est le double du précédent.",
      en: "Each number is double the previous one.",
      es: "Cada número es el doble del anterior.",
    },
  },
  {
    id: 3, category: "robotics", categoryIcon: "⚙️", xpReward: 20,
    question: {
      ar: "سمِّ نوعاً واحداً من حساسات الروبوت.",
      fr: "Cite un type de capteur robotique.",
      en: "Name one type of robot sensor.",
      es: "Nombra un tipo de sensor robótico.",
    },
    hint: {
      ar: "أمثلة: ليدار، كاميرا، جيروسكوب.",
      fr: "Exemples : lidar, caméra, gyroscope.",
      en: "Examples: lidar, camera, gyroscope.",
      es: "Ejemplos: lidar, cámara, giroscopio.",
    },
  },
  {
    id: 4, category: "critical", categoryIcon: "💡", xpReward: 25,
    question: {
      ar: "لماذا قد تكون البيانات الكبيرة خطيرة على الخصوصية؟",
      fr: "Pourquoi le big data peut-il menacer la vie privée ?",
      en: "Why can big data be a privacy threat?",
      es: "¿Por qué el big data puede ser una amenaza para la privacidad?",
    },
    hint: {
      ar: "فكر في كيفية جمع المعلومات الشخصية دون موافقة.",
      fr: "Réfléchis à la collecte d'informations sans consentement.",
      en: "Think about collecting personal info without consent.",
      es: "Piensa en recopilar información personal sin consentimiento.",
    },
  },
  {
    id: 5, category: "ai", categoryIcon: "🤖", xpReward: 20,
    question: {
      ar: "ما الفرق بين الذكاء الاصطناعي والذكاء الاصطناعي العام؟",
      fr: "Quelle est la différence entre IA et AGI ?",
      en: "What is the difference between AI and AGI?",
      es: "¿Cuál es la diferencia entre IA e IAG?",
    },
    hint: {
      ar: "الذكاء العام يستطيع أداء أي مهمة فكرية يستطيعها الإنسان.",
      fr: "L'AGI peut accomplir n'importe quelle tâche intellectuelle humaine.",
      en: "AGI can perform any intellectual task that a human can.",
      es: "La IAG puede realizar cualquier tarea intelectual humana.",
    },
  },
  {
    id: 6, category: "logic", categoryIcon: "🧩", xpReward: 15,
    question: {
      ar: "إذا كان كل القطط حيوانات، وبعض الحيوانات تطير، فهل بعض القطط تطير؟",
      fr: "Si tous les chats sont des animaux, et certains animaux volent, certains chats volent-ils ?",
      en: "If all cats are animals, and some animals fly, do some cats fly?",
      es: "Si todos los gatos son animales, y algunos animales vuelan, ¿vuelan algunos gatos?",
    },
    hint: {
      ar: "هذا سؤال منطقي — لا تفترض شيئاً غير مذكور.",
      fr: "C'est une question logique — ne suppose rien de non mentionné.",
      en: "This is a logic question — don't assume anything not stated.",
      es: "Es una pregunta lógica — no asumas nada que no esté dicho.",
    },
  },
  {
    id: 7, category: "robotics", categoryIcon: "⚙️", xpReward: 20,
    question: {
      ar: "ما الفرق بين الروبوت الذاتي والروبوت المتحكم به عن بُعد؟",
      fr: "Quelle est la différence entre un robot autonome et télécommandé ?",
      en: "What's the difference between an autonomous robot and a remote-controlled one?",
      es: "¿Cuál es la diferencia entre un robot autónomo y uno teledirigido?",
    },
    hint: {
      ar: "الذاتي يتخذ قراراته بنفسه، المتحكم به يحتاج إنساناً.",
      fr: "L'autonome décide seul, le télécommandé a besoin d'un humain.",
      en: "Autonomous decides on its own; remote-controlled needs a human.",
      es: "El autónomo decide solo; el teledirigido necesita un humano.",
    },
  },
  {
    id: 8, category: "critical", categoryIcon: "💡", xpReward: 25,
    question: {
      ar: "هل يجب أن تكون خوارزميات الذكاء الاصطناعي شفافة؟ لماذا؟",
      fr: "Les algorithmes d'IA doivent-ils être transparents ? Pourquoi ?",
      en: "Should AI algorithms be transparent? Why?",
      es: "¿Deben ser transparentes los algoritmos de IA? ¿Por qué?",
    },
    hint: {
      ar: "فكر في المساءلة والثقة والتحيز.",
      fr: "Pense à la responsabilité, la confiance et le biais.",
      en: "Think about accountability, trust, and bias.",
      es: "Piensa en responsabilidad, confianza y sesgo.",
    },
  },
  {
    id: 9, category: "ai", categoryIcon: "🤖", xpReward: 20,
    question: {
      ar: "ما هي شبكة عصبية اصطناعية؟",
      fr: "Qu'est-ce qu'un réseau de neurones artificiels ?",
      en: "What is an artificial neural network?",
      es: "¿Qué es una red neuronal artificial?",
    },
    hint: {
      ar: "مستوحى من دماغ الإنسان — عُقد مترابطة تعالج المعلومات.",
      fr: "Inspiré du cerveau — nœuds interconnectés traitant des informations.",
      en: "Inspired by the brain — interconnected nodes processing information.",
      es: "Inspirado en el cerebro — nodos interconectados que procesan información.",
    },
  },
  {
    id: 10, category: "logic", categoryIcon: "🧩", xpReward: 15,
    question: {
      ar: "لديك 3 صناديق: واحد بالتفاح، واحد بالبرتقال، واحد بالاثنين. الملصقات كلها خاطئة. افتح صندوقاً واحداً وحدِّد محتوى الكل.",
      fr: "Vous avez 3 boîtes mal étiquetées. Ouvrez-en une pour tout deviner.",
      en: "You have 3 mislabeled boxes. Open one to identify all.",
      es: "Tienes 3 cajas mal etiquetadas. Abre una para identificarlas todas.",
    },
    hint: {
      ar: "افتح صندوق 'الاثنين معاً' — ما تجده يكشف الباقي.",
      fr: "Ouvrez la boîte 'les deux' — ce que vous trouvez révèle le reste.",
      en: "Open the 'both' box — what you find reveals the rest.",
      es: "Abre la caja 'ambos' — lo que encuentres revela el resto.",
    },
  },
  // Fill remaining 20 slots with varied challenges
  ...Array.from({ length: 20 }, (_, i) => ({
    id: 11 + i,
    category: (["ai", "robotics", "logic", "critical"] as const)[i % 4],
    categoryIcon: ["🤖", "⚙️", "🧩", "💡"][i % 4],
    xpReward: [20, 20, 15, 25][i % 4],
    question: {
      ar: `تحدي اليوم #${11 + i}: فكر في مشكلة تقنية واحدة تواجهها مجتمعاتنا اليوم.`,
      fr: `Défi du jour #${11 + i} : Pensez à un problème technologique actuel.`,
      en: `Daily Challenge #${11 + i}: Think of one tech problem facing society today.`,
      es: `Reto diario #${11 + i}: Piensa en un problema tecnológico actual.`,
    },
    hint: {
      ar: "لا توجد إجابة خاطئة — الهدف هو التفكير النقدي.",
      fr: "Pas de mauvaise réponse — l'objectif est la pensée critique.",
      en: "No wrong answer — the goal is critical thinking.",
      es: "No hay respuesta incorrecta — el objetivo es el pensamiento crítico.",
    },
  })),
];

export function getTodayChallenge(): DailyChallenge {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return DAILY_CHALLENGES[dayOfYear % DAILY_CHALLENGES.length];
}

export function getChallengeText(
  challenge: DailyChallenge,
  lang: string,
  field: "question" | "hint"
): string {
  const key = (lang.startsWith("ar") ? "ar" : lang.startsWith("fr") ? "fr" : lang.startsWith("es") ? "es" : "en") as "ar" | "fr" | "en" | "es";
  return challenge[field][key];
}
