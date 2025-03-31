import { Link, useLocation } from "react-router-dom";

const getUserFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch {
    return null;
  }
};

const Layout = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = getUserFromToken();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="App">
      {/* 🔝 Yläkulman napit */}
      <div className="login-links">
        {!token ? (
          <>
            <Link to="/login">
              <button className="auth-button">Kirjaudu</button>
            </Link>
            <Link to="/register">
              <button className="auth-button">Rekisteröidy</button>
            </Link>
            {location.pathname !== "/" && (
              <Link to="/">
                <button className="auth-button">Etusivu</button>
              </Link>
            )}
          </>
        ) : (
          <>
            <span className="logged-in-user">
              Olet kirjautunut: <strong>{user?.username}</strong>
            </span>

            {location.pathname !== "/" && (
              <Link to="/">
                <button className="auth-button">Etusivu</button>
              </Link>
            )}
            <Link to="/recipes">
              <button className="auth-button">Reseptit</button>
            </Link>
            <Link to="/favorites">
              <button className="auth-button">Suosikit</button>
            </Link>
            <Link to="/my-recipes">
              <button className="auth-button">Omat</button>
            </Link>
            <button onClick={handleLogout} className="auth-button">
              Kirjaudu ulos
            </button>
          </>
        )}
      </div>

      {/* Sovelluksen pääsisältö */}
      <div className="home-container">
        {location.pathname === "/" && (
          <h1 className="home-title">Ruokareseptisovellus</h1>
        )}
        {children}
      </div>
    </div>
  );
};

export default Layout;
