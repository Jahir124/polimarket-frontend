import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../utils/Functions"; // Ajusta la ruta si es necesario

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
        // 1. Obtener mi usuario
        const resMe = await fetch(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resMe.ok) throw new Error("Sesión inválida");
        const me = await resMe.json();
        setCurrentUser(me);

        // 2. Obtener mis chats
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
      <header className="header">
        <button
          className="logo"
          style={{ background: "none", border: "none", fontSize: "1.1rem", cursor: "pointer", color: "var(--text-main)" }}
          onClick={() => navigate("/home")}
        >
          ← Volver
        </button>

        <div
          className="logo"
          onClick={() => navigate("/home")}
          style={{ cursor: "pointer", fontSize: "1.5rem" }}
        >
          POLIMARKET
        </div>

        <div
          className="user-icon"
          onClick={() => navigate("/profile")}
          style={{ cursor: "pointer" }}
        />
      </header>

      <div className="container">
        <h2 style={{ marginTop: 0, marginBottom: "20px" }}>Mis chats activos</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          
          {/* ESTADO VACÍO */}
          {chats.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px", background: "var(--bg-card)", borderRadius: "var(--radius)", border: "1px solid var(--border-color)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "10px" }}>📭</div>
              <h3>No hay chats activos</h3>
              <p style={{ color: "var(--text-muted)" }}>Explora el mercado y escribe a un vendedor.</p>
              <button className="login-btn" style={{ width: "auto", marginTop: "20px" }} onClick={() => navigate("/home")}>
                Ir a comprar
              </button>
            </div>
          )}

          {/* LISTA DE CHATS */}
          {chats.map((chat) => {
            if (!currentUser) return null;

            // --- CORRECCIÓN CLAVE AQUÍ ---
            // 1. Usamos optional chaining (?.) y valores por defecto para no romper la app
            const buyer = chat.buyer || {};
            const seller = chat.seller || {};
            const product = chat.product || {};

            // 2. Usamos los IDs directos (que siempre existen) para saber quién soy
            // Si chat.buyer_id no existe, intentamos leerlo del objeto buyer, y si no, fallback a 0
            const buyerId = chat.buyer_id || buyer.id;
            
            const isMeBuyer = currentUser.id === buyerId;
            
            // 3. Determinar quién es el "otro" de forma segura
            let otherUser = isMeBuyer ? seller : buyer;

            // 4. Si por alguna razón el objeto sigue vacío, ponemos un placeholder visual
            if (!otherUser || !otherUser.name) {
                otherUser = { 
                    name: "Usuario (Cargando...)", 
                    profile_image: null 
                };
            }
            // -----------------------------

            return (
              <div
                key={chat.id}
                className="product-card"
                style={{ flexDirection: "row", padding: "15px", alignItems: "center", gap: "15px", cursor: "pointer" }}
                onClick={() => navigate(`/chat-room?id=${chat.id}`)}
              >
                <img
                  src={product.image_url || "https://via.placeholder.com/150"}
                  alt={product.title || "Producto"}
                  style={{ width: "70px", height: "70px", borderRadius: "10px", objectFit: "cover", flexShrink: 0 }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: "0 0 6px 0", fontSize: "1rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {product.title || "Producto sin nombre"}
                  </h3>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    <div
                      style={{
                        width: "26px", height: "26px", borderRadius: "50%", backgroundColor: "#ccc",
                        backgroundImage: otherUser.profile_image ? `url(${otherUser.profile_image})` : "none",
                        backgroundSize: "cover", backgroundPosition: "center", flexShrink: 0
                      }}
                    />
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {otherUser.name}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: "1.5rem", color: "var(--text-muted)", paddingRight: "4px" }}>›</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}