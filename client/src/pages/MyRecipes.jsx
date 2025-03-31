import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

const categoryOptions = [
  "Kaikki", "Aamiainen", "Lounas", "Päivällinen", "Välipala", "Jälkiruoka", "Kasvis", "Muu",
];

function MyRecipes() {
  const [myRecipes, setMyRecipes] = useState([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Kaikki");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyRecipes = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/recipes/my-recipes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setMyRecipes(data);
      } catch (error) {
        setMessage("Virhe haettaessa reseptejä.");
      }
    };

    if (token) {
      fetchMyRecipes();
    }
  }, [token]);

  const deleteRecipe = async (id) => {
    if (!window.confirm("Haluatko varmasti poistaa reseptin?")) return;

    try {
      const res = await fetch(`http://localhost:3000/api/recipes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Resepti poistettu.");
        setMyRecipes((prev) => prev.filter((r) => r._id !== id));
      } else {
        setMessage(data.message || "Virhe poistaessa.");
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

  const filteredRecipes = myRecipes.filter((r) => {
    const matchesName = r.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "Kaikki" || r.category === selectedCategory;
    return matchesName && matchesCategory;
  });

  return (
    <Layout>
      <h2 className="section-title">Omat reseptit</h2>

      {token && (
        <div className="new-recipe-button">
          <button onClick={() => navigate("/add")}>Uusi resepti</button>
        </div>
      )}

      {message && <p>{message}</p>}

      {!token ? (
        <p>Kirjaudu nähdäksesi omat reseptisi.</p>
      ) : (
        <>
          <input
            type="text"
            placeholder="Hae reseptiä nimellä..."
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

          {filteredRecipes.length === 0 ? (
            <p>Ei tuloksia haulle.</p>
          ) : (
            <ul>
              {filteredRecipes.map((recipe) => (
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

                  <button onClick={() => navigate(`/edit/${recipe._id}`)}>Muokkaa</button>
                  <button onClick={() => deleteRecipe(recipe._id)}>Poista</button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Layout>
  );
}

export default MyRecipes;
