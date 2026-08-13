// Plots the category embedding space (graph.json, projected to 2D by the demo's
// UMAP mapper) with each category colored by its top-level category, and marks
// where the query landed (from /api/embed).
// One colour per top-level group. A shorter palette wrapped, so unrelated
// groups shared a swatch and the map's own colour contract broke.
const PALETTE = [
  "blue", "pink", "indigo", "green", "red", "yellow", "purple", "mint", "rose",
  "teal", "amber", "lime", "slate", "plum", "sky", "brick",
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

  // The categories this query matched, so the map shows which region of the
  // space the answer came from rather than just plotting the catalog.
  //
  // Keyed on category plus group, because a few names repeat across groups
  // ("Accessories" sits under both Computers and Clothing). Each match lights
  // exactly one dot: the catalog also contains a duplicate row, and one result
  // should not put two rings on the map.
  const wanted = new Set(matches.map((m) => `${key(m.category)}|${key(m.top_category)}`));
  const claimed = new Set();

  // Normalize on the category points only, so the dots stay fixed across
  // queries — only the query marker moves.
  const toPos = normalizer(graph.map((g) => g.vec));

  return (
    <section className="cluster-section">
      <div className="cluster-map">
        {graph.map((g, i) => {
          const pos = toPos(g.vec);
          // Edge-aware tooltip: below the dot near the top, and anchored
          // inward near the sides, so it never clips at the border.
          const cls = ["cluster-dot", colorFor(g.top_category)];
          const id = `${key(g.category)}|${key(g.top_category)}`;
          if (wanted.has(id) && !claimed.has(id)) {
            claimed.add(id);
            cls.push("is-match");
          }
          if (pos.top < 20) cls.push("t-down");
          if (pos.left < 14) cls.push("t-start");
          else if (pos.left > 86) cls.push("t-end");
          return (
            <span
              key={i}
              className={cls.join(" ")}
              style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
            >
              <span className="cluster-tooltip">
                <strong>{g.category}</strong>
                <small>{g.top_category}</small>
              </span>
            </span>
          );
        })}

        {queryPoint && (() => {
          const p = toPos(queryPoint);
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
            <span className={`cluster-legend-swatch ${colorFor(t)}`} />
            {t}
          </li>
        ))}
      </ul>

      <div className="cluster-notes">
        <ul>
          <li>Each dot is a product category, colored by its top-level group.</li>
          {wanted.size > 0 && (
            <li>
              The outlined dots are the categories this query matched, so you can
              see which region of the space the answer came from.
            </li>
          )}
          {/* Only promise the marker when it is actually on the map. The
              backend returns no projection unless the UMAP mapper is bundled,
              and a caption describing a marker that isn't there is worse than
              no caption. */}
          {queryPoint && (
            <li>The ringed marker is your query, projected into the same space.</li>
          )}
        </ul>
      </div>
    </section>
  );
}

export default CategoryClusterMap;
