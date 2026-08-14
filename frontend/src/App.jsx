import { useEffect, useState } from "react";

import "./App.css";

import Header from "./components/Header";
import HeroPanel from "./components/HeroPanel";
import Footer from "./components/Footer";
import LoadingState from "./components/LoadingState";
import EmptyState from "./components/EmptyState";
import CategoryClusterMap from "./components/CategoryClusterMap";
import HowItWorksModal from "./components/HowItWorksModal";

import { categorize, embed, loadGraph } from "./lib/api";

function App() {
  const [theme, setTheme] = useState("light");
  const [query, setQuery] = useState("Система охлаждения CPU");
  // The query the results actually reflect — only updates on a real search, so
  // the "Top categories for …" title doesn't change while you're still typing.
  const [submittedQuery, setSubmittedQuery] = useState("Система охлаждения CPU");
  const [categories, setCategories] = useState([]);
  const [graph, setGraph] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  // Where the query itself lands in the map, projected by the same UMAP mapper
  // that produced the category coordinates. Null when /api/embed is unavailable,
  // in which case the marker simply doesn't render.
  const [queryPoint, setQueryPoint] = useState(null);

  useEffect(() => {
    loadGraph().then(setGraph).catch((e) => console.error(e));
    categorizeGood(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function categorizeGood(searchQuery = query) {
    const clean = searchQuery.trim();
    if (!clean) return;
    setQuery(clean);
    setSubmittedQuery(clean);
    setLoading(true);
    setError("");
    setHasSearched(true);
    setQueryPoint(null);
    try {
      // The marker is the query's own projection, not an average of the
      // categories it matched, so a query that matches nothing lands where it
      // actually is rather than confidently inside a cluster.
      const [cats, point] = await Promise.all([categorize(clean), embed(clean)]);
      setCategories(cats);
      setQueryPoint(point);
    } catch (err) {
      console.error(err);
      setError("Categorization failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={`app ${theme}`}>
      <Header
        theme={theme}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        onOpenHowItWorks={() => setShowHowItWorks(true)}
      />

      <section className="page">
        <HeroPanel
          query={query}
          setQuery={setQuery}
          onSearch={categorizeGood}
          loading={loading}
          error={error}
        />

        {categories.length > 0 ? (
          <section className={`results-section${loading ? " is-loading" : ""}`}>
            <div className="results-header">
              <div>
                <p className="eyebrow">Vector results</p>
                <h2>Top categories for “{submittedQuery}”</h2>
              </div>
              <span className="result-count">{categories.length} categories</span>
            </div>

            <div className="top-categories">
              {categories.map((c, i) => (
                <span key={i}>
                  {c.category}
                  <small style={{ opacity: 0.7, marginLeft: 6 }}>
                    {c.top_category}
                  </small>
                  <strong>{Number(c.score).toFixed(3)}</strong>
                </span>
              ))}
            </div>

            <CategoryClusterMap
              graph={graph}
              queryPoint={queryPoint}
              matches={categories}
            />
          </section>
        ) : loading ? (
          <LoadingState />
        ) : (
          hasSearched && <EmptyState />
        )}
      </section>

      <Footer theme={theme} />

      {showHowItWorks && (
        <HowItWorksModal onClose={() => setShowHowItWorks(false)} />
      )}
    </main>
  );
}

export default App;
