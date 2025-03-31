const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();


router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Täytä kaikki kentät." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Sähköposti on jo käytössä." });
    }

    const newUser = new User({
      username,
      email,
      password,
    });

    await newUser.save();

    res.status(201).json({ message: "Käyttäjä luotu onnistuneesti!" });
  } catch (err) {
    console.error("Rekisteröintivirhe:", err.message);
    res.status(500).json({ message: "Palvelinvirhe" });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Täytä sähköposti ja salasana." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Virheellinen sähköposti tai salasana." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Virheellinen sähköposti tai salasana." });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ token });
  } catch (err) {
    console.error("Kirjautumisvirhe:", err.message);
    res.status(500).json({ message: "Palvelinvirhe" });
  }
});

module.exports = router;
