function HowItWorksModal({ onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="how-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p>How it works</p>
            <h2>Product categorization powered by Qdrant</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          <div className="pipeline">
            <div className="pipeline-node">
              <span>1</span>
              <strong>Catalog</strong>
              <p>175 product categories across a two-level category tree.</p>
            </div>

            <div className="pipeline-arrow">→</div>

            <div className="pipeline-node">
              <span>2</span>
              <strong>Embeddings</strong>
              <p>Your query is turned into a vector with multilingual MiniLM-L12.</p>
            </div>

            <div className="pipeline-arrow">→</div>

            <div className="pipeline-node">
              <span>3</span>
              <strong>Qdrant</strong>
              <p>The vector is matched against the category collection in Qdrant.</p>
            </div>

            <div className="pipeline-arrow">→</div>

            <div className="pipeline-node">
              <span>4</span>
              <strong>Categories</strong>
              <p>Scores are aggregated to rank the most likely categories.</p>
            </div>
          </div>

          <div className="how-section">
            <h3>Good to know</h3>
            <div className="mode-grid">
              <div className="mode-card">
                <span>Multilingual</span>
                <p>
                  Type a product in any language, and the model maps meaning across
                  languages, so “running shoes” and “кроссовки” land together.
                </p>
              </div>
              <div className="mode-card">
                <span>Semantic</span>
                <p>
                  Matching is by meaning, not keywords, so a product finds the
                  right category even without exact word overlap.
                </p>
              </div>
              <div className="mode-card">
                <span>Cluster map</span>
                <p>
                  Each dot is a category, positioned by similarity, so related
                  categories cluster together in the vector space.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HowItWorksModal;
