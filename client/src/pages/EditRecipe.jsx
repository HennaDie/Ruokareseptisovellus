import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";

const categoryOptions = [
  "Aamiainen",
  "Lounas",
  "Päivällinen",
  "Välipala",
  "Jälkiruoka",
  "Kasvis",
  "Muu",
];

const EditRecipe = () => {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("Muu");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const API_BASE = "https://ruokareseptisovellus.onrender.com";

  useEffect(() => {
    fetch(`${API_BASE}/api/recipes/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setName(data.name);
        setIngredients(data.ingredients.join(", "));
        setInstructions(data.instructions);
        setImage(data.image || "");
        setCategory(data.category || "Muu");
      });
  }, [id]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Vain kuvatiedostot sallittu.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage("Kuva saa olla enintään 2MB.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setImage(data.imageUrl);
      } else {
        setMessage(data.message || "Kuvan lähetys epäonnistui.");
      }
    } catch {
      setMessage("Virhe kuvan lähetyksessä.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedRecipe = {
      name,
      ingredients: ingredients.split(",").map((i) => i.trim()),
      instructions,
      image,
      category,
    };

    const res = await fetch(`${API_BASE}/api/recipes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedRecipe),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("Resepti päivitetty!");
      navigate("/recipes");
    } else {
      setMessage(data.message || "Päivitys epäonnistui.");
    }
  };

  return (
    <Layout>
      <h2>Muokkaa reseptiä</h2>

      <form onSubmit={handleSubmit} className="recipe-form">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <textarea
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          required
        />

        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          required
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categoryOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        {uploading && <p>Lähetetään kuvaa...</p>}

        {image && (
          <>
            <img
              src={`${API_BASE}${image}`}
              alt="Esikatselu"
              className="recipe-image"
              style={{ marginTop: "1rem", maxWidth: "100%", height: "auto" }}
            />
            <br />
            <button type="button" onClick={() => setImage("")}>
              Poista kuva
            </button>
          </>
        )}

        <button type="submit">Tallenna muutokset</button>
      </form>

      {message && <p>{message}</p>}
    </Layout>
  );
};

export default EditRecipe;
