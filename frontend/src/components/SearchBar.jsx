function SearchBar({
  query,
  setQuery,
  onSearch,
  onExampleSearch,
  loading,
  examples,
}) {
  function handleSubmit(event) {
    event.preventDefault();
    onSearch(query);
  }

  return (
    <div className="search-area">
      <form className="search-box" onSubmit={handleSubmit}>
        <span className="search-icon">⌕</span>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search a product, category, or multilingual query..."
        />

        {query && (
          <button
            className="clear-button"
            type="button"
            onClick={() => setQuery("")}
          >
            ×
          </button>
        )}

        <button className="search-submit" disabled={loading} type="submit">
          {loading ? "Searching" : "Categorize"}
        </button>
      </form>

      <div className="example-row">
        <span>Example searches</span>

        <div className="example-chips">
          {examples.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => onExampleSearch(example)}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SearchBar;
