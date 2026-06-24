import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// --- DATABASE IN-MEMORY AND FILE LAYER ---
const DB_FILE = path.join(process.cwd(), "learnlog_db.json");

interface Entry {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  mood: string;
  summary: string;
  quality: number;
  coords: { x: number; y: number };
  createdAt: string;
}

interface DB {
  entries: Entry[];
  searchCount: number;
  chatMessages: { role: "user" | "model"; content: string; createdAt: string }[];
}

function loadDB(): DB {
  if (!fs.existsSync(DB_FILE)) {
    const defaultDB: DB = { entries: [], searchCount: 0, chatMessages: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2));
    return defaultDB;
  }
  try {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file, returning fresh instance:", err);
    return { entries: [], searchCount: 0, chatMessages: [] };
  }
}

function saveDB(db: DB) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error("Error writing database file:", err);
  }
}

// --- STREAK AND BADGE CALCULATION LOGIC ---
function calculateStreak(entries: Entry[]): number {
  if (entries.length === 0) return 0;

  // Group entries by calendar date string in YYYY-MM-DD (local date format)
  const uniqueDates = Array.from(
    new Set(
      entries.map((entry) => {
        const date = new Date(entry.createdAt);
        return date.toISOString().split("T")[0];
      })
    )
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // descending (most recent first)

  if (uniqueDates.length === 0) return 0;

  const todayStr = new Date().toISOString().split("T")[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  // If the most recent entry is neither today nor yesterday, streak is broken (0)
  const mostRecent = uniqueDates[0];
  if (mostRecent !== todayStr && mostRecent !== yesterdayStr) {
    return 0;
  }

  let streak = 0;
  let currentDate = new Date(mostRecent);

  for (const dateStr of uniqueDates) {
    const d = new Date(dateStr);
    const diffTime = Math.abs(currentDate.getTime() - d.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      streak++;
      currentDate = d;
    } else {
      break;
    }
  }

  return streak;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: "🥉 Bronze" | "🥈 Silver" | "🥇 Gold";
  unlocked: boolean;
  unlockedAt?: string;
}

function calculateBadges(entries: Entry[], searchCount: number): Badge[] {
  const streak = calculateStreak(entries);
  const totalEntries = entries.length;

  const categories = entries.map((e) => e.category.toLowerCase().trim());
  const distinctCategories = Array.from(new Set(categories));

  const hasNebulaWriter = entries.some((e) => e.content.length >= 500);

  // Check if >= 10 entries in a single category
  const categoryCounts: Record<string, number> = {};
  for (const cat of categories) {
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }
  const hasConstellationMaker = Object.values(categoryCounts).some((count) => count >= 10);

  const badgesList: Badge[] = [
    {
      id: "first_light",
      name: "First Light",
      description: "Log your first learning entry to ignite your personal star.",
      icon: "🌟",
      tier: "🥉 Bronze",
      unlocked: totalEntries >= 1,
    },
    {
      id: "ignition",
      name: "Ignition",
      description: "Establish a 3-day learning streak. Thrusters at full power!",
      icon: "🔥",
      tier: "🥉 Bronze",
      unlocked: streak >= 3,
    },
    {
      id: "liftoff",
      name: "Liftoff",
      description: "Maintain a 7-day learning streak and break gravity.",
      icon: "🚀",
      tier: "🥈 Silver",
      unlocked: streak >= 7,
    },
    {
      id: "orbit",
      name: "Orbit Achieved",
      description: "Maintain a 14-day learning streak in stable orbit.",
      icon: "🛸",
      tier: "🥈 Silver",
      unlocked: streak >= 14,
    },
    {
      id: "comet",
      name: "Comet Trail",
      description: "Earn a legendary 30-day streak. Your drive is unstoppable.",
      icon: "☄️",
      tier: "🥇 Gold",
      unlocked: streak >= 30,
    },
    {
      id: "galaxy_brain",
      name: "Galaxy Brain",
      description: "Log 50 learning entries in your ship log.",
      icon: "🌌",
      tier: "🥇 Gold",
      unlocked: totalEntries >= 50,
    },
    {
      id: "planet_hopper",
      name: "Planet Hopper",
      description: "Explore 5 distinct learning categories.",
      icon: "🪐",
      tier: "🥈 Silver",
      unlocked: distinctCategories.length >= 5,
    },
    {
      id: "nebula_writer",
      name: "Nebula Writer",
      description: "Write an entry containing over 500 characters of deep detail.",
      icon: "🌊",
      tier: "🥉 Bronze",
      unlocked: hasNebulaWriter,
    },
    {
      id: "space_scanner",
      name: "Deep Space Scanner",
      description: "Perform 10 semantic database searches to find connections.",
      icon: "🔭",
      tier: "🥈 Silver",
      unlocked: searchCount >= 10,
    },
    {
      id: "constellation_maker",
      name: "Constellation Maker",
      description: "Map 10 stars inside a single learning category.",
      icon: "⭐",
      tier: "🥈 Silver",
      unlocked: hasConstellationMaker,
    },
    {
      id: "supernova",
      name: "Supernova",
      description: "Reach 100 stellar entries in your knowledge galaxy.",
      icon: "💫",
      tier: "🥇 Gold",
      unlocked: totalEntries >= 100,
    },
    {
      id: "world_builder",
      name: "World Builder",
      description: "Log entries across 10 distinct knowledge realms.",
      icon: "🌍",
      tier: "🥇 Gold",
      unlocked: distinctCategories.length >= 10,
    },
  ];

  return badgesList;
}

// --- GEMINI AI CLIENT INITIALIZATION ---
let ai: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required. Configure it in settings.");
    }
    ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return ai;
}

// --- API ROUTE HANDLERS ---

// Endpoint: GET /api/stats
app.get("/api/stats", (req, res) => {
  try {
    const dbData = loadDB();
    const total = dbData.entries.length;
    const streak = calculateStreak(dbData.entries);
    const badges = calculateBadges(dbData.entries, dbData.searchCount);
    const unlockedBadges = badges.filter((b) => b.unlocked).length;

    // Category breakdown
    const categoryCounts: Record<string, number> = {};
    for (const entry of dbData.entries) {
      const cat = entry.category || "General";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }

    res.json({
      totalEntries: total,
      currentStreak: streak,
      searchCount: dbData.searchCount,
      badgesUnlocked: unlockedBadges,
      totalBadges: badges.length,
      categoryCounts,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: POST /api/entries (Create new entry with AI analysis)
app.post("/api/entries", async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    res.status(400).json({ error: "Title and content are required fields." });
    return;
  }

  try {
    const gemini = getGemini();

    const prompt = `Analyze this learning journal entry and return details in JSON.
Title: "${title}"
Content: "${content}"

Your analysis MUST strictly follow this JSON schema structure:
{
  "category": "A single high-level category representing this learning, e.g., Tech, Science, Astronomy, Language, Business, Philosophy, Art, History, General",
  "tags": ["3 to 5 key concepts or topics learned as short strings, e.g., 'React Hooks', 'Photosynthesis', 'Quantum Physics'"],
  "mood": "A single representative emoji (e.g. 🧠, 🚀, 🤔, 💡, 🔥, 🌱, 🎨, 🧪, 🪐) indicating the user's emotion or sentiment from writing",
  "summary": "A concise 1-2 sentence smart summary of what was learned",
  "quality": 1-5, // Quality score of the entry depth (1 is basic or extremely short, 5 is deeply reflective with examples and explanations)
  "coords": {
    "x": -100 to 100, // Semantic coordinates on a 2D map (-100 to 100).
    "y": -100 to 100  // Similar categories/tags should cluster together naturally (e.g., Tech/Web dev near x=50, y=50, Physics/Science near x=-50, y=-50, Languages near x=-30, y=80, etc.)
  }
}`;

    const response = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const aiResultText = response.text;
    if (!aiResultText) {
      throw new Error("Empty response from Gemini AI.");
    }

    const analysis = JSON.parse(aiResultText.trim());

    const dbData = loadDB();
    const newEntry: Entry = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      content,
      category: analysis.category || "General",
      tags: analysis.tags || [],
      mood: analysis.mood || "📝",
      summary: analysis.summary || "No summary generated.",
      quality: Number(analysis.quality) || 3,
      coords: analysis.coords || { x: (Math.random() - 0.5) * 150, y: (Math.random() - 0.5) * 150 },
      createdAt: new Date().toISOString(),
    };

    dbData.entries.unshift(newEntry); // Prepend to show latest first
    saveDB(dbData);

    res.json(newEntry);
  } catch (error: any) {
    console.error("Error analyzing entry:", error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: POST /api/entries/preview (Live preview analysis without saving)
app.post("/api/entries/preview", async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    res.status(400).json({ error: "Title and content are required for preview." });
    return;
  }

  try {
    const gemini = getGemini();

    const prompt = `Analyze this learning journal entry and return details in JSON for a live preview.
Title: "${title}"
Content: "${content}"

Your analysis MUST strictly follow this JSON schema structure:
{
  "category": "Category label",
  "tags": ["tag1", "tag2", "tag3"],
  "mood": "Emoji string",
  "summary": "1-2 sentence summary",
  "quality": 1-5,
  "coords": { "x": -100 to 100, "y": -100 to 100 }
}`;

    const response = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const aiResultText = response.text;
    if (!aiResultText) {
      throw new Error("No response text from Gemini.");
    }

    res.json(JSON.parse(aiResultText.trim()));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: GET /api/entries (Retrieve all entries, with optional semantic search)
app.get("/api/entries", async (req, res) => {
  const { q } = req.query;
  try {
    const dbData = loadDB();

    if (!q) {
      res.json(dbData.entries);
      return;
    }

    // --- SEMANTIC SEARCH VIA GEMINI ---
    const queryStr = String(q).trim();
    if (queryStr.length === 0 || dbData.entries.length === 0) {
      res.json(dbData.entries);
      return;
    }

    // Increment searchCount for search badge
    dbData.searchCount = (dbData.searchCount || 0) + 1;
    saveDB(dbData);

    const gemini = getGemini();
    const searchContext = dbData.entries.map((e) => ({
      id: e.id,
      title: e.title,
      summary: e.summary,
      category: e.category,
      tags: e.tags,
    }));

    const prompt = `You are a semantic search ranking engine. The user has queried your database of learning entries for: "${queryStr}".

Here are the entries in the database:
${JSON.stringify(searchContext, null, 2)}

Evaluate and rank these entries based on how semantically relevant they are to the user's query (understanding synonyms, intent, e.g. "databases" should match SQL, MongoDB, index etc.).
Return a JSON array containing only the IDs of the ranked entries, from most relevant to least relevant. Only include entries that have a clear relevance or connection to the query. If an entry is completely irrelevant, exclude it from the list.

Format strictly as a JSON list of strings (IDs): ["id1", "id2"]`;

    const response = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const aiResultText = response.text;
    if (!aiResultText) {
      res.json([]);
      return;
    }

    const rankedIds: string[] = JSON.parse(aiResultText.trim());

    // Map back to full entries, keeping the ranked order
    const rankedEntries = rankedIds
      .map((id) => dbData.entries.find((e) => e.id === id))
      .filter((e): e is Entry => !!e);

    // If Gemini returns nothing but some matches exists in keywords, let's include fallback
    if (rankedEntries.length === 0) {
      const fallback = dbData.entries.filter(
        (e) =>
          e.title.toLowerCase().includes(queryStr.toLowerCase()) ||
          e.content.toLowerCase().includes(queryStr.toLowerCase()) ||
          e.category.toLowerCase().includes(queryStr.toLowerCase()) ||
          e.tags.some((t) => t.toLowerCase().includes(queryStr.toLowerCase()))
      );
      res.json(fallback);
    } else {
      res.json(rankedEntries);
    }
  } catch (error: any) {
    console.error("Semantic search error:", error);
    // Return standard search fallback
    const dbData = loadDB();
    const queryStr = String(q).toLowerCase();
    const fallback = dbData.entries.filter(
      (e) =>
        e.title.toLowerCase().includes(queryStr) ||
        e.content.toLowerCase().includes(queryStr) ||
        e.category.toLowerCase().includes(queryStr) ||
        e.tags.some((t) => t.toLowerCase().includes(queryStr))
    );
    res.json(fallback);
  }
});

// Endpoint: GET /api/entries/:id (Retrieve specific entry + AI related entries)
app.get("/api/entries/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const dbData = loadDB();
    const entry = dbData.entries.find((e) => e.id === id);

    if (!entry) {
      res.status(404).json({ error: "Entry not found in logs." });
      return;
    }

    // Find other entries that are semantically or category-wise related
    const otherEntries = dbData.entries.filter((e) => e.id !== id);
    let related: Entry[] = [];

    if (otherEntries.length > 0) {
      // Find related entries based on category and tags overlap, take top 3
      related = otherEntries
        .map((e) => {
          let score = 0;
          if (e.category.toLowerCase() === entry.category.toLowerCase()) score += 5;
          const intersection = e.tags.filter((t) => entry.tags.includes(t));
          score += intersection.length * 2;
          return { entry: e, score };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((item) => item.entry)
        .slice(0, 3);
    }

    res.json({ entry, related });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: DELETE /api/entries/:id
app.delete("/api/entries/:id", (req, res) => {
  const { id } = req.params;
  try {
    const dbData = loadDB();
    const initialLength = dbData.entries.length;
    dbData.entries = dbData.entries.filter((e) => e.id !== id);

    if (dbData.entries.length === initialLength) {
      res.status(404).json({ error: "Entry not found." });
      return;
    }

    saveDB(dbData);
    res.json({ success: true, message: "Star dissolved into the cosmic void." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: GET /api/badges
app.get("/api/badges", (req, res) => {
  try {
    const dbData = loadDB();
    const badges = calculateBadges(dbData.entries, dbData.searchCount);
    res.json(badges);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: GET /api/quiz (AI generates a quiz based on random past learnings)
app.get("/api/quiz", async (req, res) => {
  try {
    const dbData = loadDB();
    if (dbData.entries.length < 2) {
      res.status(400).json({
        error: "Insufficient entries. You must create at least 2 learning entries (stars) before the AI can generate custom quizzes for you.",
      });
      return;
    }

    const gemini = getGemini();

    // Send a sample of up to 10 random entries for context
    const shuffled = [...dbData.entries].sort(() => 0.5 - Math.random());
    const sampleEntries = shuffled.slice(0, 10).map((e) => ({
      id: e.id,
      title: e.title,
      content: e.content,
      category: e.category,
    }));

    const prompt = `Based on the following learning log history, generate a 5-question multiple choice quiz to test the user's retention of what they have learned.
Entries context:
${JSON.stringify(sampleEntries, null, 2)}

Your response MUST follow exactly this JSON array of objects schema:
[
  {
    "question": "The question text, based on actual facts, code, or ideas learned in the entries",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "The exact string of the correct option matching one of the options",
    "explanation": "A short, helpful explanation of why this answer is correct",
    "sourceTitle": "Title of the learning entry this question is derived from",
    "sourceId": "The ID of the learning entry"
  }
]`;

    const response = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const aiResultText = response.text;
    if (!aiResultText) {
      throw new Error("No response from Gemini API for quiz generation.");
    }

    const quiz = JSON.parse(aiResultText.trim());
    res.json(quiz);
  } catch (error: any) {
    console.error("Quiz generation error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: GET /api/insights/gaps-and-recommend
app.get("/api/insights/gaps-and-recommend", async (req, res) => {
  try {
    const dbData = loadDB();
    if (dbData.entries.length === 0) {
      res.json({ gaps: [], recommendations: [] });
      return;
    }

    const gemini = getGemini();
    const context = dbData.entries.slice(0, 15).map((e) => ({
      title: e.title,
      category: e.category,
      tags: e.tags,
      summary: e.summary,
    }));

    const prompt = `Analyze this user's learning log entries to find critical knowledge gaps and recommend next steps.
Entries:
${JSON.stringify(context, null, 2)}

Your response MUST be in JSON format matching this schema:
{
  "gaps": [
    {
      "topic": "Concept name",
      "reason": "Why this is identified as a gap, based on the entries",
      "suggestion": "Actionable learning recommendation"
    }
  ],
  "recommendations": [
    {
      "topic": "Suggested topic to study next",
      "why": "Why this follows naturally from what they already learned",
      "difficulty": "Beginner | Intermediate | Advanced"
    }
  ]
}`;

    const response = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const aiResultText = response.text;
    if (!aiResultText) {
      res.json({ gaps: [], recommendations: [] });
      return;
    }

    res.json(JSON.parse(aiResultText.trim()));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: GET /api/insights/patterns
app.get("/api/insights/patterns", async (req, res) => {
  try {
    const dbData = loadDB();
    if (dbData.entries.length === 0) {
      res.json({
        topCategories: [],
        learningVelocity: "Launching",
        depthVsBreadth: "Awaiting flight entry logs...",
        recentTrends: "Start logging your learnings to chart patterns.",
      });
      return;
    }

    const gemini = getGemini();
    const context = dbData.entries.slice(0, 15).map((e) => ({
      title: e.title,
      category: e.category,
      tags: e.tags,
      quality: e.quality,
    }));

    const prompt = `Analyze this user's learning entries for trends and statistics.
Entries:
${JSON.stringify(context, null, 2)}

Your response MUST be in JSON format matching this schema:
{
  "topCategories": [{"category": "Name", "count": 12}],
  "learningVelocity": "Fast-paced | Steady | Occasional | Launching",
  "depthVsBreadth": "A short sentence describing if they are diving deep into one topic or exploring broadly",
  "recentTrends": "A summary of their recent week's learning behavior"
}`;

    const response = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const aiResultText = response.text;
    if (!aiResultText) {
      res.json({
        topCategories: [],
        learningVelocity: "Steady",
        depthVsBreadth: "Deep-diving",
        recentTrends: "Active exploration",
      });
      return;
    }

    res.json(JSON.parse(aiResultText.trim()));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: GET /api/insights/briefing (AI written space themed weekly briefing)
app.get("/api/insights/briefing", async (req, res) => {
  try {
    const dbData = loadDB();
    const streak = calculateStreak(dbData.entries);
    const badges = calculateBadges(dbData.entries, dbData.searchCount);
    const unlockedBadges = badges.filter((b) => b.unlocked).map((b) => b.name).join(", ");

    if (dbData.entries.length === 0) {
      res.json({
        title: "Cadet Pre-Launch Briefing",
        statusReport: "Welcome to LearnLog AI, Cadet! Your dashboard is active and ready. To unlock your first constellation briefing, log your first learning breakthrough on the Star Creator console.",
        breakthroughs: ["No breakthrough recorded yet"],
        gapsInChart: "All sectors are uncharted. Launch your first entry!",
        commanderNotes: "The galaxy of knowledge awaits. Write what you learn, and we will map your stars.",
      });
      return;
    }

    const gemini = getGemini();
    const context = dbData.entries.slice(0, 10).map((e) => ({
      title: e.title,
      category: e.category,
      summary: e.summary,
      createdAt: e.createdAt,
    }));

    const prompt = `Generate a Space-themed "Weekly Mission Briefing" for a space cadet's learning journal. Talk in a professional, encouraging cosmic tone ("Ship Log", "Supernova Achievements", "Celestial Coordinates").
Learning Entries:
${JSON.stringify(context, null, 2)}
Current Streak: ${streak} days
Badges Earned: ${unlockedBadges || "First Light (In Progress)"}

Your response MUST be in JSON format matching this schema:
{
  "title": "Cosmic title, e.g., 'Sector 4 Exploration Briefing'",
  "statusReport": "Current status of their learning journey (warm, motivating, using space terminology)",
  "breakthroughs": ["List of 2-3 key learning milestones or achievements this week"],
  "gapsInChart": "Description of uncharted sectors (concepts they should explore next)",
  "commanderNotes": "A professional encouraging note from the AI Flight Commander"
}`;

    const response = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const aiResultText = response.text;
    if (!aiResultText) {
      throw new Error("No briefing generated.");
    }

    res.json(JSON.parse(aiResultText.trim()));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: POST /api/chat (Interact with the cosmic central intelligence)
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) {
    res.status(400).json({ error: "Message is required." });
    return;
  }

  try {
    const dbData = loadDB();
    const gemini = getGemini();

    const historyForAi = dbData.entries.map((e) => ({
      title: e.title,
      content: e.content,
      category: e.category,
      tags: e.tags,
      summary: e.summary,
      createdAt: e.createdAt,
    }));

    // Keep chat history in memory or DB
    const chatHistory = dbData.chatMessages || [];

    const prompt = `You are LearnLog AI, the central cosmic intelligence of this user's learning galaxy. 
Answer the user's questions based on their real learning history, references, and dates. 
Always remain cosmic, encouraging, professional, and directly reference specific learning entries and dates.
If the user asks about something they haven't logged, explain politely that it hasn't been mapped in their constellation yet, but encourage them to log a new entry about it.

Learning History Context:
${JSON.stringify(historyForAi, null, 2)}

User Message: "${message}"
Previous Chat History:
${JSON.stringify(chatHistory.slice(-10), null, 2)}`;

    const response = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const aiResponseText = response.text || "Central systems encountered a slight orbit drift. Please retransmit your query.";

    // Save message pair
    const userMsg = { role: "user" as const, content: message, createdAt: new Date().toISOString() };
    const modelMsg = { role: "model" as const, content: aiResponseText, createdAt: new Date().toISOString() };

    dbData.chatMessages = dbData.chatMessages || [];
    dbData.chatMessages.push(userMsg, modelMsg);
    saveDB(dbData);

    res.json({ response: aiResponseText, chatHistory: dbData.chatMessages });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: GET /api/chat (Retrieve chat history)
app.get("/api/chat", (req, res) => {
  try {
    const dbData = loadDB();
    res.json(dbData.chatMessages || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: POST /api/chat/clear (Reset chat logs)
app.post("/api/chat/clear", (req, res) => {
  try {
    const dbData = loadDB();
    dbData.chatMessages = [];
    saveDB(dbData);
    res.json({ success: true, message: "Subspace communications logs cleared." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- VITE DEV AND STATIC FILE SERVING LAYOUT ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[LearnLog Central Ground Control] Starship online at http://localhost:${PORT}`);
  });
}

startServer();
