// Clawcean server: serves the game, proxies Gemini (so the API key never reaches the browser),
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
const PUBLIC = path.join(__dirname, "public");
const DATA = path.join(__dirname, "data");
const LB_FILE = path.join(DATA, "leaderboard.json");

const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon" };

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

async function handleLeaderboard(req, res) {
  if (req.method === "GET") return send(res, 200, { entries: loadLb().slice(0, 50) });
  if (req.method === "POST") {
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

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  if (url.pathname === "/api/health") return send(res, 200, { ok: true, gemini: !!KEY, model: MODEL });
  if (url.pathname === "/api/gemini" && req.method === "POST") return handleGemini(req, res);
  if (url.pathname === "/api/leaderboard") return handleLeaderboard(req, res);
  // static files
  let p = decodeURIComponent(url.pathname); if (p === "/") p = "/index.html";
  const file = path.normalize(path.join(PUBLIC, p));
  if (!file.startsWith(PUBLIC)) return send(res, 403, "Forbidden", "text/plain");
  fs.readFile(file, (err, buf) => {
    if (err) return send(res, 404, "Not found", "text/plain");
    const ext = path.extname(file);
    if (ext === ".html" && !/^\s*<!doctype/i.test(buf.toString("utf8", 0, 50))) {
      const html = buf.toString("utf8");
      const cut = html.indexOf("</style>") + "</style>".length;
      return send(res, 200, SHELL_HEAD + html.slice(0, cut) + "\n</head>\n<body>\n" + html.slice(cut) + "\n</body>\n</html>", MIME[".html"]);
    }
    send(res, 200, buf, MIME[ext] || "application/octet-stream");
  });
});

server.listen(PORT, () => {
  console.log(`Clawcean running at http://localhost:${PORT}`);
  console.log(KEY ? `Gemini connected (model: ${MODEL})` : "Gemini key missing: the game runs in offline mode. Add GEMINI_API_KEY to .env.");
});
