# MetaLearning 🎓✨

> منصة التعليم التفاعلي ثلاثي الأبعاد المدعومة بالذكاء الاصطناعي

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://metalearning.app)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-r170-green)](https://threejs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-emerald)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org)

## ما هو MetaLearning؟

MetaLearning يحوّل الفصول الدراسية العادية إلى تجارب تعليمية غامرة ثلاثية الأبعاد. المعلمون يمكنهم:

- عرض أكثر من **30 نموذج علمي 3D تفاعلي** (الخلية الحيوانية، DNA، النظام الشمسي، القلب...)
- تحويل **أي صورة من الكتاب المدرسي** إلى نموذج 3D بالذكاء الاصطناعي
- مشاركة الدروس مع الطلاب عبر **رمز PIN أو QR Code**
- التفاعل مع النماذج **بتتبع اليدين** بدون أجهزة إضافية

## التقنيات المستخدمة

| Frontend | Backend | AI & 3D | Infrastructure |
|----------|---------|---------|----------------|
| React 18 + TypeScript | Express.js | Fal.ai (Stable Fast 3D) | Vercel |
| Three.js + R3F + Drei | Supabase (PostgreSQL) | Meshy (Fallback) | Supabase Auth |
| i18next (AR/EN/FR) | Paddle Payments | HuggingFace (Fallback) | |
| Vite | Node.js Serverless | MediaPipe Hands | |

## الميزات الرئيسية

### للمعلم 👨‍🏫
- **إنشاء درس** ← اختيار مادة ومستوى ← اختيار نموذج 3D ← مشاركة PIN/QR
- **لوحة التحكم** مع إحصائيات الدروس، الطلاب، والمادة الأكثر تدريساً
- **AI Lab** لتحويل الصور والنصوص إلى نماذج 3D بالذكاء الاصطناعي
- **إنهاء الجلسة** لإلغاء وصول الطلاب بضغطة واحدة

### للطالب 👨‍🎓
- **انضمام بالـ PIN** أو مسح رمز QR
- **مشاهدة النموذج 3D** والتفاعل معه بالماوس أو اللمس
- **AR Hand Tracking** — التفاعل بالإيماءات عبر كاميرا الويب
- **لوحة تتبع التقدم** مع سجل الدروس

### للمؤسسات 🏫
- حسابات متعددة للمعلمين
- Admin Dashboard مخصص
- تكامل مع Google Classroom
- دعم مخصص وامتثال GDPR

## البدء السريع

### المتطلبات
- Node.js 18+
- حساب [Supabase](https://supabase.com) مجاني
- حساب [Fal.ai](https://fal.ai) (للـ AI 3D generation)
- حساب [Paddle](https://paddle.com) (للمدفوعات — اختياري للتطوير)

### خطوات التثبيت

```bash
# 1. استنساخ المشروع
git clone https://github.com/your-username/metalearning.git
cd metalearning

# 2. تثبيت الحزم
npm install --legacy-peer-deps

# 3. إعداد متغيرات البيئة
cp .env.example .env
# افتح .env وأضف مفاتيحك

# 4. تشغيل بيئة التطوير (Frontend + Backend proxy في نفس الوقت)
npm run dev
```

### متغيرات البيئة المطلوبة

انظر [`.env.example`](.env.example) لقائمة كاملة. المتغيرات الأساسية:

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
FAL_API_KEY=Key xxx
```

## بنية المشروع

```
src/
├── pages/              ← صفحات التطبيق
│   ├── HomePage.tsx        ← الصفحة الرئيسية بالروبوت 3D
│   ├── AuthPage.tsx        ← تسجيل الدخول / Google OAuth
│   ├── TeacherDashboardPage.tsx  ← لوحة المعلم + wizard إنشاء الدرس
│   ├── StudentDashboardPage.tsx  ← لوحة الطالب + تاريخ الدروس
│   ├── LessonPage.tsx      ← عرض النموذج 3D + Hand Tracking
│   └── PricingPage.tsx     ← صفحة الأسعار + Paddle Checkout
│
├── components/
│   ├── lesson/         ← 30+ نموذج 3D تعليمي (Heart, DNA, Atom...)
│   ├── experience/     ← مكونات الـ AI Lab (GLTF, Image-to-3D...)
│   └── ThreeErrorBoundary.tsx  ← حماية من أعطال WebGL
│
├── services/
│   ├── supabaseClient.ts       ← إعداد Supabase + أنواع البيانات
│   ├── threeDGenerationService.ts  ← Fal → Meshy → HuggingFace fallback
│   ├── falImageTo3d.ts         ← تكامل Fal.ai
│   ├── meshyImageTo3d.ts       ← تكامل Meshy
│   └── huggingfaceImageTo3d.ts ← تكامل HuggingFace
│
├── contexts/
│   └── AuthContext.tsx  ← المصادقة + isPro flag
│
└── data/
    └── lessons.ts       ← قائمة الدروس الـ 30+ مع بياناتها

api/
├── fal/generate-3d.js  ← Vercel Function (مع Rate Limiting + CORS آمن)
└── paddle/
    └── webhook.js           ← Paddle Webhooks (تحديث plan في DB)

supabase/
└── rls_policies.sql    ← سياسات أمان قاعدة البيانات
```

## Global Setup Guide (Production Ready) 🌍

To deploy MetaLearning to the global market, ensure you have completed the following steps:

1. **Database Schema (Supabase)**:
   - Run the initial SQL script in `supabase/rls_policies.sql` in your Supabase SQL Editor.
   - Run the specific v7 migrations inside that file (`onboarding_done` column, `title_en` indexing, and `teacher_monthly_lessons` view).
   - Verify that your user profiles contain a `role` constraint limit for ('admin', 'creator', 'teacher', 'student').

2. **Vercel API Rewrites**:
   - The `vercel.json` ensures that legacy imports (or imports expecting specific file extensions) for the edge functions map properly to the built files on Vercel. 
   - Note that Paddle and Fal functions map to `api/<folder>/<filename>.js`.

3. **SEO & Indexing**:
   - Generate your `robots.txt` and `sitemap.xml` so search engines can crawl the platform.
   - We utilize `react-helmet-async` for deep dynamic meta tags on a per-lesson basis (social image previews, sharing).

4. **Webhooks**:
   - Add your live Vercel URL to your Paddle Webhook dashboard, pointing to `<url>/api/paddle/webhook` and configure `PADDLE_WEBHOOK_SECRET` in Vercel properly.

## الأمان 🔒

- **CORS محدود** — فقط النطاقات المصرح بها تصل لـ API
- **Rate Limiting** — 5 طلبات/يوم مجاناً، 50 للـ Pro
- **RLS Policies** — كل مستخدم يرى بياناته فقط في Supabase
- **Paddle Webhooks** — تحديث خطة المستخدم بعد الدفع بشكل آمن
- **Error Boundaries** — منع انهيار التطبيق عند أخطاء WebGL

## سير العمل

```
المعلم يدخل ← يختار مادة + مستوى ← يختار نموذج 3D ← يشاركه عبر PIN/QR
         ↓
الطالب يدخل PIN ← يشاهد النموذج ← يتفاعل بالماوس أو اليدين (AR)
```

## الترخيص

© 2024–2026 MetaLearning. جميع الحقوق محفوظة.

---

*صُنع بـ ❤️ لمعلمي ومتعلمي العالم العربي وما وراءه.*
