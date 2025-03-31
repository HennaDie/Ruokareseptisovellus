import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

const AddRecipe = () => {
  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("Muu");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Tiedostotyyppi- ja kokovalidaatio
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
      const res = await fetch("http://localhost:3000/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setImage(data.imageUrl); // imageUrl tulee backendista
      } else {
        setMessage(data.message || "Kuvan lähetys epäonnistui.");
      }
    } catch (err) {
      setMessage("Virhe kuvan lähetyksessä.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newRecipe = {
      name,
      ingredients: ingredients.split(",").map((i) => i.trim()),
      instructions,
      image,
      category,
    };

    const res = await fetch("http://localhost:3000/api/recipes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newRecipe),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("Resepti lisätty!");
      navigate("/recipes");
    } else {
      setMessage(data.message || "Virhe lisäyksessä.");
    }
  };

  return (
    <Layout>
      <h2>Lisää uusi resepti</h2>

      <form onSubmit={handleSubmit} className="recipe-form">
        <input
          type="text"
          placeholder="Reseptin nimi"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <textarea
          placeholder="Ainekset (pilkuilla eroteltuna)"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          required
        />

        <textarea
          placeholder="Valmistusohjeet"
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
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>

        {uploading && <p>Lähetetään kuvaa...</p>}

        {image && (
          <>
            <img
              src={`http://localhost:3000${image}`}
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

        <button type="submit">Lisää resepti</button>
      </form>

      {message && <p>{message}</p>}
    </Layout>
  );
};

export default AddRecipe;
