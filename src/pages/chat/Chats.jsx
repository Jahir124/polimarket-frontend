import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../utils/Functions";

export default function Chats() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        navigate("/");
        return;
      }

      try {
        // 1. Quién soy
        const resMe = await fetch(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resMe.ok) throw new Error("Sesión inválida");
        const me = await resMe.json();
        setCurrentUser(me);

        // 2. Mis chats activos
        const resChats = await fetch(`${API}/chats/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (resChats.ok) {
          const data = await resChats.json();
          setChats(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  if (loading)
    return (
      <div className="container" style={{ textAlign: "center", marginTop: "50px" }}>
        Cargando conversaciones...
      </div>
    );

  return (
    <div>
      {/* HEADER */}
      <header className="header">
        {/* Botón Volver a la página principal */}
        <button
          className="logo"
          style={{
            background: "none",
            border: "none",
            fontSize: "1.1rem",
            cursor: "pointer",
          }}
          onClick={() => navigate("/home")}
        >
          ← Volver
        </button>

        {/* Logo POLIMARKET -> siempre a la página principal */}
        <div
          className="logo"
          onClick={() => navigate("/home")}
          style={{ cursor: "pointer", fontSize: "1.5rem" }}
        >
          POLIMARKET
        </div>

        {/* Icono de usuario (perfil) */}
        <div
          className="user-icon"
          onClick={() => navigate("/profile")}
          style={{ cursor: "pointer" }}
        />
      </header>

      {/* CONTENIDO */}
      <div className="container">
        <h2 style={{ marginTop: 0, marginBottom: "20px" }}>Mis chats activos</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {/* ESTADO VACÍO */}
          {chats.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                background: "var(--bg-card)",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border-color)",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "10px" }}>📭</div>
              <h3>No hay chats activos</h3>
              <p style={{ color: "var(--text-muted)" }}>
                Aún no has iniciado ninguna conversación. Explora el mercado y
                escribe a un vendedor para empezar.
              </p>
              <button
                className="login-btn"
                style={{ width: "auto", marginTop: "20px" }}
                onClick={() => navigate("/home")}
              >
                Ir a la página principal
              </button>
            </div>
          )}

          {/* LISTA DE CHATS */}
          {chats.map((chat) => {
            if (!currentUser) return null;

            // Si soy comprador, el otro es el vendedor. Si soy vendedor, el otro es el comprador
            const otherUser =
              currentUser.id === chat.buyer.id ? chat.seller : chat.buyer;

            return (
              <div
                key={chat.id}
                className="product-card"
                style={{
                  flexDirection: "row",
                  padding: "15px",
                  alignItems: "center",
                  gap: "15px",
                  cursor: "pointer",
                }}
                // Ir al chatroom de este chat
                onClick={() => navigate(`/chat-room?id=${chat.id}`)}
              >
                {/* Imagen del producto */}
                <img
                  src={chat.product.image_url || "https://via.placeholder.com/150"}
                  alt={chat.product.title}
                  style={{
                    width: "70px",
                    height: "70px",
                    borderRadius: "10px",
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                />

                {/* Info principal */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      margin: "0 0 6px 0",
                      fontSize: "1rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {chat.product.title}
                  </h3>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "var(--text-muted)",
                      fontSize: "0.85rem",
                    }}
                  >
                    {/* Avatar del otro usuario */}
                    <div
                      style={{
                        width: "26px",
                        height: "26px",
                        borderRadius: "50%",
                        backgroundColor: "#ccc",
                        backgroundImage: otherUser.profile_image
                          ? `url(${otherUser.profile_image})`
                          : "none",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {otherUser.name || "Usuario"}
                    </span>
                  </div>

                  {/* Último mensaje breve si lo mandas desde el backend */}
                  {chat.last_message && (
                    <p
                      style={{
                        margin: "6px 0 0 0",
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {chat.last_message}
                    </p>
                  )}
                </div>

                {/* Flechita */}
                <div
                  style={{
                    fontSize: "1.5rem",
                    color: "var(--text-muted)",
                    paddingRight: "4px",
                  }}
                >
                  ›
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
