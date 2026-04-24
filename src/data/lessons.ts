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
  titleEn?: string;
  blurbAr: string;
  subjectAr: string;
  subjectEn?: string;
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
    titleEn: "The Heart & Circulatory System",
    blurbAr:
      "نموذج تشريحي لقلب بشري واقعي. ارفع صورة من كتابك المدرسي وحولها إلى مجسم ثلاثي الأبعاد أو استخدم النموذج الواقعي ثلاثي الأبعاد.",
    subjectAr: "علوم الحياة والأرض",
    subjectEn: "Biology",
    emoji: "❤️",
    kind: "procedural-heart",
  },
  {
    id: "animal-cell",
    titleAr: "الخلية الحيوانية",
    titleEn: "The Animal Cell",
    blurbAr:
      "استكشف مكونات الخلية الحيوانية: الغشاء الخلوي الشفاف، النواة بلونها البنفسجي المتوهج، الميتوكوندريا المتحركة (مصانع الطاقة)، الشبكة الإندوبلازمية، جهاز جولجي، والريبوسومات المنتشرة.",
    subjectAr: "علوم الحياة والأرض",
    subjectEn: "Biology",
    emoji: "🔬",
    kind: "procedural-animal-cell",
  },
  {
    id: "plant-cell",
    titleAr: "الخلية النباتية",
    titleEn: "The Plant Cell",
    blurbAr:
      "قارن مع الخلية الحيوانية! لاحظ الجدار الخلوي المستطيل، الفجوة المركزية الكبيرة الممتلئة بالماء، والبلاستيدات الخضراء (مصانع التمثيل الضوئي) وهي تتحرك داخل السيتوبلازم.",
    subjectAr: "علوم الحياة والأرض",
    subjectEn: "Biology",
    emoji: "🌿",
    kind: "procedural-plant-cell",
  },
  {
    id: "dna",
    titleAr: "الحمض النووي DNA",
    titleEn: "DNA Double Helix",
    blurbAr:
      "اللولب المزدوج للـ DNA بشريطي السكر-فوسفات والقواعد النيتروجينية المتزاوجة: الأدينين (أحمر) مع الثيمين (أزرق)، والجوانين (أخضر) مع السيتوزين (أصفر). لاحظ الروابط الهيدروجينية بينها.",
    subjectAr: "علوم الحياة والأرض",
    subjectEn: "Biology",
    emoji: "🧬",
    kind: "procedural-dna",
  },
  {
    id: "lungs",
    titleAr: "الجهاز التنفسي",
    titleEn: "The Respiratory System",
    blurbAr:
      "شاهد عملية التنفس بشكل حي: القصبة الهوائية بحلقاتها الغضروفية، الشعب الهوائية المتفرعة، الرئتان مع حركة شهيق وزفير واقعية، والحويصلات الهوائية حيث يتم تبادل الغازات.",
    subjectAr: "علوم الحياة والأرض",
    subjectEn: "Biology",
    emoji: "🫁",
    kind: "procedural-lungs",
  },
  {
    id: "eye",
    titleAr: "تشريح العين البشرية",
    titleEn: "Human Eye Anatomy",
    blurbAr:
      "مقطع عرضي للعين يكشف: القرنية الشفافة، القزحية الزرقاء بتفاصيلها الدقيقة، البؤبؤ الذي يتوسع ويتقلص، العدسة المتكيفة، الشبكية، النقرة المركزية، والعصب البصري.",
    subjectAr: "علوم الحياة والأرض",
    subjectEn: "Biology",
    emoji: "👁️",
    kind: "procedural-eye",
  },
  {
    id: "brain-stem",
    titleAr: "تشريح الدماغ والأعصاب (مجسم واقعي)",
    titleEn: "Brain Stem & Nerves Anatomy",
    blurbAr: "نموذج طبي عالي الدقة يوضح تركيب جذع الدماغ والأعصاب المتصلة به. يُعرض بإضاءة محيطية واقعية تبرز كل الأنسجة والألياف العصبية.",
    subjectAr: "علوم الحياة والأرض",
    subjectEn: "Biology",
    emoji: "🧠",
    kind: "gltf-artifact",
    gltfUrl: "https://modelviewer.dev/shared-assets/models/BrainStem.glb"
  },
  {
    id: "horse-animated",
    titleAr: "حركة الحيوانات (مجسم واقعي)",
    titleEn: "Animal Locomotion (Animated Horse)",
    blurbAr: "دراسة تشريحية لحركة الحصان بيولوجياً عبر مجسم 3D متحرك بدقة عالية جداً مع إضاءة استوديو فاخرة.",
    subjectAr: "علوم الحياة والأرض",
    subjectEn: "Biology",
    emoji: "🐎",
    kind: "gltf-artifact",
    gltfUrl: "https://modelviewer.dev/shared-assets/models/Horse.glb"
  },
  {
    id: "fox-animal",
    titleAr: "الثعلب المتحرك (دراسة الحركة الحيوانية)",
    titleEn: "Animated Fox (Locomotion Study)",
    blurbAr: "نموذج ثعلب متحرك بثلاث حركات (استطلاع، مشي، جري). يستخدم لدراسة الأنماط الحركية للحيوانات البرية بواقعية فائقة.",
    subjectAr: "علوم الحياة والأرض",
    subjectEn: "Biology",
    emoji: "🦊",
    kind: "gltf-artifact",
    gltfUrl: "https://raw.GithubUserContent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Fox/glTF-Binary/Fox.glb"
  },
  {
    id: "barramundi-fish",
    titleAr: "سمكة باراموندي (دراسة الأحياء البحرية)",
    titleEn: "Barramundi Fish (Marine Biology)",
    blurbAr: "نموذج سمكة عالي الدقة يوضح القشور والزعانف والعيون بتفاصيل تشريحية مذهلة مع خامات PBR واقعية.",
    subjectAr: "علوم الحياة والأرض",
    subjectEn: "Biology",
    emoji: "🐟",
    kind: "gltf-artifact",
    gltfUrl: "https://raw.GithubUserContent.com/KhronosGroup/glTF-Sample-Assets/main/Models/BarramundiFish/glTF-Binary/BarramundiFish.glb"
  },
  {
    id: "avocado-fruit",
    titleAr: "ثمرة الأفوكادو (دراسة البذور والثمار)",
    titleEn: "Avocado Fruit (Seed & Fruit Study)",
    blurbAr: "ثمرة أفوكادو مقطوعة بدقة عالية جداً تظهر البذرة واللحم والقشر بخامات فيزيائية واقعية لدراسة تركيب الثمار.",
    subjectAr: "علوم الحياة والأرض",
    subjectEn: "Biology",
    emoji: "🥑",
    kind: "gltf-artifact",
    gltfUrl: "https://raw.GithubUserContent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Avocado/glTF-Binary/Avocado.glb"
  },
  {
    id: "diffuse-plant",
    titleAr: "النبتة الشفافة (دراسة التمثيل الضوئي)",
    titleEn: "Diffuse Plant (Photosynthesis)",
    blurbAr: "نبتة بأوراق شفافة تظهر كيف يخترق الضوء أنسجة النبات. مثالية لشرح التمثيل الضوئي وبنية الأوراق.",
    subjectAr: "علوم الحياة والأرض",
    subjectEn: "Biology",
    emoji: "🌿",
    kind: "gltf-artifact",
    gltfUrl: "https://raw.GithubUserContent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DiffuseTransmissionPlant/glTF-Binary/DiffuseTransmissionPlant.glb"
  },
  {
    id: "cell-mitosis",
    titleAr: "انقسام الخلية — الانقسام المتساوي",
    titleEn: "Cell Division — Mitosis",
    blurbAr: "شاهد كيف تنقسم الخلية الحية إلى خليتين متطابقتين، وتتبع أطوار الانقسام من تضاعف الكروموسومات حتى انفصال السيتوبلازم.",
    subjectAr: "علوم الحياة والأرض",
    subjectEn: "Biology",
    emoji: "🦠",
    kind: "procedural-animal-cell"
  },
  {
    id: "photosynthesis",
    titleAr: "التركيب الضوئي — كيف تصنع النباتات الطاقة",
    titleEn: "Photosynthesis — How Plants Make Energy",
    blurbAr: "رحلة تفاعلية داخل البلاستيدات الخضراء للتعرف على عملية تحويل ضوء الشمس وثاني أكسيد الكربون إلى طاقة وأكسجين.",
    subjectAr: "علوم الحياة والأرض",
    subjectEn: "Biology",
    emoji: "☀️",
    kind: "procedural-plant-cell"
  }
];

// ─────────────────────────────────────────────
// ⚗️  الكيمياء (Chemistry)
// ─────────────────────────────────────────────
const CHEMISTRY_LESSONS: LessonDef[] = [
  {
    id: "atom",
    titleAr: "تركيب الذرة",
    titleEn: "Atomic Structure",
    blurbAr:
      "نموذج بور للذرة: نواة مركزية مشعة تنبض بالطاقة، محاطة بثلاثة مدارات إلكترونية تدور بسرعات مختلفة. شاهد الإلكترونات وهي تدور حول النواة في مسارات دائرية.",
    subjectAr: "الكيمياء",
    subjectEn: "Chemistry",
    emoji: "⚛️",
    kind: "procedural-atom",
  },
  {
    id: "water-molecule",
    titleAr: "جزيء الماء H₂O",
    titleEn: "Water Molecule H₂O",
    blurbAr:
      "جزيء الماء بدقة علمية: ذرة أكسجين حمراء مركزية وذرتي هيدروجين زرقاوين بزاوية 104.5° (الزاوية الحقيقية). لاحظ الروابط التساهمية، أزواج الإلكترونات الحرة، والاهتزاز الحراري.",
    subjectAr: "الكيمياء",
    subjectEn: "Chemistry",
    emoji: "💧",
    kind: "procedural-water-molecule",
  },
  {
    id: "periodic-table-hydrogen",
    titleAr: "ذرة الهيدروجين — نموذج بور",
    titleEn: "Hydrogen Atom — Bohr Model",
    blurbAr: "استكشاف تفاعلي لأبسط عناصر الجدول الدوري، ببروتون واحد مع إلكترون يدور حوله بمسار كمي.",
    subjectAr: "الكيمياء",
    subjectEn: "Chemistry",
    emoji: "🧪",
    kind: "procedural-atom"
  }
];

// ─────────────────────────────────────────────
// 🌍  الجغرافيا وعلوم الأرض (Geography / Earth Science)
// ─────────────────────────────────────────────
const GEOGRAPHY_LESSONS: LessonDef[] = [
  {
    id: "solar-system",
    titleAr: "المجموعة الشمسية",
    titleEn: "The Solar System",
    blurbAr:
      "رحلة عبر النظام الشمسي: الشمس المتوهجة في المركز، والكواكب تدور حولها في مداراتها - الأرض بقمرها، المريخ الأحمر، والمشتري العملاق. كل كوكب يدور بسرعته الحقيقية النسبية.",
    subjectAr: "الجغرافيا / الفلك",
    subjectEn: "Astronomy",
    emoji: "🪐",
    kind: "procedural-solarsystem",
  },
  {
    id: "earth-layers",
    titleAr: "طبقات الأرض",
    titleEn: "Earth's Layers & Structure",
    blurbAr:
      "مقطع عرضي للكرة الأرضية يكشف طبقاتها الخمس: اللب الداخلي الذهبي المتوهج (حديد صلب)، اللب الخارجي البرتقالي (حديد سائل)، الوشاح السفلي والعلوي، القشرة الأرضية الخضراء، المحيطات الزرقاء والغلاف الجوي.",
    subjectAr: "الجغرافيا / علوم الأرض",
    subjectEn: "Geography",
    emoji: "🌍",
    kind: "procedural-earth-layers",
  },
  {
    id: "volcano",
    titleAr: "الزلازل والبراكين",
    titleEn: "Earthquakes and Volcanoes",
    blurbAr:
      "بركان نشط مع حمم متدفقة وسيول من الصهارة على جوانبه. شاهد الدخان المتصاعد من الفوهة وجسيمات الحمم المتطايرة في الهواء. تعرف على بنية البركان من القاعدة إلى القمة.",
    subjectAr: "الجغرافيا / علوم الأرض",
    subjectEn: "Geography",
    emoji: "🌋",
    kind: "procedural-volcano",
  },
  {
    id: "water-cycle",
    titleAr: "دورة الماء في الطبيعة",
    titleEn: "The Water Cycle",
    blurbAr:
      "دورة الماء الكاملة: الشمس تسخن المحيط فيتبخر الماء (بخار صاعد)، يتكاثف في السماء مكوناً سحباً بيضاء، ثم يهطل مطراً على الجبال المكسوة بالثلوج ويعود إلى المحيط.",
    subjectAr: "الجغرافيا / علوم الأرض",
    subjectEn: "Geography",
    emoji: "🌧️",
    kind: "procedural-water-cycle",
  },
  {
    id: "astronaut",
    titleAr: "بدلة الفضاء (مجسم واقعي)",
    titleEn: "Spacesuit (Realistic Model)",
    blurbAr: "بدلة فضاء كاملة وتجهيزات رائد فضاء عالي الدقة (نيل آرمسترونغ). تُعرض بإضاءة استوديو مع ظلال واقعية ودوران بطيء كقطعة متحفية.",
    subjectAr: "الجغرافيا / الفلك",
    subjectEn: "Astronomy",
    emoji: "👨‍🚀",
    kind: "gltf-artifact",
    gltfUrl: "https://modelviewer.dev/shared-assets/models/NeilArmstrong.glb"
  },
  {
    id: "nasa-astronaut",
    titleAr: "بدلة فضاء حديثة (وكالة ناسا)",
    titleEn: "Modern Spacesuit (NASA)",
    blurbAr: "نموذج ثلاثي الأبعاد لبدلة فضاء حديثة. يُظهر تفاصيل النسيج المعقدة والمعدات المحمولة للنجاة في الفضاء الخارجي.",
    subjectAr: "الجغرافيا / الفلك",
    subjectEn: "Astronomy",
    emoji: "🚀",
    kind: "gltf-artifact",
    gltfUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb"
  },
  {
    id: "big-bang",
    titleAr: "نظرية الانفجار العظيم",
    titleEn: "The Big Bang Theory",
    blurbAr: "تصور مرئي لبداية الكون، توسع المادة والطاقة في الفراغ بشكل كروي متسارع وديناميكي.",
    subjectAr: "الجغرافيا / الفلك",
    subjectEn: "Astronomy",
    emoji: "🌌",
    kind: "procedural-solarsystem"
  },
  {
    id: "tectonic-plates",
    titleAr: "الصفائح التكتونية وانجراف القارات",
    titleEn: "Tectonic Plates & Continental Drift",
    blurbAr: "نموذج لحركة القشرة الأرضية فوق الطبقات الباطنية لفهم تكون الجبال والزلازل.",
    subjectAr: "الجغرافيا / علوم الأرض",
    subjectEn: "Geography",
    emoji: "🪨",
    kind: "procedural-earth-layers"
  }
];

// ─────────────────────────────────────────────
// 📐  الرياضيات (Mathematics)
// ─────────────────────────────────────────────
const MATH_LESSONS: LessonDef[] = [
  {
    id: "platonic-solids",
    titleAr: "المجسمات الأفلاطونية",
    titleEn: "Platonic Solids",
    blurbAr:
      "الهندسة الفراغية في أبهى صورها: عشريني الأوجه الزجاجي الشفاف محاط بإثنا عشري الأوجه السلكي المتوهج. شاهدهما يدوران بحركة متناغمة مع تأثيرات إضاءة فيزيائية واقعية.",
    subjectAr: "الرياضيات",
    subjectEn: "Mathematics",
    emoji: "📐",
    kind: "procedural-platonic",
  },
  {
    id: "function-graph",
    titleAr: "الدوال البيانية في الفضاء",
    titleEn: "3D Function Graphs",
    blurbAr: "سطح رياضي ثلاثي الأبعاد مع تدرج لوني حراري يوضح التمثيل البياني للدوال في الفضاء ثلاثي الأبعاد.",
    subjectAr: "الرياضيات",
    subjectEn: "Mathematics",
    emoji: "📈",
    kind: "procedural-function-graph",
  },
  {
    id: "geometric-volumes",
    titleAr: "حساب الأحجام والمساحات",
    titleEn: "Geometric Volumes & Areas",
    blurbAr: "مجموعة من المجسمات الهندسية الأساسية (مكعب، كرة، أسطوانة، مخروط) لدراسة خصائصها وقوانين حسابها.",
    subjectAr: "الرياضيات",
    subjectEn: "Mathematics",
    emoji: "🧊",
    kind: "procedural-geometric-volumes",
  },
  {
    id: "orthographic-projection",
    titleAr: "الإسقاط العمودي (Orthographic Projection)",
    titleEn: "Orthographic Projection",
    blurbAr: "شاهد كيف تُسقط الأشكال الهندسية ثلاثية الأبعاد ظلالها على المستويات المتعامدة (الأمامي، الجانبي، والعلوي) لفهم العلاقة بين الفراغ والمستوى ثنائي الأبعاد.",
    subjectAr: "الرياضيات",
    subjectEn: "Mathematics",
    emoji: "📦",
    kind: "procedural-orthographic",
  },
  {
    id: "vectors-3d",
    titleAr: "المتجهات في الفضاء (Vectors in 3D)",
    titleEn: "Vectors in 3D Space",
    blurbAr: "تعرف على المتجهات رياضيا: الإحداثيات، الطول، وضعية السهم في فضاء ثلاثي الأبعاد مع تفاعل لتمثيل عمليات الجمع والضرب الاتجاهي.",
    subjectAr: "الرياضيات",
    subjectEn: "Mathematics",
    emoji: "↗️",
    kind: "procedural-vectors",
  },
  {
    id: "transformations",
    titleAr: "التحويلات الهندسية (Transformations)",
    titleEn: "Geometric Transformations",
    blurbAr: "مراقبة مستمرة وديناميكية لتأثير التحويلات الرياضية على الأجسام: الانسحاب، الدوران حول المحاور، والتكبير/التصغير التدريجي.",
    subjectAr: "الرياضيات",
    subjectEn: "Mathematics",
    emoji: "🔄",
    kind: "procedural-transformations",
  },
  {
    id: "statistics-probability",
    titleAr: "الإحصاء والاحتمالات (Statistics & Probability)",
    titleEn: "Statistics & Probability",
    blurbAr: "تجسيد بياني لمفاهيم الإحصاء وتوزيع الاحتمالات بطريقة مرئية مبهرة لفهم التوزيع الطبيعي والتباين.",
    subjectAr: "الرياضيات",
    subjectEn: "Mathematics",
    emoji: "📊",
    kind: "procedural-statistics",
  },
  {
    id: "sequences",
    titleAr: "المتتاليات الحسابية والهندسية (Sequences)",
    titleEn: "Arithmetic & Geometric Sequences",
    blurbAr: "مجسمات كتلية تتزايد تدريجياً لتعبر بشكل بصري عن الفرق بين المتتالية الحسابية والمتتالية الهندسية وتأثير الأساس على النمو.",
    subjectAr: "الرياضيات",
    subjectEn: "Mathematics",
    emoji: "📈",
    kind: "procedural-sequences",
  },
  {
    id: "mathematical-logic",
    titleAr: "المنطق الرياضي (Mathematical Logic)",
    titleEn: "Mathematical Logic",
    blurbAr: "أشكال ڤن (Venn Diagrams) شفافة ومضيئة لتوضيح العمليات المنطقية مثل التقاطع (AND) والاتحاد (OR) والفرق (NOT).",
    subjectAr: "الرياضيات",
    subjectEn: "Mathematics",
    emoji: "🧠",
    kind: "procedural-logic",
  },
  {
    id: "robot-meca",
    titleAr: "روبوت متحرك (هندسة ميكانيكية)",
    titleEn: "Mechanical Robot (Engineering)",
    blurbAr: "نموذج روبوت آلي (Mecha) يعرض مفاصل ميكانيكية وهندسة الروبوتات المعاصرة. يمكن استخدامه لتبسيط دراسة ميكانيكا الحركة والذكاء الاصطناعي.",
    subjectAr: "الرياضيات",
    subjectEn: "Mathematics",
    emoji: "🤖",
    kind: "gltf-artifact",
    gltfUrl: "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb"
  },
  {
    id: "robot-kinematics",
    titleAr: "رياضيات الروبوت (Kinematics)",
    titleEn: "Robot Kinematics",
    blurbAr: "استخدم الدوال المثلثية والمتجهات لبرمجة مسار الروبوت وتحريكه للوصول إلى الأهداف بدقة متناهية.",
    subjectAr: "الرياضيات",
    subjectEn: "Mathematics",
    emoji: "🧭",
    kind: "procedural-kinematics",
  },
  {
    id: "pythagorean-theorem",
    titleAr: "مبرهنة فيثاغورس — الإثبات البصري",
    titleEn: "Pythagorean Theorem — Visual Proof",
    blurbAr: "إثبات تفاعلي هندسي لعلاقة مساحات المربعات المنشأة على أضلاع المثلث القائم الزاوية.",
    subjectAr: "الرياضيات",
    subjectEn: "Mathematics",
    emoji: "📐",
    kind: "procedural-geometric-volumes"
  }
];

// ─────────────────────────────────────────────
// 🏛️  التاريخ (History)
// ─────────────────────────────────────────────
const HISTORY_LESSONS: LessonDef[] = [
  {
    id: "pyramid",
    titleAr: "أهرامات الجيزة",
    titleEn: "Pyramids of Giza",
    blurbAr:
      "نموذج هرم مصري ذهبي اللون مع تفاصيل حجرية واقعية. يدور ببطء ليكشف جميع أوجهه مع شبكة أرضية توضح مقياس الحجم. مدخل لدراسة الحضارة المصرية القديمة.",
    subjectAr: "التاريخ",
    subjectEn: "History",
    emoji: "🏛️",
    kind: "procedural-pyramid",
  },
  {
    id: "colosseum",
    titleAr: "مدرج الكولوسيوم الروماني",
    titleEn: "Roman Colosseum",
    blurbAr: "استكشف الكولوسيوم العظيم بتفاصيله المعمارية: الأقواس، المدرجات الداخلية، الساحة، والأنفاق السفلية.",
    subjectAr: "التاريخ",
    subjectEn: "History",
    emoji: "🏟️",
    kind: "procedural-colosseum",
  },
  {
    id: "carthage",
    titleAr: "آثار قرطاج القديمة",
    titleEn: "Ruins of Carthage",
    blurbAr: "جولة خيالية بين أعمدة قرطاج الرومانية، بقايا الجدران، والأرضيات الحجرية التي تروي قصصاً من الماضي.",
    subjectAr: "التاريخ",
    subjectEn: "History",
    emoji: "🏛️",
    kind: "procedural-carthage",
  },
  {
    id: "kairouan",
    titleAr: "المدينة العتيقة بالقيروان",
    titleEn: "Great Mosque of Kairouan",
    blurbAr: "جامع عقبة بن نافع التاريخي بمئذنته الفريدة وقبته وفنائه الداخلي المزين بالأقواس.",
    subjectAr: "التاريخ",
    subjectEn: "History",
    emoji: "🕌",
    kind: "procedural-kairouan",
  },
  {
    id: "antique-camera",
    titleAr: "الكاميرا التاريخية الأولى (مجسم 3D واقعي)",
    titleEn: "First Antique Camera",
    blurbAr: "استكشف أولى الكاميرات الأثرية عبر مسح ضوئي عالي الدقة. لاحظ التفاصيل المذهلة لنسيج الخشب، لمعان النحاس، وعدسة الزجاج مع إضاءة الاستوديو الواقعية.",
    subjectAr: "التاريخ",
    subjectEn: "History",
    emoji: "📸",
    kind: "gltf-artifact",
    gltfUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/AntiqueCamera/glTF-Binary/AntiqueCamera.glb"
  },
  {
    id: "damaged-helmet",
    titleAr: "خوذة محارب قديمة (تفاعل ضوئي PBR)",
    titleEn: "Ancient Warrior Helmet",
    blurbAr: "دراسة مذهلة للأسلحة التاريخية من خلال خوذة متضررة. يعرض هذا المجسم أعلى جودة للـ PBR، لتشعر ببرودة المعدن وواقعية الصدأ والخدوش وكأنها أمامك مباشرة.",
    subjectAr: "التاريخ",
    subjectEn: "History",
    emoji: "🪖",
    kind: "gltf-artifact",
    gltfUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb"
  },
  {
    id: "flight-helmet",
    titleAr: "خوذة طيار عسكري (مسح ضوئي حقيقي)",
    titleEn: "Vintage Flight Helmet",
    blurbAr: "خوذة طيار حربي حقيقية معروضة على حامل خشبي. مسح ضوئي عالي الدقة يكشف عن طبقات الجلد والنسيج والمعدن بواقعية مذهلة.",
    subjectAr: "التاريخ",
    subjectEn: "History",
    emoji: "🪖",
    kind: "gltf-artifact",
    gltfUrl: "https://raw.GithubUserContent.com/KhronosGroup/glTF-Sample-Assets/main/Models/FlightHelmet/glTF-Binary/FlightHelmet.glb"
  },
  {
    id: "mosquito-amber",
    titleAr: "حشرة محفوظة في الكهرمان (عصور ما قبل التاريخ)",
    titleEn: "Mosquito in Amber (Prehistoric)",
    blurbAr: "بعوضة محفوظة في قطعة كهرمان شفافة منذ ملايين السنين. يستخدم تأثيرات الشفافية والحجم لإظهار الضوء يخترق الكهرمان بواقعية مذهلة.",
    subjectAr: "التاريخ",
    subjectEn: "History",
    emoji: "🦟",
    kind: "gltf-artifact",
    gltfUrl: "https://raw.GithubUserContent.com/KhronosGroup/glTF-Sample-Assets/main/Models/MosquitoInAmber/glTF-Binary/MosquitoInAmber.glb"
  },
  {
    id: "scattering-skull",
    titleAr: "جمجمة بشرية أثرية (مسح ضوئي واقعي)",
    titleEn: "Archaeological Human Skull",
    blurbAr: "جمجمة بشرية عالية الدقة مع تأثير تشتت الضوء تحت السطح مما يمنحها مظهراً واقعياً مرعباً كأنها قطعة أثرية من متحف حقيقي.",
    subjectAr: "التاريخ",
    subjectEn: "History",
    emoji: "💀",
    kind: "gltf-artifact",
    gltfUrl: "https://raw.GithubUserContent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ScatteringSkull/glTF-Binary/ScatteringSkull.glb"
  },
  {
    id: "lantern",
    titleAr: "فانوس الشارع القديم (حقبة ما قبل الكهرباء)",
    titleEn: "Antique Street Lantern",
    blurbAr: "فانوس شارع خشبي قديم بدقة عالية جداً. يحكي قصة الإنارة قبل اختراع الكهرباء مع تفاصيل الصدأ والخشب المتآكل.",
    subjectAr: "التاريخ",
    subjectEn: "History",
    emoji: "🏮",
    kind: "gltf-artifact",
    gltfUrl: "https://raw.GithubUserContent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Lantern/glTF-Binary/Lantern.glb"
  },
  {
    id: "toy-car",
    titleAr: "سيارة لعبة أثرية (صناعات القرن العشرين)",
    titleEn: "Vintage Toy Car (20th Century)",
    blurbAr: "نموذج سيارة لعبة معدنية بتقنيات الشفافية واللمعان. يوضح التقنيات الصناعية في القرن العشرين عبر طلاء شفاف وعجلات مطاطية واقعية.",
    subjectAr: "التاريخ",
    subjectEn: "History",
    emoji: "🚗",
    kind: "gltf-artifact",
    gltfUrl: "https://raw.GithubUserContent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ToyCar/glTF-Binary/ToyCar.glb"
  },
  {
    id: "dragon-attenuation",
    titleAr: "تنين كريستالي (أساطير الحضارات القديمة)",
    titleEn: "Crystal Dragon (Ancient Myths)",
    blurbAr: "تنين كريستالي شفاف بتأثيرات الحجم والانكسار. يستخدم لدراسة أساطير التنانين عبر الحضارات مع عرض مبهر لتقنيات الإضاءة.",
    subjectAr: "التاريخ",
    subjectEn: "History",
    emoji: "🐉",
    kind: "gltf-artifact",
    gltfUrl: "https://raw.GithubUserContent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DragonAttenuation/glTF-Binary/DragonAttenuation.glb"
  },
  {
    id: "chess-set",
    titleAr: "طقم شطرنج كلاسيكي (استراتيجيات الحرب التاريخية)",
    titleEn: "Classic Chess Set (Historical War Strategy)",
    blurbAr: "طقم شطرنج كريستالي فاخر بشفافية وحجم واقعي. يدرّس استراتيجيات الحرب والتخطيط العسكري عبر التاريخ من خلال هذه اللعبة الملكية.",
    subjectAr: "التاريخ",
    subjectEn: "History",
    emoji: "♟️",
    kind: "gltf-artifact",
    gltfUrl: "https://raw.GithubUserContent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ABeautifulGame/glTF-Binary/ABeautifulGame.glb"
  },
  {
    id: "water-bottle",
    titleAr: "قنينة ماء معدنية (اختراعات حديثة)",
    titleEn: "Metal Water Bottle (Modern Inventions)",
    blurbAr: "قنينة ماء معدنية بتقنية PBR عالية الدقة تعرض انعكاسات المعدن والألوان بواقعية مذهلة.",
    subjectAr: "التاريخ",
    subjectEn: "History",
    emoji: "🫗",
    kind: "gltf-artifact",
    gltfUrl: "https://raw.GithubUserContent.com/KhronosGroup/glTF-Sample-Assets/main/Models/WaterBottle/glTF-Binary/WaterBottle.glb"
  },
  {
    id: "traditional-canoe",
    titleAr: "قارب تقليدي محفور (تاريخ الشعوب)",
    titleEn: "Traditional Carved Canoe",
    blurbAr: "نموذج مفصل لقارب كانو خشبي محفور بالطرق التقليدية. يستخدم لدراسة تاريخ الشعوب الأصلية وطرق التنقل القديمة عبر الأنهار والمحيطات.",
    subjectAr: "التاريخ",
    subjectEn: "History",
    emoji: "🛶",
    kind: "gltf-artifact",
    gltfUrl: "https://modelviewer.dev/shared-assets/models/Canoe.glb"
  },
  {
    id: "vintage-computer",
    titleAr: "جهاز حاسوب قديم (تاريخ التكنولوجيا)",
    titleEn: "Vintage Computer (Tech History)",
    blurbAr: "حاسوب طراز الثمانينات (Vintage). يوثق هذا النموذج بدايات دخول الحواسيب الشخصية والتكنولوجيا التي غيرت وجه العالم.",
    subjectAr: "التاريخ",
    subjectEn: "History",
    emoji: "🖥️",
    kind: "gltf-artifact",
    gltfUrl: "https://modelviewer.dev/shared-assets/models/SpacemacV.glb"
  },
  {
    id: "world-war-trenches",
    titleAr: "خنادق الحرب العالمية",
    titleEn: "World War Trenches",
    blurbAr: "استكشف جبهات القتال في شكل خنادق محصنة خلال مجريات الحرب العالمية الأولى والثانية.",
    subjectAr: "التاريخ",
    subjectEn: "History",
    emoji: "🎖️",
    kind: "procedural-pyramid"
  }
];

// ─────────────────────────────────────────────
// 🗣️  اللغات (Languages)
// ─────────────────────────────────────────────
const LANGUAGES_LESSONS: LessonDef[] = [
  {
    id: "arabic-letters",
    titleAr: "الحروف الأبجدية 3D",
    titleEn: "3D Arabic Alphabet",
    blurbAr: "حروف عربية ثلاثية الأبعاد تطفو في الفضاء مع تأثيرات متوهجة وتفاعلية بصرية ممتعة.",
    subjectAr: "اللغات",
    subjectEn: "Languages",
    emoji: "أ",
    kind: "procedural-arabic-letters",
  },
  {
    id: "vocal-anatomy",
    titleAr: "مخارج الحروف الصوتية",
    titleEn: "Vocal Anatomy & Sounds",
    blurbAr: "مقطع تشريحي لجهاز النطق البشري يوضح مواضع خروج الأصوات، من الأحبال الصوتية إلى الشفاه.",
    subjectAr: "اللغات",
    subjectEn: "Languages",
    emoji: "🗣️",
    kind: "procedural-vocal-anatomy",
  },
  {
    id: "room-objects",
    titleAr: "مفردات الغرفة",
    titleEn: "Room Vocabulary",
    blurbAr: "تعلم المفردات الأساسية عبر استكشاف عناصر الغرفة ثلاثية الأبعاد (طاولة، كرسي، كتاب، ساعة...).",
    subjectAr: "اللغات",
    subjectEn: "Languages",
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
    titleEn: "The Color Wheel",
    blurbAr: "عجلة تفاعلية تدمج الألوان الأساسية، الثانوية، والثالثية، مع تمثيل للتشبع والسطوع في الفضاء.",
    subjectAr: "الفنون",
    subjectEn: "Art",
    emoji: "🎨",
    kind: "procedural-color-wheel",
  },
  {
    id: "pottery",
    titleAr: "الخزف والنحت",
    titleEn: "Pottery & Sculpting",
    blurbAr: "محاكاة لقرص الخزاف وصناعة الأواني الفخارية بتفاصيل تقليدية وملامس طينية واقعية.",
    subjectAr: "الفنون",
    subjectEn: "Art",
    emoji: "🏺",
    kind: "procedural-pottery",
  },
  {
    id: "painting",
    titleAr: "اللوحات الكلاسيكية",
    titleEn: "Classic Paintings",
    blurbAr: "تجربة فنية داخل إطار كلاسيكي مذهب يعرض لوحة ألوان عميقة تتفاعل مع إضاءة المعرض.",
    subjectAr: "الفنون",
    subjectEn: "Art",
    emoji: "🖼️",
    kind: "procedural-painting",
  },
  {
    id: "satellite-outernet",
    titleAr: "قمر صناعي مصغر (علوم وتقنية)",
    titleEn: "Miniature Satellite (Tech & Science)",
    blurbAr: "نموذج لمركبة ساتل (قمر صناعي صغير) تستخدم لبث البيانات. يعرض أجزاء المركبة مثل الألواح الشمسية والهوائيات.",
    subjectAr: "الفنون",
    subjectEn: "Art",
    emoji: "🛰️",
    kind: "gltf-artifact",
    gltfUrl: "https://modelviewer.dev/shared-assets/models/Outernet.glb"
  },
  {
    id: "modern-shoe",
    titleAr: "تصميم المنتجات: حذاء تقني (مواد واقعية)",
    titleEn: "Product Design: Tech Shoe",
    blurbAr: "نموذج واقعي لحذاء رياضي يعرض خامات متعددة مثل الجلد والمطاط والنسيج. يستخدم لتدريس مبادئ تصميم المنتجات الصناعية الحديثة.",
    subjectAr: "الفنون",
    subjectEn: "Art",
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
    titleEn: "3D Model (Demo)",
    blurbAr:
      "ملف GLB حقيقي من مكتبة Three.js. جرّب النقر على أجزاء النموذج لمعرفة اسمها في البرمجة.",
    subjectAr: "تجربة تقنية",
    subjectEn: "Technical Demo",
    emoji: "🦆",
    kind: "gltf-url",
    gltfUrl: DEMO_GLTF_URL,
  },
  {
    id: "my-model",
    titleAr: "درسي: رفع نموذج",
    titleEn: "My Lesson: Upload Model",
    blurbAr:
      "ارفع ملف .glb أو .gltf من جهازك (مثلاً تصدير من Blender) واعرضه للتلاميذ.",
    subjectAr: "مخصص",
    subjectEn: "Custom",
    emoji: "📦",
    kind: "gltf-upload",
  },
];

// ─────────────────────────────────────────────
// ⚛️  الفيزياء (Physics)
// ─────────────────────────────────────────────
const PHYSICS_LESSONS: LessonDef[] = [
  {
    id: "newton-gravity",
    titleAr: "الجاذبية وقوانين نيوتن",
    titleEn: "Gravity & Newton's Laws",
    blurbAr: "تجسيد تفاعلي لقوانين الحركة والجاذبية الأرضية، مع إمكانية تجربة تسارع السقوط الحر.",
    subjectAr: "الفيزياء",
    subjectEn: "Physics",
    emoji: "🍎",
    kind: "procedural-atom"
  }
];

// ─────────────────────────────────────────────
//  القائمة الرئيسية المُصدَّرة
// ─────────────────────────────────────────────
export const LESSONS: LessonDef[] = [
  ...BIOLOGY_LESSONS,
  ...CHEMISTRY_LESSONS,
  ...PHYSICS_LESSONS,
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
