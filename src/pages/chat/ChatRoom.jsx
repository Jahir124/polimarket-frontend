import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API } from "../utils/Functions"; // ✅ CAMBIADO DE ../../ A ../

export const ChatRoom = () => {
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
    sendMsg("🙋‍♂️ **Yo recogeré el pedido**");
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

  if (!currentUser || !chat)
    return (
      <div
        className="container"
        style={{ textAlign: "center", marginTop: "50px" }}
      >
        Cargando...
      </div>
    );

  const isSeller = currentUser.id === chat.seller_id;
  const isBuyer = currentUser.id === chat.buyer_id;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "var(--bg-body)",
      }}
    >
      <header className="header">
        <button
          onClick={() => navigate("/chats")}
          style={{
            background: "none",
            border: "none",
            fontSize: "1.2rem",
            color: "var(--text-main)",
            cursor: "pointer",
          }}
        >
          ← Volver
        </button>
        <div
          className="logo"
          onClick={() => navigate("/home")}
          style={{ cursor: "pointer", fontSize: "1.2rem" }}
        >
          POLIMARKET
        </div>
        <div
          className="user-icon"
          onClick={() => navigate("/profile")}
        ></div>
      </header>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "20px",
            opacity: 0.7,
            fontSize: "0.9rem",
          }}
        >
          Producto: <strong>{chat.product?.title}</strong>
          {chat.payment_confirmed && (
            <span style={{ color: "#10b981", marginLeft: "10px" }}>
              ✅ Pagado
            </span>
          )}
        </div>

        {messages.map((m) => {
          const isMe = m.author_id === currentUser.id;
          return (
            <div
              key={m.id}
              style={{
                display: "flex",
                justifyContent: isMe ? "flex-end" : "flex-start",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  background: isMe ? "var(--primary)" : "var(--bg-card)",
                  color: isMe ? "white" : "var(--text-main)",
                  border: isMe ? "none" : "1px solid var(--border-color)",
                  padding: "10px 15px",
                  borderRadius: "15px",
                  maxWidth: "75%",
                  boxShadow: "var(--shadow)",
                  whiteSpace: "pre-line",
                  textAlign: "left",
                }}
              >
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div
        style={{
          padding: "15px",
          background: "var(--bg-card)",
          borderTop: "1px solid var(--border-color)",
        }}
      >
        {isSeller && !chat.payment_confirmed && (
          <button
            className="login-btn"
            style={{
              background: "#27ae60",
              marginBottom: "10px",
              width: "100%",
            }}
            onClick={handleConfirmPayment}
          >
            💰 Confirmar Pago Recibido
          </button>
        )}

        {isBuyer && chat.payment_confirmed && (
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "10px",
              animation: "fadeIn 0.5s",
            }}
          >
            <button
              className="login-btn"
              style={{ background: "var(--text-muted)", flex: 1 }}
              onClick={handlePickupSelf}
            >
              🙋‍♂️ Recoger yo mismo
            </button>
            <button
              className="login-btn"
              style={{ background: "var(--accent)", color: "black", flex: 1 }}
              onClick={() => setShowDeliveryModal(true)}
            >
              🛵 Pedir Delivery
            </button>
          </div>
        )}

        <div style={{ display: "flex", gap: "10px" }}>
          <input
            className="login-input"
            style={{ marginBottom: 0 }}
            placeholder="Escribe..."
            value={msgText}
            onChange={(e) => setMsgText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMsg()}
          />
          <button
            className="login-btn"
            style={{ width: "auto" }}
            onClick={() => sendMsg()}
          >
            Enviar
          </button>
        </div>
      </div>

      {showDeliveryModal && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            backdropFilter: "blur(5px)",
          }}
        >
          <div
            className="modal-content"
            style={{
              background: "var(--bg-card)",
              padding: "25px",
              borderRadius: "16px",
              width: "90%",
              maxWidth: "400px",
              color: "var(--text-main)",
              border: "1px solid var(--border-color)",
            }}
          >
            <h3 style={{ marginTop: 0, color: "var(--primary)" }}>🛵 Delivery</h3>
            <form onSubmit={handleDeliverySubmit}>
              <label>Facultad:</label>
              <select
                className="login-input"
                value={deliveryForm.faculty}
                onChange={(e) =>
                  setDeliveryForm({ ...deliveryForm, faculty: e.target.value })
                }
              >
                <option value="FIEC">FIEC ($0.25)</option>
                <option value="FCNM">FCNM ($0.25)</option>
                <option value="FIMCP">FIMCP ($0.25)</option>
                <option value="FCSH">FCSH ($0.50)</option>
                <option value="FADCOM">FADCOM ($0.50)</option>
                <option value="FCV">FCV ($1.00)</option>
              </select>
              <div
                style={{
                  textAlign: "right",
                  fontWeight: "bold",
                  color: "var(--accent)",
                  marginBottom: "10px",
                }}
              >
                Costo: ${Number(getFee() || 0).toFixed(2)}
              </div>
              <label>Ubicación:</label>
              <input
                className="login-input"
                placeholder="Ej: Aula 105"
                required
                value={deliveryForm.building}
                onChange={(e) =>
                  setDeliveryForm({ ...deliveryForm, building: e.target.value })
                }
              />
              <label>Pago Envío:</label>
              <div
                style={{
                  display: "flex",
                  gap: "15px",
                  marginBottom: "20px",
                }}
              >
                <label>
                  <input
                    type="radio"
                    name="pay"
                    value="Efectivo"
                    checked={deliveryForm.payment_method === "Efectivo"}
                    onChange={(e) =>
                      setDeliveryForm({
                        ...deliveryForm,
                        payment_method: e.target.value,
                      })
                    }
                  />{" "}
                  Efectivo
                </label>
                <label>
                  <input
                    type="radio"
                    name="pay"
                    value="Transferencia"
                    checked={deliveryForm.payment_method === "Transferencia"}
                    onChange={(e) =>
                      setDeliveryForm({
                        ...deliveryForm,
                        payment_method: e.target.value,
                      })
                    }
                  />{" "}
                  Transferencia
                </label>
              </div>
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
        </div>
      )}
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
};
