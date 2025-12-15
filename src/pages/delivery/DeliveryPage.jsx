import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../utils/api";

export default function DeliveryPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [orders, setOrders] = useState([]);
  const [myStats, setMyStats] = useState({ earned: 0, completed: 0 });
  const [activeTab, setActiveTab] = useState("available");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Sesión inválida");
        return res.json();
      })
      .then((data) => {
        setCurrentUser(data);
        // ✅ VERIFICAR SI ES DELIVERY
        if (!data.is_delivery) {
          alert("No tienes acceso a esta sección");
          navigate("/");
        }
      })
      .catch(() => navigate("/"));

    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const res = await fetch(`${API}/delivery/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (currentUser && orders.length > 0) {
      calculateStats(orders);
    }
  }, [currentUser, orders]);

  const calculateStats = (data) => {
    if (!currentUser) return;

    const mine = data.filter(
      (o) => o.delivery_person_id === currentUser.id && o.status === "accepted"
    );

    const potential = mine.reduce((sum, o) => {
      const fee = Number(o.delivery_fee ?? 0.5);
      return sum + (isNaN(fee) ? 0.5 : fee);
    }, 0);

    setMyStats((prev) => ({ ...prev, earned: potential }));
  };

  // ✅ CORREGIDO: AHORA ENVIA JSON BODY
  const updateStatus = async (id, status) => {
    const action = status === "accepted" ? "Aceptar pedido" : "Confirmar entrega";
    if (!confirm(`¿${action}?`)) return;

    try {
      const res = await fetch(`${API}/delivery/orders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Error actualizando orden");
      }

      if (status === "completed") {
        setMyStats((prev) => ({
          earned: prev.earned,
          completed: prev.completed + 1,
        }));
        alert("¡Excelente trabajo! +1 Entrega completada.");
      }

      loadOrders();
    } catch (e) {
      console.error(e);
      alert(e.message || "Error actualizando estado");
    }
  };

  const formatPrice = (value) => {
    const num = Number(value ?? 0);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  if (!currentUser)
    return (
      <div className="container">
        <p>Verificando acceso...</p>
      </div>
    );

  const available = orders.filter((o) => o.status === "pending");
  const myActive = orders.filter(
    (o) => o.delivery_person_id === currentUser.id && o.status === "accepted"
  );

  return (
    <div className="container">
      <h1>🛵 Panel de Delivery</h1>

      <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem" }}>
        <div className="login-container" style={{ flex: 1, textAlign: "center" }}>
          <h3>💰 Ganancia Potencial</h3>
          <p style={{ fontSize: "2rem", color: "var(--accent)" }}>
            ${formatPrice(myStats.earned)}
          </p>
        </div>
        <div className="login-container" style={{ flex: 1, textAlign: "center" }}>
          <h3>✅ Completadas</h3>
          <p style={{ fontSize: "2rem", color: "var(--primary)" }}>
            {myStats.completed}
          </p>
        </div>
      </div>

      <div className="tabs" style={{ justifyContent: "center" }}>
        <button
          className={activeTab === "available" ? "active" : ""}
          onClick={() => setActiveTab("available")}
        >
          📦 Disponibles ({available.length})
        </button>
        <button
          className={activeTab === "active" ? "active" : ""}
          onClick={() => setActiveTab("active")}
        >
          🚴 Mis Entregas ({myActive.length})
        </button>
      </div>

      {activeTab === "available" && (
        <div>
          {available.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--text-muted)" }}>
              😴 No hay pedidos pendientes. Espera un momento...
            </p>
          ) : (
            available.map((order) => (
              <div key={order.id} className="login-container" style={{ marginBottom: "1rem" }}>
                <h3>Pedido #{order.id}</h3>
                <p>
                  <strong>Destino:</strong> {order.faculty} - {order.building || "Sin ubicación"}
                </p>
                <p>
                  <strong>Tarifa delivery:</strong> ${formatPrice(order.delivery_fee)}
                </p>
                <p>
                  <strong>Total a cobrar:</strong> ${formatPrice(order.total_amount)}
                </p>
                <p>
                  <strong>Pago:</strong> {order.payment_method}
                </p>
                <button
                  className="login-btn"
                  onClick={() => updateStatus(order.id, "accepted")}
                >
                  Aceptar Pedido
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "active" && (
        <div>
          {myActive.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--text-muted)" }}>
              No tienes entregas en curso.
            </p>
          ) : (
            myActive.map((order) => (
              <div key={order.id} className="login-container" style={{ marginBottom: "1rem" }}>
                <h3>Pedido #{order.id}</h3>
                <p>
                  <strong>Destino:</strong> {order.faculty} - {order.building}
                </p>
                <p>
                  <strong>Total a cobrar:</strong> ${formatPrice(order.total_amount)}
                </p>
                <p>
                  <strong>Pago:</strong> {order.payment_method}
                </p>
                <button
                  className="login-btn"
                  onClick={() => updateStatus(order.id, "completed")}
                >
                  Confirmar Entrega
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
