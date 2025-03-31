const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const path = require('path');
const connectDB = require('./db');

// Reitit
const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');
const userRoutes = require('./routes/user');
const uploadRoutes = require('./routes/upload');

// Yhdistä tietokantaan
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Reitit
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);


app.use((err, req, res, next) => {
  console.error('Palvelinvirhe:', err.message);
  res.status(500).json({ message: 'Palvelinvirhe', error: err.message });
});

// Käynnistä palvelin
app.listen(PORT, () => {
  console.log(`Serveri käynnissä portissa ${PORT}`);
});
