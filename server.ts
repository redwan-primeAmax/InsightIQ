import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const PROMPT_TEMPLATE = fs.readFileSync(path.join(process.cwd(), "analysis_prompt.txt"), "utf-8");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Helper to compute ground-truth cognitive scores based on telemetry
const computeScores = (telemetry: any) => {
  const scores = {
    focus: 0,
    memory: 0,
    spatial: 0,
    pattern: 0,
    impulse: 0,
    workingMemory: 0
  };

  if (!telemetry) return scores;

  // 1. Focus (Stroop)
  if (telemetry.stroop?.trials && telemetry.stroop.trials.length > 0) {
    const trials = telemetry.stroop.trials;
    const correct = trials.filter((t: any) => t.isCorrect).length;
    scores.focus = Math.round((correct / trials.length) * 100);
  } else {
    scores.focus = 0;
  }

  // 2. Memory (TileMatrix)
  if (telemetry.tileMatrix?.maxLevel > 0) {
    const maxLevel = telemetry.tileMatrix.maxLevel;
    // Tile Matrix max level can go high (e.g. 5+). Let's scale relative to level 8
    scores.memory = Math.round(Math.min((maxLevel / 8) * 100, 100));
  } else {
    scores.memory = 0;
  }

  // 3. Spatial (RotationMatch)
  if (telemetry.rotationMatch?.trials && telemetry.rotationMatch.trials.length > 0) {
    const trials = telemetry.rotationMatch.trials;
    const correct = trials.filter((t: any) => t.isCorrect).length;
    scores.spatial = Math.round((correct / trials.length) * 100);
  } else {
    scores.spatial = 0;
  }

  // 4. Pattern (GridContinuity)
  if (telemetry.gridContinuity?.trials && telemetry.gridContinuity.trials.length > 0) {
    const trials = telemetry.gridContinuity.trials;
    const correct = trials.filter((t: any) => t.isCorrect).length;
    scores.pattern = Math.round((correct / trials.length) * 100);
  } else {
    scores.pattern = 0;
  }

  // 5. Impulse (ReverseCommand)
  if (telemetry.reverseCommand?.trials && telemetry.reverseCommand.trials.length > 0) {
    const trials = telemetry.reverseCommand.trials;
    const correct = trials.filter((t: any) => t.isCorrect).length;
    scores.impulse = Math.round((correct / trials.length) * 100);
  } else {
    scores.impulse = 0;
  }

  // 6. WorkingMemory (ChimpTest)
  if (telemetry.chimpTest?.maxSpan > 0) {
    const maxSpan = telemetry.chimpTest.maxSpan;
    // Chimp starts at span 5. If they passed levels, maxSpan goes up.
    // Let's scale relative to span 10
    scores.workingMemory = Math.round(Math.min((maxSpan / 10) * 100, 100));
  } else {
    scores.workingMemory = 0;
  }

  return scores;
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoints
  app.post("/api/analyze", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ 
          error: "API key missing. Please ensure GEMINI_API_KEY is set in Settings > Secrets." 
        });
      }
      const { telemetry } = req.body;
      const computedScores = computeScores(telemetry);
      
      const isAllSkipped = Object.values(computedScores).every(score => score === 0);
      const totalScoreSum = Object.values(computedScores).reduce((a, b) => a + b, 0);
      const avgScore = totalScoreSum / 6;

      const prompt = PROMPT_TEMPLATE
        .replace(/{{telemetry}}/g, JSON.stringify(telemetry))
        .replace(/{{computedScores}}/g, JSON.stringify(computedScores));

      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              neuralArchitecture: {
                type: Type.OBJECT,
                properties: {
                  focus: { type: Type.NUMBER },
                  memory: { type: Type.NUMBER },
                  spatial: { type: Type.NUMBER },
                  pattern: { type: Type.NUMBER },
                  impulse: { type: Type.NUMBER },
                  workingMemory: { type: Type.NUMBER }
                },
                required: ["focus", "memory", "spatial", "pattern", "impulse", "workingMemory"]
              },
              archetype: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  icon: { type: Type.STRING }
                },
                required: ["name", "title", "description", "icon"]
              },
              deepProfile: { type: Type.STRING },
              bioHacks: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              percentile: { type: Type.NUMBER }
            },
            required: ["neuralArchitecture", "archetype", "deepProfile", "bioHacks", "percentile"]
          }
        }
      });

      const parsed = JSON.parse(response.text);
      
      // Forcefully overwrite scores and percentile to align exactly with programmatic validation
      parsed.neuralArchitecture = computedScores;
      if (isAllSkipped) {
        parsed.percentile = 0.0;
      } else {
        // Formulate a beautiful realistic percentile based on actual scores
        parsed.percentile = parseFloat(Math.min(99.9, Math.max(1.0, avgScore * 0.95 + 10)).toFixed(1));
      }

      res.json(parsed);
    } catch (error: any) {
      console.error("AI Analysis Error:", error);
      if (error.status === 403 || error.message?.includes("403")) {
        return res.status(403).json({ 
          error: "Gemini API-তে অ্যাক্সেস নেই। অনুগ্রহ করে Settings > Secrets প্যানেল থেকে আপনার API Key যাচাই করুন এবং নিশ্চিত করুন যে এটি একটি যথাযথ প্রজেক্টের সাথে যুক্ত।" 
        });
      }
      res.status(500).json({ error: "Analysis failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
