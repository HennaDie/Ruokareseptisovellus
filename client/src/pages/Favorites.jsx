import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

const categoryOptions = [
  "Kaikki", "Aamiainen", "Lounas", "Päivällinen", "Välipala", "Jälkiruoka", "Kasvis", "Muu",
];

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Kaikki");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    const fetchFavorites = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/recipes/favorites", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setFavorites(data);
      } catch (err) {
        setMessage("Virhe suosikkien haussa.");
      }
    };

    fetchFavorites();
  }, [token]);

  const removeFromFavorites = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/api/recipes/${id}/favorite`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        setFavorites((prev) => prev.filter((r) => r._id !== id));
        setMessage("Resepti poistettu suosikeista.");
      } else {
        setMessage(data.message || "Virhe poistaessa suosikeista.");
      }
    } catch (err) {
      setMessage("Palvelinvirhe.");
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleString("fi-FI", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filtered = favorites.filter((r) => {
    const matchesName = r.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "Kaikki" || r.category === selectedCategory;
    return matchesName && matchesCategory;
  });

  return (
    <Layout>
      <h2 className="section-title">Suosikkireseptit</h2>
      {message && <p>{message}</p>}

      {!token ? (
        <p style={{ fontWeight: "bold" }}>
          Kirjaudu sisään nähdäksesi suosikkireseptit.
        </p>
      ) : (
        <>
          <div className="new-recipe-button">
            <button onClick={() => navigate("/add")}>Uusi resepti</button>
          </div>

          <input
            type="text"
            placeholder="Hae suosikeista nimellä..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="search-input"
          >
            {categoryOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>

          {filtered.length === 0 ? (
            <p>Ei tuloksia haulle.</p>
          ) : (
            <ul>
              {filtered.map((recipe) => (
                <li key={recipe._id}>
                  <h3>{recipe.name}</h3>

                  {recipe.image && (
                    <img
                      src={`http://localhost:3000${recipe.image}`}
                      alt={recipe.name}
                      className="recipe-image"
                    />
                  )}

                  <p><strong>Kategoria:</strong> {recipe.category}</p>
                  <p><strong>Ainekset:</strong> {recipe.ingredients.join(", ")}</p>
                  <p><strong>Ohjeet:</strong> {recipe.instructions}</p>

                  <p><em>Luotu: {formatDate(recipe.createdAt)}</em></p>
                  {recipe.updatedAt && (
                    <p><em>Muokattu: {formatDate(recipe.updatedAt)}</em></p>
                  )}

                  <button onClick={() => removeFromFavorites(recipe._id)}>
                    Poista suosikeista
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Layout>
  );
}

export default Favorites;
