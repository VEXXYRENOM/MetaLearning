export type LessonKind =
  | "procedural-heart"
  | "procedural-atom"
  | "procedural-solarsystem"
  | "procedural-earth-layers"
  | "procedural-animal-cell"
  | "procedural-plant-cell"
  | "procedural-water-molecule"
  | "procedural-dna"
  | "procedural-volcano"
  | "procedural-water-cycle"
  | "procedural-lungs"
  | "procedural-eye"
  | "procedural-pyramid"
  | "procedural-platonic"
  | "procedural-function-graph"
  | "procedural-geometric-volumes"
  | "procedural-colosseum"
  | "procedural-carthage"
  | "procedural-kairouan"
  | "procedural-arabic-letters"
  | "procedural-vocal-anatomy"
  | "procedural-room-objects"
  | "procedural-color-wheel"
  | "procedural-pottery"
  | "procedural-painting"
  | "procedural-orthographic"
  | "procedural-vectors"
  | "procedural-transformations"
  | "procedural-statistics"
  | "procedural-sequences"
  | "procedural-logic"
  | "procedural-kinematics"
  | "gltf-url"
  | "gltf-upload"
  | "gltf-artifact";

export type LessonDef = {
  id: string;
  titleAr: string;
  blurbAr: string;
  subjectAr: string;
  /** أيقونة إيموجي للبطاقة */
  emoji?: string;
  kind: LessonKind;
  /** نموذج تجريبي من الإنترنت (CORS مسموح) */
  gltfUrl?: string;
};

/** بطة Three.js الرسمية — للتحقق من مسار GLB ولوحة التحكم */
export const DEMO_GLTF_URL =
  "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb";

// ─────────────────────────────────────────────
// 🔬  علوم الحياة والأرض (SVT / Biology)
// ─────────────────────────────────────────────
const BIOLOGY_LESSONS: LessonDef[] = [
  {
    id: "heart",
    titleAr: "القلب والدورة الدموية",
    blurbAr:
      "نموذج تشريحي لقلب بشري واقعي. ارفع صورة من كتابك المدرسي وحولها إلى مجسم ثلاثي الأبعاد أو استخدم النموذج الواقعي ثلاثي الأبعاد.",
    subjectAr: "علوم الحياة والأرض",
    emoji: "❤️",
    kind: "gltf-artifact",
    gltfUrl: "/models/heart/scene.gltf",
  },
  {
    id: "animal-cell",
    titleAr: "الخلية الحيوانية",
    blurbAr:
      "استكشف مكونات الخلية الحيوانية: الغشاء الخلوي الشفاف، النواة بلونها البنفسجي المتوهج، الميتوكوندريا المتحركة (مصانع الطاقة)، الشبكة الإندوبلازمية، جهاز جولجي، والريبوسومات المنتشرة.",
    subjectAr: "علوم الحياة والأرض",
    emoji: "🔬",
    kind: "procedural-animal-cell",
  },
  {
    id: "plant-cell",
    titleAr: "الخلية النباتية",
    blurbAr:
      "قارن مع الخلية الحيوانية! لاحظ الجدار الخلوي المستطيل، الفجوة المركزية الكبيرة الممتلئة بالماء، والبلاستيدات الخضراء (مصانع التمثيل الضوئي) وهي تتحرك داخل السيتوبلازم.",
    subjectAr: "علوم الحياة والأرض",
    emoji: "🌿",
    kind: "procedural-plant-cell",
  },
  {
    id: "dna",
    titleAr: "الحمض النووي DNA",
    blurbAr:
      "اللولب المزدوج للـ DNA بشريطي السكر-فوسفات والقواعد النيتروجينية المتزاوجة: الأدينين (أحمر) مع الثيمين (أزرق)، والجوانين (أخضر) مع السيتوزين (أصفر). لاحظ الروابط الهيدروجينية بينها.",
    subjectAr: "علوم الحياة والأرض",
    emoji: "🧬",
    kind: "procedural-dna",
  },
  {
    id: "lungs",
    titleAr: "الجهاز التنفسي",
    blurbAr:
      "شاهد عملية التنفس بشكل حي: القصبة الهوائية بحلقاتها الغضروفية، الشعب الهوائية المتفرعة، الرئتان مع حركة شهيق وزفير واقعية، والحويصلات الهوائية حيث يتم تبادل الغازات.",
    subjectAr: "علوم الحياة والأرض",
    emoji: "🫁",
    kind: "procedural-lungs",
  },
  {
    id: "eye",
    titleAr: "تشريح العين البشرية",
    blurbAr:
      "مقطع عرضي للعين يكشف: القرنية الشفافة، القزحية الزرقاء بتفاصيلها الدقيقة، البؤبؤ الذي يتوسع ويتقلص، العدسة المتكيفة، الشبكية، النقرة المركزية، والعصب البصري.",
    subjectAr: "علوم الحياة والأرض",
    emoji: "👁️",
    kind: "procedural-eye",
  },
  {
    id: "brain-stem",
    titleAr: "تشريح الدماغ والأعصاب (مجسم واقعي)",
    blurbAr: "نموذج طبي عالي الدقة يوضح تركيب جذع الدماغ والأعصاب المتصلة به. يُعرض بإضاءة محيطية واقعية تبرز كل الأنسجة والألياف العصبية.",
    subjectAr: "علوم الحياة والأرض",
    emoji: "🧠",
    kind: "gltf-artifact",
    gltfUrl: "https://modelviewer.dev/shared-assets/models/BrainStem.glb"
  },
  {
    id: "horse-animated",
    titleAr: "حركة الحيوانات (مجسم واقعي)",
    blurbAr: "دراسة تشريحية لحركة الحصان بيولوجياً عبر مجسم 3D متحرك بدقة عالية جداً مع إضاءة استوديو فاخرة.",
    subjectAr: "علوم الحياة والأرض",
    emoji: "🐎",
    kind: "gltf-artifact",
    gltfUrl: "https://modelviewer.dev/shared-assets/models/Horse.glb"
  },
  {
    id: "fox-animal",
    titleAr: "الثعلب المتحرك (دراسة الحركة الحيوانية)",
    blurbAr: "نموذج ثعلب متحرك بثلاث حركات (استطلاع، مشي، جري). يستخدم لدراسة الأنماط الحركية للحيوانات البرية بواقعية فائقة.",
    subjectAr: "علوم الحياة والأرض",
    emoji: "🦊",
    kind: "gltf-artifact",
    gltfUrl: "https://raw.GithubUserContent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Fox/glTF-Binary/Fox.glb"
  },
  {
    id: "barramundi-fish",
    titleAr: "سمكة باراموندي (دراسة الأحياء البحرية)",
    blurbAr: "نموذج سمكة عالي الدقة يوضح القشور والزعانف والعيون بتفاصيل تشريحية مذهلة مع خامات PBR واقعية.",
    subjectAr: "علوم الحياة والأرض",
    emoji: "🐟",
    kind: "gltf-artifact",
    gltfUrl: "https://raw.GithubUserContent.com/KhronosGroup/glTF-Sample-Assets/main/Models/BarramundiFish/glTF-Binary/BarramundiFish.glb"
  },
  {
    id: "avocado-fruit",
    titleAr: "ثمرة الأفوكادو (دراسة البذور والثمار)",
    blurbAr: "ثمرة أفوكادو مقطوعة بدقة عالية جداً تظهر البذرة واللحم والقشر بخامات فيزيائية واقعية لدراسة تركيب الثمار.",
    subjectAr: "علوم الحياة والأرض",
    emoji: "🥑",
    kind: "gltf-artifact",
    gltfUrl: "https://raw.GithubUserContent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Avocado/glTF-Binary/Avocado.glb"
  },
  {
    id: "diffuse-plant",
    titleAr: "النبتة الشفافة (دراسة التمثيل الضوئي)",
    blurbAr: "نبتة بأوراق شفافة تظهر كيف يخترق الضوء أنسجة النبات. مثالية لشرح التمثيل الضوئي وبنية الأوراق.",
    subjectAr: "علوم الحياة والأرض",
    emoji: "🌿",
    kind: "gltf-artifact",
    gltfUrl: "https://raw.GithubUserContent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DiffuseTransmissionPlant/glTF-Binary/DiffuseTransmissionPlant.glb"
  },
];

// ─────────────────────────────────────────────
// ⚗️  الكيمياء (Chemistry)
// ─────────────────────────────────────────────
const CHEMISTRY_LESSONS: LessonDef[] = [
  {
    id: "atom",
    titleAr: "تركيب الذرة",
    blurbAr:
      "نموذج بور للذرة: نواة مركزية مشعة تنبض بالطاقة، محاطة بثلاثة مدارات إلكترونية تدور بسرعات مختلفة. شاهد الإلكترونات وهي تدور حول النواة في مسارات دائرية.",
    subjectAr: "الكيمياء",
    emoji: "⚛️",
    kind: "procedural-atom",
  },
  {
    id: "water-molecule",
    titleAr: "جزيء الماء H₂O",
    blurbAr:
      "جزيء الماء بدقة علمية: ذرة أكسجين حمراء مركزية وذرتي هيدروجين زرقاوين بزاوية 104.5° (الزاوية الحقيقية). لاحظ الروابط التساهمية، أزواج الإلكترونات الحرة، والاهتزاز الحراري.",
    subjectAr: "الكيمياء",
    emoji: "💧",
    kind: "procedural-water-molecule",
  },
];

// ─────────────────────────────────────────────
// 🌍  الجغرافيا وعلوم الأرض (Geography / Earth Science)
// ─────────────────────────────────────────────
const GEOGRAPHY_LESSONS: LessonDef[] = [
  {
    id: "solar-system",
    titleAr: "المجموعة الشمسية",
    blurbAr:
      "رحلة عبر النظام الشمسي: الشمس المتوهجة في المركز، والكواكب تدور حولها في مداراتها - الأرض بقمرها، المريخ الأحمر، والمشتري العملاق. كل كوكب يدور بسرعته الحقيقية النسبية.",
    subjectAr: "الجغرافيا / الفلك",
    emoji: "🪐",
    kind: "procedural-solarsystem",
  },
  {
    id: "earth-layers",
    titleAr: "طبقات الأرض",
    blurbAr:
      "مقطع عرضي للكرة الأرضية يكشف طبقاتها الخمس: اللب الداخلي الذهبي المتوهج (حديد صلب)، اللب الخارجي البرتقالي (حديد سائل)، الوشاح السفلي والعلوي، القشرة الأرضية الخضراء، المحيطات الزرقاء والغلاف الجوي.",
    subjectAr: "الجغرافيا / علوم الأرض",
    emoji: "🌍",
    kind: "procedural-earth-layers",
  },
  {
    id: "volcano",
    titleAr: "الزلازل والبراكين",
    blurbAr:
      "بركان نشط مع حمم متدفقة وسيول من الصهارة على جوانبه. شاهد الدخان المتصاعد من الفوهة وجسيمات الحمم المتطايرة في الهواء. تعرف على بنية البركان من القاعدة إلى القمة.",
    subjectAr: "الجغرافيا / علوم الأرض",
    emoji: "🌋",
    kind: "procedural-volcano",
  },
  {
    id: "water-cycle",
    titleAr: "دورة الماء في الطبيعة",
    blurbAr:
      "دورة الماء الكاملة: الشمس تسخن المحيط فيتبخر الماء (بخار صاعد)، يتكاثف في السماء مكوناً سحباً بيضاء، ثم يهطل مطراً على الجبال المكسوة بالثلوج ويعود إلى المحيط.",
    subjectAr: "الجغرافيا / علوم الأرض",
    emoji: "🌧️",
    kind: "procedural-water-cycle",
  },
  {
    id: "astronaut",
    titleAr: "بدلة الفضاء (مجسم واقعي)",
    blurbAr: "بدلة فضاء كاملة وتجهيزات رائد فضاء عالي الدقة (نيل آرمسترونغ). تُعرض بإضاءة استوديو مع ظلال واقعية ودوران بطيء كقطعة متحفية.",
    subjectAr: "الجغرافيا / الفلك",
    emoji: "👨‍🚀",
    kind: "gltf-artifact",
    gltfUrl: "https://modelviewer.dev/shared-assets/models/NeilArmstrong.glb"
  },
  {
    id: "nasa-astronaut",
    titleAr: "بدلة فضاء حديثة (وكالة ناسا)",
    blurbAr: "نموذج ثلاثي الأبعاد لبدلة فضاء حديثة. يُظهر تفاصيل النسيج المعقدة والمعدات المحمولة للنجاة في الفضاء الخارجي.",
    subjectAr: "الجغرافيا / الفلك",
    emoji: "🚀",
    kind: "gltf-artifact",
    gltfUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb"
  },
];

// ─────────────────────────────────────────────
// 📐  الرياضيات (Mathematics)
// ─────────────────────────────────────────────
const MATH_LESSONS: LessonDef[] = [
  {
    id: "platonic-solids",
    titleAr: "المجسمات الأفلاطونية",
    blurbAr:
      "الهندسة الفراغية في أبهى صورها: عشريني الأوجه الزجاجي الشفاف محاط بإثنا عشري الأوجه السلكي المتوهج. شاهدهما يدوران بحركة متناغمة مع تأثيرات إضاءة فيزيائية واقعية.",
    subjectAr: "الرياضيات",
    emoji: "📐",
    kind: "procedural-platonic",
  },
  {
    id: "function-graph",
    titleAr: "الدوال البيانية في الفضاء",
    blurbAr: "سطح رياضي ثلاثي الأبعاد مع تدرج لوني حراري يوضح التمثيل البياني للدوال في الفضاء ثلاثي الأبعاد.",
    subjectAr: "الرياضيات",
    emoji: "📈",
    kind: "procedural-function-graph",
  },
  {
    id: "geometric-volumes",
    titleAr: "حساب الأحجام والمساحات",
    blurbAr: "مجموعة من المجسمات الهندسية الأساسية (مكعب، كرة، أسطوانة، مخروط) لدراسة خصائصها وقوانين حسابها.",
    subjectAr: "الرياضيات",
    emoji: "🧊",
    kind: "procedural-geometric-volumes",
  },
  {
    id: "orthographic-projection",
    titleAr: "الإسقاط العمودي (Orthographic Projection)",
    blurbAr: "شاهد كيف تُسقط الأشكال الهندسية ثلاثية الأبعاد ظلالها على المستويات المتعامدة (الأمامي، الجانبي، والعلوي) لفهم العلاقة بين الفراغ والمستوى ثنائي الأبعاد.",
    subjectAr: "الرياضيات",
    emoji: "📦",
    kind: "procedural-orthographic",
  },
  {
    id: "vectors-3d",
    titleAr: "المتجهات في الفضاء (Vectors in 3D)",
    blurbAr: "تعرف على المتجهات رياضيا: الإحداثيات، الطول، وضعية السهم في فضاء ثلاثي الأبعاد مع تفاعل لتمثيل عمليات الجمع والضرب الاتجاهي.",
    subjectAr: "الرياضيات",
    emoji: "↗️",
    kind: "procedural-vectors",
  },
  {
    id: "transformations",
    titleAr: "التحويلات الهندسية (Transformations)",
    blurbAr: "مراقبة مستمرة وديناميكية لتأثير التحويلات الرياضية على الأجسام: الانسحاب، الدوران حول المحاور، والتكبير/التصغير التدريجي.",
    subjectAr: "الرياضيات",
    emoji: "🔄",
    kind: "procedural-transformations",
  },
  {
    id: "statistics-probability",
    titleAr: "الإحصاء والاحتمالات (Statistics & Probability)",
    blurbAr: "تجسيد بياني لمفاهيم الإحصاء وتوزيع الاحتمالات بطريقة مرئية مبهرة لفهم التوزيع الطبيعي والتباين.",
    subjectAr: "الرياضيات",
    emoji: "📊",
    kind: "procedural-statistics",
  },
  {
    id: "sequences",
    titleAr: "المتتاليات الحسابية والهندسية (Sequences)",
    blurbAr: "مجسمات كتلية تتزايد تدريجياً لتعبر بشكل بصري عن الفرق بين المتتالية الحسابية والمتتالية الهندسية وتأثير الأساس على النمو.",
    subjectAr: "الرياضيات",
    emoji: "📈",
    kind: "procedural-sequences",
  },
  {
    id: "mathematical-logic",
    titleAr: "المنطق الرياضي (Mathematical Logic)",
    blurbAr: "أشكال ڤن (Venn Diagrams) شفافة ومضيئة لتوضيح العمليات المنطقية مثل التقاطع (AND) والاتحاد (OR) والفرق (NOT).",
    subjectAr: "الرياضيات",
    emoji: "🧠",
    kind: "procedural-logic",
  },
  {
    id: "robot-meca",
    titleAr: "روبوت متحرك (هندسة ميكانيكية)",
    blurbAr: "نموذج روبوت آلي (Mecha) يعرض مفاصل ميكانيكية وهندسة الروبوتات المعاصرة. يمكن استخدامه لتبسيط دراسة ميكانيكا الحركة والذكاء الاصطناعي.",
    subjectAr: "الرياضيات",
    emoji: "🤖",
    kind: "gltf-artifact",
    gltfUrl: "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb"
  },
  {
    id: "robot-kinematics",
    titleAr: "رياضيات الروبوت (Kinematics)",
    blurbAr: "استخدم الدوال المثلثية والمتجهات لبرمجة مسار الروبوت وتحريكه للوصول إلى الأهداف بدقة متناهية.",
    subjectAr: "الرياضيات",
    emoji: "🧭",
    kind: "procedural-kinematics",
  },
];

// ─────────────────────────────────────────────
// 🏛️  التاريخ (History)
// ─────────────────────────────────────────────
const HISTORY_LESSONS: LessonDef[] = [
  {
    id: "pyramid",
    titleAr: "أهرامات الجيزة",
    blurbAr:
      "نموذج هرم مصري ذهبي اللون مع تفاصيل حجرية واقعية. يدور ببطء ليكشف جميع أوجهه مع شبكة أرضية توضح مقياس الحجم. مدخل لدراسة الحضارة المصرية القديمة.",
    subjectAr: "التاريخ",
    emoji: "🏛️",
    kind: "procedural-pyramid",
  },
  {
    id: "colosseum",
    titleAr: "مدرج الكولوسيوم الروماني",
    blurbAr: "استكشف الكولوسيوم العظيم بتفاصيله المعمارية: الأقواس، المدرجات الداخلية، الساحة، والأنفاق السفلية.",
    subjectAr: "التاريخ",
    emoji: "🏟️",
    kind: "procedural-colosseum",
  },
  {
    id: "carthage",
    titleAr: "آثار قرطاج القديمة",
    blurbAr: "جولة خيالية بين أعمدة قرطاج الرومانية، بقايا الجدران، والأرضيات الحجرية التي تروي قصصاً من الماضي.",
    subjectAr: "التاريخ",
    emoji: "🏛️",
    kind: "procedural-carthage",
  },
  {
    id: "kairouan",
    titleAr: "المدينة العتيقة بالقيروان",
    blurbAr: "جامع عقبة بن نافع التاريخي بمئذنته الفريدة وقبته وفنائه الداخلي المزين بالأقواس.",
    subjectAr: "التاريخ",
    emoji: "🕌",
    kind: "procedural-kairouan",
  },
  {
    id: "antique-camera",
    titleAr: "الكاميرا التاريخية الأولى (مجسم 3D واقعي)",
    blurbAr: "استكشف أولى الكاميرات الأثرية عبر مسح ضوئي عالي الدقة. لاحظ التفاصيل المذهلة لنسيج الخشب، لمعان النحاس، وعدسة الزجاج مع إضاءة الاستوديو الواقعية.",
    subjectAr: "التاريخ",
    emoji: "📸",
    kind: "gltf-artifact",
    gltfUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/AntiqueCamera/glTF-Binary/AntiqueCamera.glb"
  },
  {
    id: "damaged-helmet",
    titleAr: "خوذة محارب قديمة (تفاعل ضوئي PBR)",
    blurbAr: "دراسة مذهلة للأسلحة التاريخية من خلال خوذة متضررة. يعرض هذا المجسم أعلى جودة للـ PBR، لتشعر ببرودة المعدن وواقعية الصدأ والخدوش وكأنها أمامك مباشرة.",
    subjectAr: "التاريخ",
    emoji: "🪖",
    kind: "gltf-artifact",
    gltfUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb"
  },
  {
    id: "flight-helmet",
    titleAr: "خوذة طيار عسكري (مسح ضوئي حقيقي)",
    blurbAr: "خوذة طيار حربي حقيقية معروضة على حامل خشبي. مسح ضوئي عالي الدقة يكشف عن طبقات الجلد والنسيج والمعدن بواقعية مذهلة.",
    subjectAr: "التاريخ",
    emoji: "🪖",
    kind: "gltf-artifact",
    gltfUrl: "https://raw.GithubUserContent.com/KhronosGroup/glTF-Sample-Assets/main/Models/FlightHelmet/glTF-Binary/FlightHelmet.glb"
  },
  {
    id: "mosquito-amber",
    titleAr: "حشرة محفوظة في الكهرمان (عصور ما قبل التاريخ)",
    blurbAr: "بعوضة محفوظة في قطعة كهرمان شفافة منذ ملايين السنين. يستخدم تأثيرات الشفافية والحجم لإظهار الضوء يخترق الكهرمان بواقعية مذهلة.",
    subjectAr: "التاريخ",
    emoji: "🦟",
    kind: "gltf-artifact",
    gltfUrl: "https://raw.GithubUserContent.com/KhronosGroup/glTF-Sample-Assets/main/Models/MosquitoInAmber/glTF-Binary/MosquitoInAmber.glb"
  },
  {
    id: "scattering-skull",
    titleAr: "جمجمة بشرية أثرية (مسح ضوئي واقعي)",
    blurbAr: "جمجمة بشرية عالية الدقة مع تأثير تشتت الضوء تحت السطح مما يمنحها مظهراً واقعياً مرعباً كأنها قطعة أثرية من متحف حقيقي.",
    subjectAr: "التاريخ",
    emoji: "💀",
    kind: "gltf-artifact",
    gltfUrl: "https://raw.GithubUserContent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ScatteringSkull/glTF-Binary/ScatteringSkull.glb"
  },
  {
    id: "lantern",
    titleAr: "فانوس الشارع القديم (حقبة ما قبل الكهرباء)",
    blurbAr: "فانوس شارع خشبي قديم بدقة عالية جداً. يحكي قصة الإنارة قبل اختراع الكهرباء مع تفاصيل الصدأ والخشب المتآكل.",
    subjectAr: "التاريخ",
    emoji: "🏮",
    kind: "gltf-artifact",
    gltfUrl: "https://raw.GithubUserContent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Lantern/glTF-Binary/Lantern.glb"
  },
  {
    id: "toy-car",
    titleAr: "سيارة لعبة أثرية (صناعات القرن العشرين)",
    blurbAr: "نموذج سيارة لعبة معدنية بتقنيات الشفافية واللمعان. يوضح التقنيات الصناعية في القرن العشرين عبر طلاء شفاف وعجلات مطاطية واقعية.",
    subjectAr: "التاريخ",
    emoji: "🚗",
    kind: "gltf-artifact",
    gltfUrl: "https://raw.GithubUserContent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ToyCar/glTF-Binary/ToyCar.glb"
  },
  {
    id: "dragon-attenuation",
    titleAr: "تنين كريستالي (أساطير الحضارات القديمة)",
    blurbAr: "تنين كريستالي شفاف بتأثيرات الحجم والانكسار. يستخدم لدراسة أساطير التنانين عبر الحضارات مع عرض مبهر لتقنيات الإضاءة.",
    subjectAr: "التاريخ",
    emoji: "🐉",
    kind: "gltf-artifact",
    gltfUrl: "https://raw.GithubUserContent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DragonAttenuation/glTF-Binary/DragonAttenuation.glb"
  },
  {
    id: "chess-set",
    titleAr: "طقم شطرنج كلاسيكي (استراتيجيات الحرب التاريخية)",
    blurbAr: "طقم شطرنج كريستالي فاخر بشفافية وحجم واقعي. يدرّس استراتيجيات الحرب والتخطيط العسكري عبر التاريخ من خلال هذه اللعبة الملكية.",
    subjectAr: "التاريخ",
    emoji: "♟️",
    kind: "gltf-artifact",
    gltfUrl: "https://raw.GithubUserContent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ABeautifulGame/glTF-Binary/ABeautifulGame.glb"
  },
  {
    id: "water-bottle",
    titleAr: "قنينة ماء معدنية (اختراعات حديثة)",
    blurbAr: "قنينة ماء معدنية بتقنية PBR عالية الدقة تعرض انعكاسات المعدن والألوان بواقعية مذهلة.",
    subjectAr: "التاريخ",
    emoji: "🫗",
    kind: "gltf-artifact",
    gltfUrl: "https://raw.GithubUserContent.com/KhronosGroup/glTF-Sample-Assets/main/Models/WaterBottle/glTF-Binary/WaterBottle.glb"
  },
  {
    id: "traditional-canoe",
    titleAr: "قارب تقليدي محفور (تاريخ الشعوب)",
    blurbAr: "نموذج مفصل لقارب كانو خشبي محفور بالطرق التقليدية. يستخدم لدراسة تاريخ الشعوب الأصلية وطرق التنقل القديمة عبر الأنهار والمحيطات.",
    subjectAr: "التاريخ",
    emoji: "🛶",
    kind: "gltf-artifact",
    gltfUrl: "https://modelviewer.dev/shared-assets/models/Canoe.glb"
  },
  {
    id: "vintage-computer",
    titleAr: "جهاز حاسوب قديم (تاريخ التكنولوجيا)",
    blurbAr: "حاسوب طراز الثمانينات (Vintage). يوثق هذا النموذج بدايات دخول الحواسيب الشخصية والتكنولوجيا التي غيرت وجه العالم.",
    subjectAr: "التاريخ",
    emoji: "🖥️",
    kind: "gltf-artifact",
    gltfUrl: "https://modelviewer.dev/shared-assets/models/SpacemacV.glb"
  },
];

// ─────────────────────────────────────────────
// 🗣️  اللغات (Languages)
// ─────────────────────────────────────────────
const LANGUAGES_LESSONS: LessonDef[] = [
  {
    id: "arabic-letters",
    titleAr: "الحروف الأبجدية 3D",
    blurbAr: "حروف عربية ثلاثية الأبعاد تطفو في الفضاء مع تأثيرات متوهجة وتفاعلية بصرية ممتعة.",
    subjectAr: "اللغات",
    emoji: "أ",
    kind: "procedural-arabic-letters",
  },
  {
    id: "vocal-anatomy",
    titleAr: "مخارج الحروف الصوتية",
    blurbAr: "مقطع تشريحي لجهاز النطق البشري يوضح مواضع خروج الأصوات، من الأحبال الصوتية إلى الشفاه.",
    subjectAr: "اللغات",
    emoji: "🗣️",
    kind: "procedural-vocal-anatomy",
  },
  {
    id: "room-objects",
    titleAr: "مفردات الغرفة",
    blurbAr: "تعلم المفردات الأساسية عبر استكشاف عناصر الغرفة ثلاثية الأبعاد (طاولة، كرسي، كتاب، ساعة...).",
    subjectAr: "اللغات",
    emoji: "🪑",
    kind: "procedural-room-objects",
  },
];

// ─────────────────────────────────────────────
// 🎨  الفنون (Art)
// ─────────────────────────────────────────────
const ART_LESSONS: LessonDef[] = [
  {
    id: "color-wheel",
    titleAr: "عجلة الألوان",
    blurbAr: "عجلة تفاعلية تدمج الألوان الأساسية، الثانوية، والثالثية، مع تمثيل للتشبع والسطوع في الفضاء.",
    subjectAr: "الفنون",
    emoji: "🎨",
    kind: "procedural-color-wheel",
  },
  {
    id: "pottery",
    titleAr: "الخزف والنحت",
    blurbAr: "محاكاة لقرص الخزاف وصناعة الأواني الفخارية بتفاصيل تقليدية وملامس طينية واقعية.",
    subjectAr: "الفنون",
    emoji: "🏺",
    kind: "procedural-pottery",
  },
  {
    id: "painting",
    titleAr: "اللوحات الكلاسيكية",
    blurbAr: "تجربة فنية داخل إطار كلاسيكي مذهب يعرض لوحة ألوان عميقة تتفاعل مع إضاءة المعرض.",
    subjectAr: "الفنون",
    emoji: "🖼️",
    kind: "procedural-painting",
  },
  {
    id: "satellite-outernet",
    titleAr: "قمر صناعي مصغر (علوم وتقنية)",
    blurbAr: "نموذج لمركبة ساتل (قمر صناعي صغير) تستخدم لبث البيانات. يعرض أجزاء المركبة مثل الألواح الشمسية والهوائيات.",
    subjectAr: "الفنون",
    emoji: "🛰️",
    kind: "gltf-artifact",
    gltfUrl: "https://modelviewer.dev/shared-assets/models/Outernet.glb"
  },
  {
    id: "modern-shoe",
    titleAr: "تصميم المنتجات: حذاء تقني (مواد واقعية)",
    blurbAr: "نموذج واقعي لحذاء رياضي يعرض خامات متعددة مثل الجلد والمطاط والنسيج. يستخدم لتدريس مبادئ تصميم المنتجات الصناعية الحديثة.",
    subjectAr: "الفنون",
    emoji: "👟",
    kind: "gltf-artifact",
    gltfUrl: "https://modelviewer.dev/shared-assets/models/Shoe.glb"
  },
];

// ─────────────────────────────────────────────
// 🔧  أدوات المعلم (Teacher Tools)
// ─────────────────────────────────────────────
const TOOL_LESSONS: LessonDef[] = [
  {
    id: "demo-duck",
    titleAr: "نموذج ثلاثي الأبعاد (تجريبي)",
    blurbAr:
      "ملف GLB حقيقي من مكتبة Three.js. جرّب النقر على أجزاء النموذج لمعرفة اسمها في البرمجة.",
    subjectAr: "تجربة تقنية",
    emoji: "🦆",
    kind: "gltf-url",
    gltfUrl: DEMO_GLTF_URL,
  },
  {
    id: "my-model",
    titleAr: "درسي: رفع نموذج",
    blurbAr:
      "ارفع ملف .glb أو .gltf من جهازك (مثلاً تصدير من Blender) واعرضه للتلاميذ.",
    subjectAr: "مخصص",
    emoji: "📦",
    kind: "gltf-upload",
  },
];

// ─────────────────────────────────────────────
//  القائمة الرئيسية المُصدَّرة
// ─────────────────────────────────────────────
export const LESSONS: LessonDef[] = [
  ...BIOLOGY_LESSONS,
  ...CHEMISTRY_LESSONS,
  ...GEOGRAPHY_LESSONS,
  ...MATH_LESSONS,
  ...HISTORY_LESSONS,
  ...LANGUAGES_LESSONS,
  ...ART_LESSONS,
  ...TOOL_LESSONS,
];

/** كل المواد الفريدة لعرض التصفية */
export const ALL_SUBJECTS = [...new Set(LESSONS.map((l) => l.subjectAr))];

export function getLesson(id: string | undefined): LessonDef | undefined {
  return LESSONS.find((l) => l.id === id);
}

/** تصفية الدروس حسب المادة */
export function getLessonsBySubject(subjectAr: string): LessonDef[] {
  return LESSONS.filter((l) => l.subjectAr === subjectAr);
}
