const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ingredients: { type: [String], required: true },
  instructions: { type: String, required: true },
  image: { type: String }, // polku ladattuun kuvaan
  category: { type: String }, // esim. Aamiainen, Lounas, jne.
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true // lisää createdAt ja updatedAt automaattisesti
});

module.exports = mongoose.model('Recipe', RecipeSchema);
