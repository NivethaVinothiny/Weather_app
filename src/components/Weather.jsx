import { useState } from "react";
import axios from "axios";

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const RECENT_KEY = "weather_recent";

function loadRecent() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
  } catch {
    return [];
  }
}

// Turns any failure into a friendly message for the user.
function friendlyError(err) {
  if (err.message === "NO_KEY") {
    return "The weather API key is not configured. Add VITE_OPENWEATHER_API_KEY (see README).";
  }
  const status = err.response?.status;
  if (status === 404) return "City not found. Check the spelling and try again.";
  if (status === 401) return "The weather API key is invalid or not active yet.";
  if (status === 429) return "Too many requests. Please wait a minute and try again.";
  if (err.code === "ERR_NETWORK" || !err.response) {
    return "Could not reach the weather service. Check your internet connection.";
  }
  return "Something went wrong while fetching the weather. Please try again.";
}

/** All weather functionality lives in this one component. */
export default function Weather() {
  const [city, setCity] = useState("");
  const [units, setUnits] = useState("metric"); // metric = °C, imperial = °F
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recent, setRecent] = useState(loadRecent);

  const unitSymbol = units === "metric" ? "°C" : "°F";
  const speedUnit = units === "metric" ? "m/s" : "mph";

  const fetchWeather = async (name, unitSystem = units) => {
    const query = name.trim();
    if (!query) {
      setError("Please enter a city name.");
      setWeather(null);
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (!API_KEY) throw new Error("NO_KEY");
      // User input is placed into the URL dynamically with a template literal.
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        query
      )}&units=${unitSystem}&appid=${API_KEY}`;
      const { data } = await axios.get(url);
      setWeather(data);
      const updated = [
        data.name,
        ...recent.filter((c) => c.toLowerCase() !== data.name.toLowerCase()),
      ].slice(0, 5);
      setRecent(updated);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    } catch (err) {
      setWeather(null);
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchWeather(city);
  };

  const handleUnits = (next) => {
    if (next === units) return;
    setUnits(next);
    if (weather) fetchWeather(weather.name, next);
  };

  const handleRecent = (name) => {
    setCity(name);
    fetchWeather(name);
  };

  return (
    <section className="weather" aria-labelledby="weather-title">
      <h2 id="weather-title">Check the weather</h2>

      <form className="search" onSubmit={handleSubmit} role="search">
        <label htmlFor="city" className="sr-only">
          City name
        </label>
        <input
          id="city"
          type="text"
          placeholder="Enter a city, e.g. Chennai"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          autoComplete="off"
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      <div className="toolbar">
        <div className="units" role="group" aria-label="Temperature unit">
          <button
            type="button"
            className={units === "metric" ? "chip active" : "chip"}
            onClick={() => handleUnits("metric")}
          >
            °C
          </button>
          <button
            type="button"
            className={units === "imperial" ? "chip active" : "chip"}
            onClick={() => handleUnits("imperial")}
          >
            °F
          </button>
        </div>
        {recent.length > 0 && (
          <div className="recent" aria-label="Recent searches">
            <span>Recent:</span>
            {recent.map((name) => (
              <button
                key={name}
                type="button"
                className="chip"
                onClick={() => handleRecent(name)}
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {!weather && !error && !loading && (
        <p className="hint">Search for a city to see its current weather.</p>
      )}

      {weather && (
        <article className="card" aria-live="polite">
          <header className="card-head">
            <div>
              <h3>
                {weather.name}, {weather.sys?.country}
              </h3>
              <p className="desc">{weather.weather?.[0]?.description}</p>
            </div>
            {weather.weather?.[0]?.icon && (
              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                alt={weather.weather[0].main}
                width="80"
                height="80"
              />
            )}
          </header>
          <p className="temp">
            {Math.round(weather.main.temp)}
            {unitSymbol}
          </p>
          <dl className="stats">
            <div>
              <dt>Feels like</dt>
              <dd>
                {Math.round(weather.main.feels_like)}
                {unitSymbol}
              </dd>
            </div>
            <div>
              <dt>Humidity</dt>
              <dd>{weather.main.humidity}%</dd>
            </div>
            <div>
              <dt>Wind</dt>
              <dd>
                {weather.wind.speed} {speedUnit}
              </dd>
            </div>
            <div>
              <dt>Pressure</dt>
              <dd>{weather.main.pressure} hPa</dd>
            </div>
          </dl>
        </article>
      )}
    </section>
  );
}
