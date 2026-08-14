// Talks to the goods_categorization backend:
//   GET /api/categorize?q=  -> { result: { categories: [{category, top_category, score}] } }
//   GET /api/embed?q=       -> { result: { embedding: [x, y] | null } }
// The category cluster background (graph.json) is bundled as a static asset.
//
// VITE_API_BASE lets the frontend live somewhere other than the backend
// (e.g. the UI on Vercel, the API on Railway). Empty by default -> same-origin.
//
// Set VITE_MOCK=1 in dev (no backend) to preview the styling with sample data.
const USE_MOCK = import.meta.env.VITE_MOCK === "1";
const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");
const BASE = import.meta.env.BASE_URL || "/";

let graphCache = null;

export async function loadGraph() {
  if (!graphCache) {
    graphCache = await fetch(`${BASE}data/graph.json`).then((r) => r.json());
  }
  return graphCache;
}

export async function categorize(query) {
  if (USE_MOCK) return mockCategories();
  const res = await fetch(`${API_BASE}/api/categorize?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error(`Categorize failed (${res.status})`);
  const data = await res.json();
  return data.result?.categories || [];
}

// Non-fatal: the query dot on the cluster map is optional, so a failure here
// must never block categorization results. Returns null when unavailable.
export async function embed(query) {
  if (USE_MOCK) return mockPoint();
  try {
    const res = await fetch(`${API_BASE}/api/embed?q=${encodeURIComponent(query)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.result?.embedding || null;
  } catch {
    return null;
  }
}

/* ------------------------------- dev mock -------------------------------- */

function mockCategories() {
  return Promise.resolve([
    { category: "CPU cooling systems", top_category: "Computers", score: 0.71 },
    { category: "Computer components", top_category: "Computers", score: 0.55 },
    { category: "Case fans", top_category: "Computers", score: 0.41 },
    { category: "Air conditioners", top_category: "Home appliances", score: 0.22 },
  ]);
}

function mockPoint() {
  return Promise.resolve([12.2, 6.4]);
}
