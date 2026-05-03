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
  | "local-model"
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
    kind: "gltf-artifact",
    gltfUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/AnatomyHeartSmall/glTF-Binary/AnatomyHeartSmall.glb",
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
    kind: "gltf-artifact",
    gltfUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/BarramundiFish/glTF-Binary/BarramundiFish.glb",
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
    kind: "gltf-artifact",
    gltfUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DiffuseTransmissionPlant/glTF-Binary/DiffuseTransmissionPlant.glb",
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
    kind: "gltf-artifact",
    gltfUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/BrainStem/glTF-Binary/BrainStem.glb",
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
    kind: "gltf-artifact",
    gltfUrl: "https://modelviewer.dev/shared-assets/models/NeilArmstrong.glb",
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
    kind: "gltf-artifact",
    gltfUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
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
    kind: "gltf-artifact",
    gltfUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/AntiqueCamera/glTF-Binary/AntiqueCamera.glb",
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
    kind: "gltf-artifact",
    gltfUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/WaterBottle/glTF-Binary/WaterBottle.glb",
  },
  
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
    kind: "gltf-artifact",
    gltfUrl: "https://modelviewer.dev/shared-assets/models/Outernet.glb",
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
    kind: "gltf-artifact",
    gltfUrl: "https://modelviewer.dev/shared-assets/models/Canoe.glb",
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
    kind: "gltf-artifact",
    gltfUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb",
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
    kind: "gltf-artifact",
    gltfUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Lantern/glTF-Binary/Lantern.glb",
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
    kind: "gltf-artifact",
    gltfUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Fox/glTF-Binary/Fox.glb",
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
    kind: "gltf-artifact",
    gltfUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ABeautifulGame/glTF-Binary/ABeautifulGame.glb",
  },
  {
    id: "colosseum",
    titleAr: "مدرج الكولوسيوم الروماني",
    titleEn: "Roman Colosseum",
    blurbAr: "استكشف الكولوسيوم العظيم بتفاصيله المعمارية: الأقواس، المدرجات الداخلية، الساحة، والأنفاق السفلية.",
    subjectAr: "التاريخ",
    subjectEn: "History",
    emoji: "🏟️",
    kind: "gltf-artifact",
    gltfUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/FlightHelmet/glTF-Binary/FlightHelmet.glb",
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
  
];

// ─────────────────────────────────────────────
// 🗣️  اللغات (Languages)
// ─────────────────────────────────────────────
const LANGUAGES_LESSONS: LessonDef[] = [
  
  
  
];

// ─────────────────────────────────────────────
// 🎨  الفنون (Art)
// ─────────────────────────────────────────────
const ART_LESSONS: LessonDef[] = [
  
  
  
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
