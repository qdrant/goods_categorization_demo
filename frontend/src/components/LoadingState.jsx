function LoadingState({
  title = "Searching…",
  message = "Embedding your query and finding the closest product vectors.",
}) {
  return (
    <section className="loading-state">
      <div className="loading-spinner" />

      <div>
        <h3>{title}</h3>
        <p>{message}</p>
      </div>
    </section>
  );
}

export default LoadingState;
