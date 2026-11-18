export default function About() {
  return (
    <div className="container narrow">
      <article className="panel">
        <h1>About</h1>
        <p>
          Weather Report is a React app that fetches live weather from the
          OpenWeatherMap API using axios. Search any city, switch between °C
          and °F, and jump back to your recent searches.
        </p>
        <p className="note">
          Note: accounts are stored only in your own browser (a learning-project
          demo), so they are not synced between devices and should not reuse a
          real password.
        </p>
      </article>
    </div>
  );
}
