import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API } from "../utils/api";

export default function ChatRoom() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get("id");
  const token = localStorage.getItem("token");
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [msgText, setMsgText] = useState("");
  const messagesEndRef = useRef(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryForm, setDeliveryForm] = useState({
    faculty: "FIEC",
    building: "",
    payment_method: "Efectivo",
  });

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    loadData();
    const interval = setInterval(refreshChat, 2000);
    return () => clearInterval(interval);
  }, [chatId, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadData = async () => {
    try {
      const resMe = await fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resMe.ok) setCurrentUser(await resMe.json());
      await refreshChat();
    } catch (e) {
      navigate("/");
    }
  };

  const refreshChat = async () => {
    if (!chatId) return;
    try {
      const resMsgs = await fetch(`${API}/chats/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resMsgs.ok) setMessages(await resMsgs.json());

      const resMyChats = await fetch(`${API}/chats/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resMyChats.ok) {
        const myChats = await resMyChats.json();
        const currentChat = myChats.find((c) => c.id == chatId);
        if (currentChat) setChat(currentChat);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const sendMsg = async (textOverride = null) => {
    const textToSend = textOverride || msgText;
    if (!textToSend.trim()) return;

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = API.replace(/^https?:\/\//, "");
      const ws = new WebSocket(
        `${protocol}//${host}/ws/chats/${chatId}?token=${token}`
      );

      ws.onopen = () => {
        ws.send(JSON.stringify({ text: textToSend }));
        ws.close();
        setMsgText("");
        setTimeout(refreshChat, 300);
      };

      ws.onerror = (e) => {
        console.warn("WS Error (fallback http):", e);
      };
    } catch (e) {
      console.error("Error creando socket", e);
    }
  };

  const handleConfirmPayment = async () => {
    if (!confirm("¿Confirmar pago recibido?")) return;
    try {
      await fetch(`${API}/chats/${chatId}/confirm_payment`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      refreshChat();
    } catch (e) {
      console.error(e);
    }
  };

  const handlePickupSelf = () => {
    sendMsg("🙋♂️ **Yo recogeré el pedido**");
  };

  const handleDeliverySubmit = async (e) => {
    e.preventDefault();
    if (!chat) return;

    try {
      const res = await fetch(`${API}/orders/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: chat.product_id,
          faculty: deliveryForm.faculty,
          building: deliveryForm.building,
          payment_method: deliveryForm.payment_method,
        }),
      });

      if (res.ok) {
        sendMsg("🛵 **Mi orden la recogerá un repartidor**");
        setShowDeliveryModal(false);
        refreshChat();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getFee = () => {
    const f = deliveryForm.faculty;
    if (["FCNM", "FIEC", "FIMCP"].includes(f)) return 0.25;
    if (["FCSH", "CELEX", "FADCOM"].includes(f)) return 0.5;
    if (f === "FCV") return 1.0;
    return 0.5;
  };

  // ✅ VALIDACIÓN MEJORADA: Esperar hasta que chat y product estén cargados
  if (!currentUser || !chat || !chat.product) {
    return (
      <div className="container" style={{ textAlign: "center", marginTop: "50px" }}>
        <p>Cargando chat...</p>
      </div>
    );
  }

  const isBuyer = currentUser.id === chat.buyer_id;
  const isSeller = currentUser.id === chat.seller_id;
  const product = chat.product; // ✅ Variable auxiliar para mejor legibilidad

  return (
    <div>
      {/* ✅ HEADER CORREGIDO */}
      <header className="header">
        <button className="logo" onClick={() => navigate("/chats")}>
          ← Chats
        </button>
        <div style={{ fontWeight: "bold", color: "var(--primary)" }}>
          {product.title}
        </div>
      </header>

      <div className="container">
        {/* ✅ TARJETA DE PRODUCTO CORREGIDA */}
        <div
          style={{
            background: "var(--bg-card)",
            borderRadius: "12px",
            padding: "1rem",
            marginBottom: "1rem",
            display: "flex",
            gap: "1rem",
            border: "1px solid var(--border-color)",
          }}
        >
          <img
            src={product.image_url || "https://via.placeholder.com/80"}
            style={{ width: "80px", height: "80px", borderRadius: "8px", objectFit: "cover" }}
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/80?text=Sin+Imagen";
            }}
          />
          <div>
            <h3 style={{ margin: 0, color: "var(--text-main)" }}>{product.title}</h3>
            <p style={{ color: "var(--accent)", fontWeight: "bold", fontSize: "1.2rem", margin: "5px 0" }}>
              ${Number(product.price || 0).toFixed(2)}
            </p>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
              {isBuyer ? `Vendedor: ${chat.seller?.name || "Desconocido"}` : `Comprador: ${chat.buyer?.name || "Desconocido"}`}
            </p>
          </div>
        </div>

        {/* Botón de confirmar pago */}
        {isSeller && !chat.payment_confirmed && (
          <button
            onClick={handleConfirmPayment}
            className="login-btn"
            style={{ marginBottom: "1rem", width: "100%" }}
          >
            ✅ Confirmar Pago Recibido
          </button>
        )}

        {/* Botones de delivery */}
        {isBuyer && chat.payment_confirmed && (
          <div style={{ display: "flex", gap: "10px", marginBottom: "1rem" }}>
            <button onClick={handlePickupSelf} className="login-btn" style={{ flex: 1 }}>
              🙋♂️ Recoger Yo
            </button>
            <button
              onClick={() => setShowDeliveryModal(true)}
              className="login-btn"
              style={{ flex: 1, background: "var(--accent)", color: "#0f172a" }}
            >
              🛵 Pedir Delivery
            </button>
          </div>
        )}

        {/* Modal de delivery */}
        {showDeliveryModal && (
          <div className="login-container" style={{ marginBottom: "1rem" }}>
            <h3>Solicitar Delivery</h3>
            <form onSubmit={handleDeliverySubmit}>
              <select
                value={deliveryForm.faculty}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, faculty: e.target.value })}
                className="login-input"
              >
                <option value="FIEC">FIEC</option>
                <option value="FCNM">FCNM</option>
                <option value="FIMCP">FIMCP</option>
                <option value="FCSH">FCSH</option>
                <option value="FCV">FCV</option>
                <option value="CELEX">CELEX</option>
                <option value="FADCOM">FADCOM</option>
              </select>
              <input
                type="text"
                placeholder="Edificio / Aula"
                value={deliveryForm.building}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, building: e.target.value })}
                className="login-input"
                required
              />
              <select
                value={deliveryForm.payment_method}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, payment_method: e.target.value })}
                className="login-input"
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
              </select>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                Tarifa de delivery: ${getFee().toFixed(2)}
              </p>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowDeliveryModal(false)}
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-main)",
                    padding: "10px",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="login-btn" style={{ flex: 1 }}>
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Área de mensajes */}
        <div
          style={{
            background: "var(--bg-card)",
            borderRadius: "12px",
            padding: "1rem",
            height: "400px",
            overflowY: "auto",
            marginBottom: "1rem",
            border: "1px solid var(--border-color)",
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                marginBottom: "10px",
                textAlign: msg.author_id === currentUser.id ? "right" : "left",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  background: msg.author_id === currentUser.id ? "var(--primary)" : "var(--input-bg)",
                  color: msg.author_id === currentUser.id ? "#0f172a" : "var(--text-main)",
                  padding: "10px 15px",
                  borderRadius: "12px",
                  maxWidth: "70%",
                  wordWrap: "break-word",
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input de mensaje */}
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            className="login-input"
            placeholder="Escribe un mensaje..."
            value={msgText}
            onChange={(e) => setMsgText(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMsg()}
            style={{ flex: 1, marginBottom: 0 }}
          />
          <button onClick={() => sendMsg()} className="login-btn" style={{ width: "auto", padding: "0 20px" }}>
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
