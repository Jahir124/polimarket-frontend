// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadMe } from "../utils/Functions";
import { API } from "../utils/api";

import burbuja from "../../assets/burbujatxt.png";

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  // Filtros
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCats, setSelectedCats] = useState([]);

  useEffect(() => {
    loadMe();
    fetchProducts();
    fetchFavorites();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API}/products`);
      const data = await res.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error("Error productos", error);
    }
  };

  const fetchFavorites = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API}/users/me/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFavorites(new Set(data.map((p) => p.id)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleFavorite = async (e, productId) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) return alert("Inicia sesión para guardar favoritos");

    const newFavs = new Set(favorites);
    if (newFavs.has(productId)) {
      newFavs.delete(productId);
    } else {
      newFavs.add(productId);
    }
    setFavorites(newFavs);

    try {
      await fetch(`${API}/products/${productId}/favorite`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Error al dar like", error);
    }
  };

  useEffect(() => {
    let result = products;
    if (searchTerm) {
      result = result.filter((p) =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCats.length > 0) {
      result = result.filter((p) => selectedCats.includes(p.category));
    }
    setFilteredProducts(result);
  }, [searchTerm, selectedCats, products]);

  const handleCatChange = (e) => {
    const val = e.target.value;
    if (e.target.checked) setSelectedCats([...selectedCats, val]);
    else setSelectedCats(selectedCats.filter((c) => c !== val));
  };

  return (
    <>
      <header className="header">
        <div
          className="logo"
          onClick={() => navigate("/home")}
          style={{ cursor: "pointer" }}
        >
          POLIMARKET
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.4rem",
            }}
            title="Cambiar tema"
          >
            {darkMode ? "🌙" : "☀️"}
          </button>

          <div
            className="user-icon"
            onClick={() => navigate("/seller")}
          ></div>
        </div>
      </header>

      <div className="container">
        <div className="search-container">
          <input
            type="text"
            className="search-bar"
            placeholder="¿Qué buscas hoy?"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="filter-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            Filtros ▾
          </button>
          {showFilters && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                background: "white",
                padding: "1rem",
                boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                borderRadius: "12px",
                zIndex: 10,
              }}
            >
              <label style={{ display: "block" }}>
                <input type="checkbox" value="food" onChange={handleCatChange} />{" "}
                🍔 Comida
              </label>
              <label style={{ display: "block" }}>
                <input
                  type="checkbox"
                  value="electronics"
                  onChange={handleCatChange}
                />{" "}
                💻 Tech
              </label>
              <label style={{ display: "block" }}>
                <input
                  type="checkbox"
                  value="study"
                  onChange={handleCatChange}
                />{" "}
                📚 Estudio
              </label>
            </div>
          )}
        </div>

        <div className="product-grid">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="product-card"
              onClick={() => navigate(`/product/${p.id}`)}
            >
              <img
                src={p.image_url || "https://via.placeholder.com/150"}
                alt={p.title}
              />

              <div className="product-info">
                <div>
                  <h3>{p.title}</h3>
                  
                  {/* ✅ NOMBRE DEL VENDEDOR */}
                  {p.seller && (
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--text-muted)",
                        marginTop: "4px",
                        marginBottom: "6px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span>👤</span>
                      <span>{p.seller.name}</span>
                    </div>
                  )}

                  <div className="product-price">
                    ${Number(p.price || 0).toFixed(2)}
                  </div>
                </div>

                <button
                  className={`favorite-btn ${
                    favorites.has(p.id) ? "liked" : ""
                  }`}
                  onClick={(e) => toggleFavorite(e, p.id)}
                >
                  {favorites.has(p.id) ? "♥" : "♡"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-bubble" onClick={() => navigate("/chats")}>
        <img src={burbuja} alt="Chats" />
      </div>
    </>
  );
};

export default Home;
