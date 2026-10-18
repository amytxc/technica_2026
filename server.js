// Clawcean server: serves the game, proxies Gemini and ElevenLabs (so API keys never reach the browser),
// and keeps a shared leaderboard in data/leaderboard.json. No dependencies; Node 18+.
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");

// --- tiny .env loader ---
try {
  for (const line of fs.readFileSync(path.join(__dirname, ".env"), "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {}

const PORT = Number(process.env.PORT) || 3000;
const KEY = process.env.GEMINI_API_KEY || "";
const MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";
const EL_KEY = process.env.ELEVENLABS_API_KEY || "";
const EL_MODEL = process.env.ELEVENLABS_MODEL || "eleven_v4";
const PUBLIC = path.join(__dirname, "public");
const DATA = path.join(__dirname, "data");
const LB_FILE = path.join(DATA, "leaderboard.json");

// Ocean guides: each one has its own ElevenLabs voice and delivery. Premade voices work on every account;
// set ELEVENLABS_VOICE_<GUIDE> (e.g. ELEVENLABS_VOICE_PINCH) to swap in a voice from the Voice Library or Voice Design.
const GUIDES = {
  coral: { voice: "cgSgspJ2msm6clMCkdW9", settings: { stability: 0.4, similarity_boost: 0.75, style: 0.45, speed: 1.0 } },   // Jessica: playful, bright
  pinch: { voice: "N2lVS1w4EtoT3dr4eOWO", settings: { stability: 0.3, similarity_boost: 0.75, style: 0.7, speed: 1.05 } },   // Callum: husky trickster
  jelly: { voice: "SAz9YHcvj6GT2YYXdXww", settings: { stability: 0.6, similarity_boost: 0.7, style: 0.3, speed: 0.88 } },    // River: calm, neutral
  tuck:  { voice: "pqHfZKP75CvOlQylNhV4", settings: { stability: 0.55, similarity_boost: 0.75, style: 0.35, speed: 0.9 } },  // Bill: wise, old
  splash:{ voice: "FGY2WhTYpPnrIDTdsKH5", settings: { stability: 0.3, similarity_boost: 0.75, style: 0.65, speed: 1.08 } }   // Laura: sunny, quirky
};
for (const [id, g] of Object.entries(GUIDES)) { const v = process.env["ELEVENLABS_VOICE_" + id.toUpperCase()]; if (v) g.voice = v; }

const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".woff2": "font/woff2" };

// index.html is written as a page fragment (so it can also be published as a hosted artifact);
// wrap it in a standard document shell here.
const SHELL_HEAD = `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n`;

function send(res, status, body, type = "application/json") {
  res.writeHead(status, { "content-type": type, "cache-control": "no-store", "x-content-type-options": "nosniff" });
  res.end(typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}
function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on("data", c => { size += c.length; if (size > limit) { reject(new Error("too_large")); req.destroy(); } else chunks.push(c); });
    req.on("end", () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}")); } catch { reject(new Error("bad_json")); } });
    req.on("error", reject);
  });
}

// --- simple per-IP rate limit for Gemini calls ---
const hits = new Map();
function allowed(ip, max = 30, windowMs = 60_000) {
  const now = Date.now(); const arr = (hits.get(ip) || []).filter(t => now - t < windowMs);
  arr.push(now); hits.set(ip, arr); return arr.length <= max;
}

// --- leaderboard storage ---
function loadLb() { try { return JSON.parse(fs.readFileSync(LB_FILE, "utf8")); } catch { return []; } }
function saveLb(list) { fs.mkdirSync(DATA, { recursive: true }); fs.writeFileSync(LB_FILE, JSON.stringify(list, null, 2)); }
const clean = s => String(s || "").replace(/[<>\u0000-\u001f]/g, "").trim().slice(0, 20) || "Anonymous diver";

async function handleGemini(req, res) {
  if (!KEY) return send(res, 503, { error: "Gemini isn't configured on the server. Add GEMINI_API_KEY to .env." });
  const ip = req.socket.remoteAddress || "x";
  if (!allowed(ip)) return send(res, 429, { error: "Too many Gemini requests. Wait a minute and try again." });
  let body;
  try { body = await readBody(req, 8 * 1024 * 1024); } catch (e) { return send(res, 413, { error: e.message === "too_large" ? "Request is too large (8 MB max)." : "Invalid JSON." }); }
  // Only forward the fields we use.
  const payload = {
    contents: Array.isArray(body.contents) ? body.contents.slice(-14) : [],
    systemInstruction: body.systemInstruction,
    generationConfig: {
      temperature: Math.min(1, Math.max(0, Number(body.generationConfig?.temperature ?? 0.6))),
      maxOutputTokens: Math.min(4096, Number(body.generationConfig?.maxOutputTokens || 2048)),
      ...(body.generationConfig?.responseMimeType === "application/json" ? { responseMimeType: "application/json" } : {})
    }
  };
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`, {
      method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": KEY }, body: JSON.stringify(payload)
    });
    const text = await r.text();
    res.writeHead(r.status, { "content-type": "application/json", "cache-control": "no-store" });
    res.end(text);
  } catch (e) {
    send(res, 502, { error: "Couldn't reach Gemini: " + e.message });
  }
}

// --- ElevenLabs text-to-speech, cached in memory so replays and repeat lines cost no credits ---
const ttsCache = new Map(); let ttsCacheBytes = 0;
// ElevenLabs caps how many clips an account can generate at once, so extra requests wait in line here instead of failing with 429.
const TTS_CONCURRENCY = Number(process.env.ELEVENLABS_CONCURRENCY) || 2;
let ttsActive = 0; const ttsWaiting = [];
async function ttsSlot(fn) {
  while (ttsActive >= TTS_CONCURRENCY) await new Promise(r => ttsWaiting.push(r));
  ttsActive++;
  try { return await fn(); } finally { ttsActive--; const next = ttsWaiting.shift(); if (next) next(); }
}
function elevenLabs(voice, text, settings) {
  return ttsSlot(async () => {
    for (let attempt = 1; ; attempt++) {
      const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}?output_format=mp3_44100_128`, {
        method: "POST", headers: { "content-type": "application/json", "xi-api-key": EL_KEY },
        body: JSON.stringify({ text, model_id: EL_MODEL, voice_settings: settings })
      });
      if (r.status === 429 && attempt < 3) { await new Promise(res => setTimeout(res, 500 * attempt)); continue; }
      return r;
    }
  });
}
async function handleTts(req, res) {
  if (!EL_KEY) return send(res, 503, { error: "ElevenLabs isn't configured on the server. Add ELEVENLABS_API_KEY to .env." });
  const ip = req.socket.remoteAddress || "x";
  if (!allowed("tts:" + ip, 40)) return send(res, 429, { error: "Too many voice requests. Wait a minute and try again." });
  let b; try { b = await readBody(req, 16 * 1024); } catch { return send(res, 400, { error: "Invalid request." }); }
  const guide = GUIDES[b.guide] || GUIDES.coral;
  const text = String(b.text || "").replace(/\s+/g, " ").trim().slice(0, 1200);
  if (!text) return send(res, 400, { error: "No text." });
  const key = `${guide.voice}|${EL_MODEL}|${text}`;
  const hit = ttsCache.get(key);
  if (hit) { res.writeHead(200, { "content-type": "audio/mpeg", "cache-control": "private, max-age=86400" }); return res.end(hit); }
  try {
    const r = await elevenLabs(guide.voice, text, guide.settings);
    if (!r.ok) { const t = await r.text(); return send(res, r.status, { error: `ElevenLabs returned ${r.status}: ${t.slice(0, 200)}` }); }
    const audio = Buffer.from(await r.arrayBuffer());
    if (ttsCacheBytes > 60 * 1024 * 1024) { ttsCache.clear(); ttsCacheBytes = 0; }
    ttsCache.set(key, audio); ttsCacheBytes += audio.length;
    res.writeHead(200, { "content-type": "audio/mpeg", "cache-control": "private, max-age=86400" });
    res.end(audio);
  } catch (e) {
    send(res, 502, { error: "Couldn't reach ElevenLabs: " + e.message });
  }
}

async function handleLeaderboard(req, res) {
  if (req.method === "GET") return send(res, 200, { entries: loadLb().slice(0, 50) });
  if (req.method === "POST") {
    if (!allowed("lb:" + (req.socket.remoteAddress || "x"), 6)) return send(res, 429, { error: "Too many scores at once. Try again in a minute." });
    let b; try { b = await readBody(req, 4096); } catch { return send(res, 400, { error: "Invalid entry." }); }
    const entry = {
      id: String(b.id || Math.random().toString(36).slice(2, 10)).replace(/[^a-z0-9]/gi, "").slice(0, 12),
      name: clean(b.name),
      score: Math.max(0, Math.min(10000, Math.round(Number(b.score) || 0))),
      items: Math.max(0, Math.min(20, Math.round(Number(b.items) || 0))),
      max: 20, calm: !!b.calm, date: new Date().toISOString().slice(0, 10)
    };
    const list = loadLb(); list.push(entry);
    list.sort((a, b2) => b2.score - a.score || b2.items - a.items);
    saveLb(list.slice(0, 200));
    return send(res, 200, { id: entry.id, entries: list.slice(0, 50) });
  }
  send(res, 405, { error: "Method not allowed" });
}

// Never let one bad request take the whole server down.
process.on("unhandledRejection", e => console.error("Request failed:", e));
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  if (url.pathname === "/api/health") return send(res, 200, { ok: true, gemini: !!KEY, model: MODEL, voices: !!EL_KEY });
  if (url.pathname === "/api/tts" && req.method === "POST") return handleTts(req, res);
  if (url.pathname === "/api/gemini" && req.method === "POST") return handleGemini(req, res);
  if (url.pathname === "/api/leaderboard") return handleLeaderboard(req, res);
  // static files
  let p;
  try { p = decodeURIComponent(url.pathname); } catch { return send(res, 400, "Bad request", "text/plain"); }   // e.g. "/%"
  if (p === "/") p = "/index.html";
  const file = path.normalize(path.join(PUBLIC, p));
  if (!file.startsWith(PUBLIC + path.sep)) return send(res, 403, "Forbidden", "text/plain");
  fs.readFile(file, (err, buf) => {
    if (err) return send(res, 404, "Not found", "text/plain");
    const ext = path.extname(file);
    if (ext === ".html" && !/^\s*<!doctype/i.test(buf.toString("utf8", 0, 50))) {
      const html = buf.toString("utf8");
      // Head content (title, meta, links) ends where the first page element starts.
      const m = html.match(/<(header|main|div|section|dialog|script|p)\b/);
      const cut = m ? m.index : 0;
      return send(res, 200, SHELL_HEAD + html.slice(0, cut) + "</head>\n<body>\n" + html.slice(cut) + "\n</body>\n</html>", MIME[".html"]);
    }
    send(res, 200, buf, MIME[ext] || "application/octet-stream");
  });
});

server.listen(PORT, () => {
  console.log(`Clawcean running at http://localhost:${PORT}`);
  console.log(KEY ? `Gemini connected (model: ${MODEL})` : "Gemini key missing: the game runs in offline mode. Add GEMINI_API_KEY to .env.");
  console.log(EL_KEY ? `ElevenLabs voices on (model: ${EL_MODEL})` : "ElevenLabs key missing: read-aloud uses the browser's built-in voice. Add ELEVENLABS_API_KEY to .env.");
});
