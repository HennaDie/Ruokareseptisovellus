import { useState } from "react";
import { Link } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Rekisteröityminen epäonnistui");
      }

      setSuccess(true);
      setUsername("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      {/* Yläkulman painikkeet */}
      <div className="login-links">
        <Link to="/login">
          <button className="auth-button">Kirjaudu</button>
        </Link>
        <Link to="/">
          <button className="auth-button">Etusivu</button>
        </Link>
        <Link to="/recipes">
          <button className="auth-button">Reseptit</button>
        </Link>
      </div>

      <h2 className="home-title">Rekisteröidy</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>Rekisteröityminen onnistui!</p>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Käyttäjänimi"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

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

        <button type="submit">Rekisteröidy</button>
      </form>
    </div>
  );
};

export default Register;
