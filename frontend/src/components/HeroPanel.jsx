import SearchBar from "./SearchBar";

const examples = [
  "Smart-TV",
  "Bread and butter",
  "лосось",
  "Vacuum cleaner",
  "iPhone",
  "lipstick",
  "Система охлаждения ЦПУ",
  "Wärmepumpentrockner für Kleidung",
];

function HeroPanel({ query, setQuery, onSearch, loading, error }) {
  return (
    <section className="hero-panel">
      <div className="hero-copy">
        <p className="eyebrow">Qdrant categorization demo</p>

        <h1>Semantic Product Categorization</h1>

        <p>
          Type a product name in any supported language and use vector search to
          return the closest product categories and matches.
        </p>
      </div>

      <SearchBar
        query={query}
        setQuery={setQuery}
        onSearch={onSearch}
        onExampleSearch={onSearch}
        loading={loading}
        examples={examples}
      />

      {error && <div className="error-state">{error}</div>}
    </section>
  );
}

export default HeroPanel;
