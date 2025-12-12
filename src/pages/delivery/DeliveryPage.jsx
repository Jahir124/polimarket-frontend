import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../utils/Functions";

export default function DeliveryPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [orders, setOrders] = useState([]);
  const [myStats, setMyStats] = useState({ earned: 0, completed: 0 });
  const [activeTab, setActiveTab] = useState("available"); // 'available' | 'mine'
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    // 1. Cargar quién soy
    fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setCurrentUser(data))
      .catch(() => navigate("/"));

    // 2. Cargar órdenes iniciales
    loadOrders();

    // 3. Polling: Actualizar cada 5 segundos para ver nuevos pedidos en vivo
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
        calculateStats(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Calcular estadísticas locales (basadas en lo cargado)
  const calculateStats = (data) => {
    if (!currentUser) return;

    const mine = data.filter(
      (o) => o.delivery_person_id === currentUser.id && o.status === "accepted"
    );
    // Suma potencial de lo que tienes en la mano
    const potential = mine.reduce(
      (sum, o) => sum + Number(o.delivery_fee ?? 0.5),
      0
    );
    setMyStats((prev) => ({ ...prev, earned: potential }));
  };

  const updateStatus = async (id, status) => {
    const action = status === "accepted" ? "Aceptar pedido" : "Confirmar entrega";
    if (!confirm(`¿${action}?`)) return;

    try {
      await fetch(`${API}/delivery/orders/${id}?status=${status}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

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
    }
  };

  if (!currentUser)
    return (
      <div
        className="container"
        style={{ textAlign: "center", marginTop: "50px" }}
      >
        Cargando sistema...
      </div>
    );

  // Filtrar órdenes según la pestaña
  const availableOrders = orders.filter((o) => o.status === "pending");
  const myActiveOrders = orders.filter(
    (o) => o.delivery_person_id === currentUser.id && o.status === "accepted"
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-body)" }}>
      {/* --- HEADER TÁCTICO --- */}
      <header
        className="header"
        style={{ background: "#0f172a", borderBottom: "1px solid #334155" }}
      >
        <button
          className="logo"
          style={{
            color: "#94a3b8",
            background: "none",
            border: "none",
            fontSize: "1rem",
          }}
          onClick={() => navigate("/config")}
        >
          ← Salir
        </button>
        <div
          style={{
            color: "var(--primary)",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          🛵 MODO REPARTIDOR
          <div
            className="user-icon"
            style={{
              width: "30px",
              height: "30px",
              backgroundImage: `url(${currentUser.profile_image})`,
            }}
          ></div>
        </div>
      </header>

      <div className="container">
        {/* --- STATS BAR (RESUMEN DEL DÍA) --- */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "15px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              background: "var(--bg-card)",
              padding: "15px",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              En Curso (Estimado)
            </div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "var(--accent)",
              }}
            >
              ${Number(myStats.earned || 0).toFixed(2)}
            </div>
          </div>
          <div
            style={{
              background: "var(--bg-card)",
              padding: "15px",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Entregas Hoy
            </div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              {myStats.completed}
            </div>
          </div>
        </div>

        {/* --- TABS --- */}
        <div
          className="tabs"
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            background: "var(--bg-card)",
            padding: "5px",
            borderRadius: "12px",
          }}
        >
          <button
            style={{
              flex: 1,
              borderRadius: "8px",
              background:
                activeTab === "available" ? "var(--primary)" : "transparent",
              color:
                activeTab === "available"
                  ? "#0f172a"
                  : "var(--text-muted)",
            }}
            onClick={() => setActiveTab("available")}
          >
            🔥 Disponibles ({availableOrders.length})
          </button>
          <button
            style={{
              flex: 1,
              borderRadius: "8px",
              background:
                activeTab === "mine" ? "var(--accent)" : "transparent",
              color:
                activeTab === "mine" ? "#0f172a" : "var(--text-muted)",
            }}
            onClick={() => setActiveTab("mine")}
          >
            🚀 Mis Entregas ({myActiveOrders.length})
          </button>
        </div>

        {/* --- LISTA DE PEDIDOS --- */}
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          {/* VISTA: DISPONIBLES */}
          {activeTab === "available" && (
            <>
              {availableOrders.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "var(--text-muted)",
                  }}
                >
                  <p>😴 No hay pedidos pendientes.</p>
                  <small>Espera un momento...</small>
                </div>
              )}
              {availableOrders.map((order) => (
                <div
                  key={order.id}
                  className="product-card"
                  style={{
                    padding: "20px",
                    borderLeft: "5px solid var(--primary)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div>
                      <h2
                        style={{
                          margin: 0,
                          color: "var(--text-main)",
                        }}
                      >
                        {order.faculty}
                      </h2>
                      <p
                        style={{
                          margin: "5px 0",
                          color: "var(--text-muted)",
                        }}
                      >
                        {order.building}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          background: "rgba(56, 189, 248, 0.1)",
                          color: "var(--primary)",
                          padding: "5px 10px",
                          borderRadius: "8px",
                          fontWeight: "bold",
                        }}
                      >
                        +$
                        {Number(order.delivery_fee ?? 0.5).toFixed(2)}
                      </div>
                      <small
                        style={{
                          display: "block",
                          marginTop: "5px",
                          color: "var(--text-muted)",
                        }}
                      >
                        {order.payment_method}
                      </small>
                    </div>
                  </div>
                  <hr
                    style={{
                      borderColor: "var(--border-color)",
                      opacity: 0.3,
                      margin: "15px 0",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: "0.9rem" }}>
                      Total a cobrar:{" "}
                      <strong>
                        $
                        {Number(order.total_amount ?? 0).toFixed(2)}
                      </strong>
                    </span>
                    <button
                      className="login-btn"
                      style={{
                        width: "auto",
                        padding: "10px 20px",
                        fontSize: "0.9rem",
                      }}
                      onClick={() => updateStatus(order.id, "accepted")}
                    >
                      Aceptar Pedido
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* VISTA: MIS ENTREGAS */}
          {activeTab === "mine" && (
            <>
              {myActiveOrders.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "var(--text-muted)",
                  }}
                >
                  <p>No tienes entregas en curso.</p>
                  <button
                    style={{
                      color: "var(--primary)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                    onClick={() => setActiveTab("available")}
                  >
                    Ir a buscar pedidos
                  </button>
                </div>
              )}
              {myActiveOrders.map((order) => (
                <div
                  key={order.id}
                  className="product-card"
                  style={{
                    padding: "20px",
                    borderLeft: "5px solid var(--accent)",
                    background: "rgba(251, 191, 36, 0.05)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{
                        background: "var(--accent)",
                        color: "black",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                      }}
                    >
                      EN CURSO
                    </span>
                    <span
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "0.9rem",
                      }}
                    >
                      Orden #{order.id}
                    </span>
                  </div>

                  <h2
                    style={{
                      marginTop: "10px",
                      color: "var(--text-main)",
                    }}
                  >
                    📍 {order.faculty} - {order.building}
                  </h2>

                  <div
                    style={{
                      background: "var(--bg-body)",
                      padding: "10px",
                      borderRadius: "8px",
                      margin: "15px 0",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>Cobrar al cliente:</span>
                      <strong style={{ fontSize: "1.2rem" }}>
                        $
                        {Number(order.total_amount ?? 0).toFixed(2)}
                      </strong>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.9rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      <span>Método:</span>
                      <span>{order.payment_method}</span>
                    </div>
                  </div>

                  <button
                    className="login-btn"
                    style={{ background: "#10b981", width: "100%" }}
                    onClick={() => updateStatus(order.id, "completed")}
                  >
                    ✅ Confirmar Entrega Realizada
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
