// api/generate-posts.js
// MetaLearning — AI Social Media Post Generator
// Vercel Serverless Function
// Usage: POST /api/generate-posts
// Body: { feature: string, platform: string, style: string, lang: string }

const FEATURES = {
  simulation_3d: {
    name: "3D Physics Simulation",
    description: "Real-time 3D chemistry lab with thermodynamics, pH tracking, and chemical reactions",
    proof: "Students can rotate, zoom, and interact with molecules in real time — no VR headset needed",
  },
  ai_tutor: {
    name: "AI Lab Assistant",
    description: "Context-aware AI that reads the student's lab state (beaker contents, temperature, pH) and gives scientific guidance",
    proof: "The AI knows what's in your virtual beaker and tells you what reaction to expect next",
  },
  quiz_3d: {
    name: "Live Quiz During 3D Lesson",
    description: "Teacher shares a PIN, students join, answer quizzes in real time while the 3D model is projected",
    proof: "28/30 students answered correctly in 12 seconds on average",
  },
  xp_leaderboard: {
    name: "XP & Global Leaderboard",
    description: "Students earn XP for correct quiz answers, level up, and compete on a global leaderboard",
    proof: "Engagement increased 3x when leaderboard was enabled in beta testing",
  },
  image_to_3d: {
    name: "Image to 3D in 30 Seconds",
    description: "Upload a textbook photo and AI converts it to an interactive 3D model",
    proof: "Works with biology diagrams, geometric shapes, and machine parts",
  },
  offline_access: {
    name: "Offline Learning Mode",
    description: "Download 3D models and lessons to use them without an internet connection in the classroom",
    proof: "Ensures no lesson is interrupted by poor connectivity",
  }
};

const PLATFORMS = {
  tiktok: { name: "TikTok", tone: "fast-paced, high energy, focus on visual hooks", format: "short video script + caption" },
  linkedin: { name: "LinkedIn", tone: "professional, thought leadership, educational value", format: "long-form post" },
  twitter: { name: "X (Twitter)", tone: "concise, punchy, curiosity-driven", format: "short tweet or thread" },
  instagram: { name: "Instagram", tone: "aesthetic, lifestyle-focused, community-driven", format: "reel script + caption" }
};

const STYLES = {
  educational: "Focus on how it helps teachers explain complex topics clearly",
  viral: "Focus on the 'magic' of 3D technology to stop the scroll",
  sales: "Focus on the value for money and limited time offer",
  story: "Focus on a student's 'aha!' moment using the tool"
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Simple security check (same as your proxy secret)
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.PROXY_CLIENT_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { feature, platform, style, lang = "english" } = req.body;

  if (!FEATURES[feature] || !PLATFORMS[platform] || !STYLES[style]) {
    return res.status(400).json({ error: 'Invalid parameters' });
  }

  const feat = FEATURES[feature];
  const plat = PLATFORMS[platform];
  const styl = STYLES[style];

  const prompt = `
    You are an expert social media marketer for MetaLearning, a revolutionary EdTech platform.
    Target Audience: Teachers and School Principals.
    
    PRODUCT FEATURE: ${feat.name}
    DESCRIPTION: ${feat.description}
    PROOF/RESULT: ${feat.proof}
    
    PLATFORM: ${plat.name} (Tone: ${plat.tone})
    STYLE: ${styl}
    LANGUAGE: ${lang}
    
    INSTRUCTIONS:
    1. Write a highly engaging ${plat.format}.
    2. Start with a powerful hook.
    3. Include a clear Call to Action (CTA) to visit metalearning.app
    4. Provide 5 relevant hashtags.
    5. Return JSON format: { "hook": "...", "content": "...", "hashtags": ["...", "..."] }
    
    IMPORTANT: Do not use generic corporate language. Use a relatable and exciting tone.
  `;

  try {
    const content = await callAI(prompt);
    return res.status(200).json(JSON.parse(content));
  } catch (err) {
    console.error("[PostGenerator] Error:", err);
    return res.status(500).json({ error: err.message });
  }
}

async function callAI(prompt) {
  try {
    const falKey = process.env.FAL_API_KEY;
    if (falKey) {
      const res = await fetch("https://fal.run/fal-ai/any-llm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Key ${falKey}`,
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.1-70b-instruct",
          prompt,
          max_tokens: 2000,
          temperature: 0.7,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.output || data.response || "";
      }
    }
  } catch (e) {
    console.warn("[PostGenerator] Fal.ai failed, trying HuggingFace:", e.message);
  }

  const hfRes = await fetch(
    "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inputs: prompt }),
    }
  );
  const data = await hfRes.json();
  return data[0]?.generated_text || "";
}
