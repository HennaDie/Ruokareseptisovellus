import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Recipes from "./pages/Recipes";
import Favorites from "./pages/Favorites";
import EditRecipe from "./pages/EditRecipe";
import AddRecipe from "./pages/AddRecipe";
import MyRecipes from "./pages/MyRecipes";

import "./App.css";

const App = () => {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/edit/:id" element={<EditRecipe />} />
        <Route path="/add" element={<AddRecipe />} />
        <Route path="/my-recipes" element={<MyRecipes />} />
      </Routes>
    </div>
  );
};

export default App;
