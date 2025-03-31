const express = require("express");
const authMiddleware = require("../middleware/auth");
const Recipe = require("../models/Recipe");
const User = require("../models/User");

const router = express.Router();

//  Hae kaikki reseptit
router.get("/", async (req, res) => {
  try {
    const recipes = await Recipe.find().populate("user", "username email");
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: "Palvelinvirhe" });
  }
});

// Hae kirjautuneen käyttäjän omat reseptit
router.get("/my-recipes", authMiddleware, async (req, res) => {
  try {
    console.log("🔐 Käyttäjä ID (tokenista):", req.user?.id);

    const recipes = await Recipe.find({ user: req.user.id });

    console.log("📦 Käyttäjän reseptit:", recipes);
    res.json(recipes);
  } catch (error) {
    console.error("💥 Virhe haettaessa omia reseptejä:", error);
    res.status(500).json({ message: "Palvelinvirhe", error: error.message });
  }
});

// Hae käyttäjän suosikit
router.get("/favorites", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("favorites");
    if (!user) return res.status(404).json({ message: "Käyttäjää ei löydy" });
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: "Palvelinvirhe" });
  }
});

// Lisää resepti
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, ingredients, instructions, image, category } = req.body;
    if (!name || !ingredients || !instructions) {
      return res.status(400).json({ message: "Kaikki kentät ovat pakollisia." });
    }

    const newRecipe = new Recipe({
      name,
      ingredients,
      instructions,
      image,
      category,
      user: req.user.id,
    });

    await newRecipe.save();
    res.status(201).json({ message: "Resepti lisätty onnistuneesti!", recipe: newRecipe });
  } catch (error) {
    res.status(500).json({ message: "Palvelinvirhe", error: error.message });
  }
});

// Päivitä resepti (vain omistaja)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: "Reseptiä ei löydy." });
    }
    if (recipe.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Et voi muokata toisen käyttäjän reseptiä." });
    }

    const { name, ingredients, instructions, image, category } = req.body;
    recipe.name = name || recipe.name;
    recipe.ingredients = ingredients || recipe.ingredients;
    recipe.instructions = instructions || recipe.instructions;
    recipe.image = image || recipe.image;
    recipe.category = category || recipe.category;

    await recipe.save();
    res.json({ message: "Resepti päivitetty onnistuneesti!", recipe });
  } catch (error) {
    res.status(500).json({ message: "Palvelinvirhe", error: error.message });
  }
});

// Poista resepti (vain omistaja)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: "Reseptiä ei löytynyt" });
    }
    if (recipe.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Et voi poistaa toisen käyttäjän reseptiä." });
    }

    await Recipe.findByIdAndDelete(req.params.id);
    res.json({ message: "Resepti poistettu onnistuneesti!" });
  } catch (error) {
    res.status(500).json({ message: "Palvelinvirhe" });
  }
});

// Lisää suosikkeihin
router.post("/:id/favorite", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Reseptiä ei löydy" });

    if (!user.favorites.includes(recipe._id)) {
      user.favorites.push(recipe._id);
      await user.save();
    }

    res.json({ message: "Resepti lisätty suosikkeihin!" });
  } catch (error) {
    res.status(500).json({ message: "Palvelinvirhe" });
  }
});

// Poista suosikeista
router.delete("/:id/favorite", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.favorites = user.favorites.filter(fav => fav.toString() !== req.params.id);
    await user.save();
    res.json({ message: "Resepti poistettu suosikeista!" });
  } catch (error) {
    res.status(500).json({ message: "Palvelinvirhe" });
  }
});

// Hae yksittäinen resepti
router.get("/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Reseptiä ei löytynyt" });
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: "Palvelinvirhe" });
  }
});

module.exports = router;
