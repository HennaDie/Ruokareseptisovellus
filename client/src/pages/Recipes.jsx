import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

const categoryOptions = [
  "Kaikki", "Aamiainen", "Lounas", "Päivällinen", "Välipala", "Jälkiruoka", "Kasvis", "Muu",
];

function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Kaikki");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const currentUserId = (() => {
    try {
      if (!token) return null;
      const decoded = JSON.parse(atob(token.split(".")[1]));
      return decoded.id;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    const fetchRecipes = async () => {
      const res = await fetch("http://localhost:3000/api/recipes");
      const data = await res.json();
      setRecipes(data);
    };

    const fetchFavorites = async () => {
      if (token) {
        const res = await fetch("http://localhost:3000/api/recipes/favorites", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const favs = await res.json();
        setFavorites(favs.map((r) => r._id));
      }
    };

    fetchRecipes();
    fetchFavorites();
  }, []);

  const addToFavorites = async (id) => {
    const res = await fetch(`http://localhost:3000/api/recipes/${id}/favorite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (res.ok) {
      setFavorites([...favorites, id]);
      setMessage(data.message);
    } else {
      setMessage(data.message || "Virhe suosikkiin lisäyksessä.");
    }
  };

  const removeFromFavorites = async (id) => {
    const res = await fetch(`http://localhost:3000/api/recipes/${id}/favorite`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (res.ok) {
      setFavorites(favorites.filter((favId) => favId !== id));
      setMessage(data.message);
    } else {
      setMessage(data.message || "Poisto epäonnistui.");
    }
  };

  const deleteRecipe = async (id) => {
    if (!window.confirm("Haluatko varmasti poistaa reseptin?")) return;

    const res = await fetch(`http://localhost:3000/api/recipes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (res.ok) {
      setRecipes(recipes.filter((r) => r._id !== id));
      setMessage("Resepti poistettu.");
    } else {
      setMessage(data.message || "Poisto epäonnistui.");
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

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = `${recipe.name} ${recipe.instructions} ${recipe.ingredients.join(" ")}`.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "Kaikki" || recipe.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <Layout>
      <h1 className="home-title">Kaikki reseptit</h1>

      {token && (
        <div className="new-recipe-button">
          <button onClick={() => navigate("/add")}>Uusi resepti</button>
        </div>
      )}

      <input
        type="text"
        placeholder="Hae reseptiä, ainesosaa tai ohjetta..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
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

      {message && <p>{message}</p>}

      {filteredRecipes.length === 0 ? (
        <p>Ei löytynyt reseptejä.</p>
      ) : (
        <ul>
          {filteredRecipes.map((recipe) => {
            const imageSrc = recipe.image?.startsWith("/uploads/")
              ? `http://localhost:3000${recipe.image}`
              : recipe.image;

            return (
              <li key={recipe._id}>
                {imageSrc && (
                  <img
                    src={imageSrc}
                    alt={recipe.name}
                    className="recipe-image"
                  />
                )}
                <h3>{recipe.name}</h3>
                <p><strong>Kategoria:</strong> {recipe.category}</p>
                <p><strong>Ainekset:</strong> {recipe.ingredients.join(", ")}</p>
                <p><strong>Ohjeet:</strong> {recipe.instructions}</p>
                <p><em>Luotu: {formatDate(recipe.createdAt)}</em></p>
                {recipe.updatedAt && <p><em>Muokattu: {formatDate(recipe.updatedAt)}</em></p>}

                {token && (
                  <>
                    {favorites.includes(recipe._id) ? (
                      <button onClick={() => removeFromFavorites(recipe._id)}>💔 Poista suosikeista</button>
                    ) : (
                      <button onClick={() => addToFavorites(recipe._id)}>🤍 Lisää suosikiksi</button>
                    )}

                    {recipe.user && recipe.user._id === currentUserId && (
                      <>
                        <button onClick={() => navigate(`/edit/${recipe._id}`)}>Muokkaa</button>
                        <button onClick={() => deleteRecipe(recipe._id)}>Poista</button>
                      </>
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Layout>
  );
}

export default Recipes;
