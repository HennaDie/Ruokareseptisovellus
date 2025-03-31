import React from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";

const Home = () => {
  const token = localStorage.getItem("token");

  return (
    <Layout>
      {token && (
        <div className="new-recipe-button">
          <Link to="/add">
            <button>Uusi resepti</button>
          </Link>
        </div>
      )}

      <div className="welcome-text">
        <h2>Tervetuloa!</h2>
        <p>Tässä sovelluksessa voit lisätä ja etsiä reseptejä.</p>
        <p>Kirjaudu sisään tai rekisteröidy päästäksesi alkuun.</p>
      </div>
    </Layout>
  );
};

export default Home;
