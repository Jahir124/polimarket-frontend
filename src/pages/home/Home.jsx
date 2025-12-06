import { useEffect } from "react";
import { listProducts, loadMe } from "../utils/Functions";
import { useNavigate } from "react-router-dom";
import burbuja from "../../assets/burbujatxt.png";

const Home = () => {
    const navigate = useNavigate()
    const handleOpenChat = () => {
        navigate('/chat-room')
    }

  useEffect(() => {
    loadMe();       
    listProducts(); 
  }, []);

  return (
    <>
      <header className="header">
        <a href="/home" className="logo">POLIMARKET</a>
        <div
          className="user-icon"
          id="user-icon"
          onClick={() => navigate('/dashboard')}
        ></div>
      </header>

      <div className="container">
        <div className="search-container">
          <input
            type="text"
            className="search-bar"
            id="search-input"
            placeholder="Buscar sanduches, empanadas..."
          />

          <div className="filter-container">
            <button
              className="filter-btn"
              onClick={(e) => window.toggleFilterDropdown(e)}
            >
              Filtrar
            </button>

            <div className="filter-dropdown" id="filterDropdown">
              <h4>Categoria</h4>
              <label><input type="checkbox" name="category" value="food" /> Alimenticio</label>
              <label><input type="checkbox" name="category" value="electronics" /> Electronico</label>
              <label><input type="checkbox" name="category" value="study" /> Material de Estudio</label>

              <hr />
              <h4>Precio</h4>
              <div className="price-inputs">
                <input type="number" id="price-min" placeholder="Min" className="price-input" />
                <input type="number" id="price-max" placeholder="Max" className="price-input" />
              </div>

              <button
                className="apply-filter-btn"
                onClick={() => window.applyFilters()}
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>

        <div className="product-grid" id="products"></div>
      </div>

      <div className="chat-bubble" onClick={handleOpenChat}>
        <img src={burbuja} alt="abrir chat" />
      </div>
    </>
  );
};

export default Home;
