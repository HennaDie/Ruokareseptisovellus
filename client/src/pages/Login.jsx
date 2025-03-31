import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        navigate("/");
        setTimeout(() => alert("Kirjautuminen onnistui!"), 100);
      } else {
        setError(data.message || "Kirjautuminen epäonnistui");
      }
    } catch (err) {
      setError("Palvelinvirhe, yritä myöhemmin.");
    }
  };

  return (
    <div>
      {/*Yläkulman painikkeet */}
      <div className="login-links">
        <Link to="/">
          <button className="auth-button">Etusivu</button>
        </Link>
        <Link to="/register">
          <button className="auth-button">Rekisteröidy</button>
        </Link>
        <Link to="/recipes">
          <button className="auth-button">Reseptit</button>
        </Link>
      </div>

      <h1>Kirjaudu sisään</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form className="auth-form" onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Sähköposti"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Salasana"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Kirjaudu sisään</button>
      </form>
    </div>
  );
}

export default Login;
