import { useAuth } from "../context/AuthContext.jsx";
import Weather from "../components/Weather.jsx";

export default function Home() {
  const { user } = useAuth();
  return (
    <div className="container">
      <section className="hero">
        <h1>Welcome back, {user.name.split(" ")[0]}!</h1>
        <p>Get real-time weather for any city in the world.</p>
      </section>
      <Weather />
    </div>
  );
}
