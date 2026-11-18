import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="header">
      <NavLink to="/" className="logo">
        <span aria-hidden="true">🌤️</span> Weather Report
      </NavLink>
      <nav className="nav" aria-label="Main navigation">
        {user ? (
          <>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/about">About</NavLink>
            <span className="hello">Hi, {user.name.split(" ")[0]}</span>
            <button className="btn btn-ghost" onClick={handleLogout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/login">Log in</NavLink>
            <NavLink to="/register" className="btn btn-light">
              Sign up
            </NavLink>
          </>
        )}
      </nav>
    </header>
  );
}
