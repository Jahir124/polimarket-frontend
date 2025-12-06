import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import burbuja from "../../assets/burbujatxt.png";

export default function SellerPage() {
  const navigate = useNavigate();

  const [userImage, setUserImage] = useState(null);
  const [monthlySales, setMonthlySales] = useState(0);
  const [monthlyProfit, setMonthlyProfit] = useState(0);

  const loadMe = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/auth/me", {
        credentials: "include",
      });

      if (!res.ok) return;

      const data = await res.json();
      setUserImage(data.profile_image || null);
    } catch (err) {
      console.error("Error loading user:", err);
    }
  };

  const loadAnalytics = async () => {
    try {
      // TODO: Fetch real analytics from backend
      // Example:
      // const res = await fetch("http://127.0.0.1:8000/analytics", { credentials:"include" })
      // const data = await res.json();
      // setMonthlySales(data.sales);
      // setMonthlyProfit(data.profit);

      // Temporary static values
      setMonthlySales(120);
      setMonthlyProfit(450.0);
    } catch (err) {
      console.error("Error loading analytics:", err);
    }
  };

  useEffect(() => {
    loadMe();
    loadAnalytics();
  }, []);

  return (
    <div>
      <header className="header">
        <button
          className="logo"
          style={{ fontSize: "1.2rem" }}
          onClick={() => navigate("/hub")}
        >
          Ir a comprar
        </button>

        <div
          className="user-icon"
          style={{
            backgroundImage: userImage ? `url(${userImage})` : "none",
            backgroundSize: "cover",
          }}
        ></div>
      </header>

      <div className="container seller-dashboard">
        <h2>Panel de Vendedor</h2>

        <div className="analytics-container">
          <div className="analytics-card">
            <h3>Ventas Mensuales</h3>
            <div className="analytics-value">{monthlySales}</div>
          </div>

          <div className="analytics-card">
            <h3>Ganancia Mensual</h3>
            <div className="analytics-value profit">
              ${monthlyProfit.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="seller-menu">
          <ul>
            <li onClick={() => navigate("/add-product")}>Añadir Producto</li>
            <li onClick={() => alert("Funcionalidad: Editar Producto")}>
              Editar Producto
            </li>
            <li onClick={() => alert("Funcionalidad: Eliminar Producto")}>
              Eliminar Producto
            </li>
            <li onClick={() => alert("Funcionalidad: Ver Reseñas")}>
              Ver Reseñas
            </li>
          </ul>
        </div>
      </div>

      <div className="chat-bubble">
        <img src={burbuja} alt="abrir chat" />
      </div>
    </div>
  );
}
