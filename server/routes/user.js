const express = require('express');
const authMiddleware = require('../middleware/auth');
const User = require('../models/user');
const Recipe = require('../models/recipe');

const router = express.Router();

// Hae kaikki käyttäjät (vain admin voi hakea)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Palvelinvirhe', error: error.message });
  }
});

// Hae kirjautuneen käyttäjän tiedot
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').populate('favorites');
    if (!user) return res.status(404).json({ message: 'Käyttäjää ei löydy' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Palvelinvirhe', error: error.message });
  }
});

// Päivitä käyttäjän tiedot
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true }).select('-password');
    res.json({ message: 'Käyttäjän tiedot päivitetty!', user });
  } catch (error) {
    res.status(500).json({ message: 'Virhe käyttäjän tietojen päivittämisessä', error: error.message });
  }
});

// Poista käyttäjä
router.delete('/me', authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: 'Käyttäjä poistettu onnistuneesti' });
  } catch (error) {
    res.status(500).json({ message: 'Virhe käyttäjän poistamisessa', error: error.message });
  }
});

// Hae käyttäjän suosikkireseptit
router.get('/me/favorites', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({ path: 'favorites', model: 'Recipe' });
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: 'Palvelinvirhe', error: error.message });
  }
});

module.exports = router;
