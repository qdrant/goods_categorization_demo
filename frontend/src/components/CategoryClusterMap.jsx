// Plots the category embedding space (graph.json, projected to 2D by the demo's
// UMAP mapper), rings the categories a query matched, and marks where the query
// itself sits.
//
// One color per top-level group. A shorter palette wrapped, so unrelated groups
// shared a swatch and the map's own color contract broke.
const PALETTE = [
  ["blue", "#6aa6ff"],
  ["pink", "#dc245b"],
  ["indigo", "#6978e8"],
  ["green", "#65c986"],
  ["red", "#e56d64"],
  ["yellow", "#dec64f"],
  ["purple", "#9a72e9"],
  ["mint", "#5fd7b5"],
  ["rose", "#e76b97"],
  ["teal", "#3fb8c4"],
  ["amber", "#e39a3c"],
  ["lime", "#a7c957"],
  ["slate", "#8592a8"],
  ["plum", "#b0559b"],
  ["sky", "#4ec3e0"],
  ["brick", "#c05746"],
];

const PAD = 8;
const RANGE = 84;

function normalizer(points) {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const spanX = Math.max(...xs) - minX || 1;
  const spanY = Math.max(...ys) - minY || 1;
  return ([x, y]) => ({
    left: PAD + ((x - minX) / spanX) * RANGE,
    top: PAD + ((y - minY) / spanY) * RANGE,
  });
}

const key = (s) => (s || "").trim().toLowerCase();

function CategoryClusterMap({ graph, queryPoint, matches = [] }) {
  if (!graph || graph.length === 0) return null;

  const topCats = [...new Set(graph.map((g) => g.top_category))].sort();
  const colorFor = (t) => PALETTE[topCats.indexOf(t) % PALETTE.length];

  // The categories this query matched. Keyed on category plus group, because a
  // few names repeat across groups ("Accessories" sits under both Computers and
  // Clothing). Each match lights exactly one dot, since the catalog also carries
  // a duplicate row and one result should not put two rings on the map.
  const wanted = new Set(matches.map((m) => `${key(m.category)}|${key(m.top_category)}`));
  const claimed = new Set();

  // Normalize on the category points only, so the dots stay fixed across
  // queries and only the query marker moves.
  const toPos = normalizer(graph.map((g) => g.vec));

  // Where to put the query marker. The backend returns a real projection only
  // when the UMAP mapper is bundled with the image, which it currently is not,
  // so fall back to the score-weighted center of the categories it matched. That
  // places the marker among its own results, which is what the map is showing.
  let marker = queryPoint;
  if (!marker && matches.length) {
    const byCat = new Map(graph.map((g) => [`${key(g.category)}|${key(g.top_category)}`, g]));
    let x = 0, y = 0, w = 0;
    for (const m of matches) {
      const g = byCat.get(`${key(m.category)}|${key(m.top_category)}`);
      if (!g) continue;
      const weight = Math.max(Number(m.score) || 0, 0.01);
      x += g.vec[0] * weight;
      y += g.vec[1] * weight;
      w += weight;
    }
    if (w) marker = [x / w, y / w];
  }

  return (
    <section className="cluster-section">
      <div className="cluster-map">
        {graph.map((g, i) => {
          const pos = toPos(g.vec);
          const [colorClass, hex] = colorFor(g.top_category);
          const cls = ["cluster-dot", colorClass];

          const id = `${key(g.category)}|${key(g.top_category)}`;
          const isMatch = wanted.has(id) && !claimed.has(id);
          if (isMatch) {
            claimed.add(id);
            cls.push("is-match");
          }

          // Edge-aware tooltip: below the dot near the top, and anchored inward
          // near the sides, so it never clips at the border.
          if (pos.top < 20) cls.push("t-down");
          if (pos.left < 14) cls.push("t-start");
          else if (pos.left > 86) cls.push("t-end");

          // The matched dot's size and halo go inline. The stylesheet defines
          // `.cluster-dot` twice and the later copy kept winning, so a matched
          // dot silently rendered at its normal size after a re-render.
          const style = { left: `${pos.left}%`, top: `${pos.top}%` };
          if (isMatch) {
            style.width = "18px";
            style.height = "18px";
            style.opacity = 1;
            style.zIndex = 5;
            style.boxShadow = `0 0 0 9px ${hex}55`;
          }

          return (
            <span key={i} className={cls.join(" ")} style={style}>
              <span className="cluster-tooltip">
                <strong>{g.category}</strong>
                <small>{g.top_category}</small>
              </span>
            </span>
          );
        })}

        {marker && (() => {
          const p = toPos(marker);
          // Keep the "Query" label inside the box: flip it above when the marker
          // is near the bottom, and nudge it left/right near the sides.
          const cls = ["query-marker"];
          if (p.top > 68) cls.push("q-up");
          if (p.left < 16) cls.push("q-left");
          else if (p.left > 84) cls.push("q-right");
          return (
            <span
              className={cls.join(" ")}
              style={{ left: `${p.left}%`, top: `${p.top}%` }}
            />
          );
        })()}
      </div>

      <ul className="cluster-legend">
        {topCats.map((t) => (
          <li className="cluster-legend-item" key={t}>
            <span className={`cluster-legend-swatch ${colorFor(t)[0]}`} />
            {t}
          </li>
        ))}
      </ul>

      <div className="cluster-notes">
        <ul>
          <li>Each dot is a product category, colored by its top-level group.</li>
          {wanted.size > 0 && (
            <li>
              The larger, haloed dots are the categories this query matched, and
              the ringed marker sits at the center of them.
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}

export default CategoryClusterMap;
