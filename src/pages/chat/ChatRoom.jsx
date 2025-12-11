import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API, loadMe } from "../utils/Functions";

export const ChatRoom = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get("id");
  const token = localStorage.getItem("token");

  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [msgText, setMsgText] = useState("");
  
  // Estado para Modal de Delivery
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryForm, setDeliveryForm] = useState({ faculty: "FIEC", building: "", payment_method: "Efectivo" });

  useEffect(() => {
    loadData();
    // Polling para actualizar mensajes y estado del chat cada 3 seg
    const interval = setInterval(refreshChat, 3000); 
    return () => clearInterval(interval);
  }, [chatId]);

  const loadData = async () => {
    // 1. Cargar Usuario
    const resMe = await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` }});
    const me = await resMe.json();
    setCurrentUser(me);

    // 2. Cargar Info del Chat (Participantes, estado de pago)
    // Nota: Necesitamos un endpoint que devuelva info del chat, usaremos lógica simple por ahora
    refreshChat();
  };

  const refreshChat = async () => {
    if(!chatId || !token) return;
    try {
        // Cargar Mensajes
        const resMsgs = await fetch(`${API}/chats/${chatId}/messages`, { headers: { Authorization: `Bearer ${token}` }});
        if(resMsgs.ok) {
            const msgs = await resMsgs.json();
            setMessages(msgs);
        }

        // Cargar Metadatos del Chat (Para saber si payment_confirmed es true)
        // Agregamos este fetch a mano simulando que el backend nos da info extra del chat
        // (Nota: Idealmente tu endpoint /chats/{id}/messages debería devolver también el objeto chat,
        // pero para no romper todo, haremos un truco: buscaremos el chat en la lista de "mis chats")
        const resMyChats = await fetch(`${API}/chats/my`, { headers: { Authorization: `Bearer ${token}` }});
        const myChats = await resMyChats.json();
        const currentChat = myChats.find(c => c.id == chatId);
        if(currentChat) setChat(currentChat);

    } catch(e) { console.error(e); }
  };

  const sendMsg = async (textOverride = null) => {
    const textToSend = textOverride || msgText;
    if (!textToSend.trim()) return;

    // Enviar por WebSocket o HTTP (Usamos HTTP para simplificar el MVP y garantizar orden)
    // Pero tu backend usa Websocket. Vamos a simular el envío enviando al socket si estuviera abierto
    // O mejor, usaremos una lógica simple de POST si tu backend tuviera, 
    // pero como configuraste WS, asumiremos que el usuario escribe y se manda.
    
    // **CORRECCIÓN**: Para asegurar que funcione con tu backend actual que usa WS en el ejemplo original:
    const ws = new WebSocket(`wss://api-polimarket.onrender.com/ws/chats/${chatId}?token=${token}`);
    // Nota: En local usa ws://127.0.0.1:8000
    
    ws.onopen = () => {
        ws.send(JSON.stringify({ text: textToSend }));
        ws.close();
        setMsgText("");
        setTimeout(refreshChat, 500); // Refrescar rápido
    };
  };
  
  // --- ACCIONES DEL VENDEDOR ---
  const handleConfirmPayment = async () => {
    if(!confirm("¿Confirmar que ya recibiste el dinero del producto?")) return;
    await fetch(`${API}/chats/${chatId}/confirm_payment`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }
    });
    refreshChat();
  };

  // --- ACCIONES DEL COMPRADOR ---
  const handlePickupSelf = () => {
    sendMsg("🙋‍♂️ **Yo recogeré mi pedido personalmente.**");
  };

  const handleDeliverySubmit = async (e) => {
    e.preventDefault();
    if(!chat) return;

    // 1. Crear la Orden
    const res = await fetch(`${API}/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
            product_id: chat.product_id,
            faculty: deliveryForm.faculty,
            building: deliveryForm.building,
            payment_method: deliveryForm.payment_method
        })
    });

    if(res.ok) {
        // 2. El backend ya mandó el mensaje "Un repartidor recogerá..."
        alert("Solicitud de delivery enviada. Esperando a que un repartidor acepte.");
        setShowDeliveryModal(false);
        // Redirigir al panel de delivery o quedarse aquí
        navigate("/delivery-dashboard"); // Opcional: Llevar a ver el estado
    }
  };

  // Renderizado de Mensajes
  const renderMessage = (m) => {
    const isMe = currentUser && m.author_id === currentUser.id;
    return (
        <div key={m.id} style={{
            display:'flex', 
            justifyContent: isMe ? 'flex-end' : 'flex-start', 
            marginBottom:'10px'
        }}>
            <div style={{
                background: isMe ? 'var(--primary)' : 'var(--bg-card)',
                color: isMe ? 'white' : 'var(--text-main)',
                padding:'10px 15px', 
                borderRadius:'15px',
                maxWidth:'70%',
                boxShadow:'0 2px 5px rgba(0,0,0,0.05)',
                whiteSpace: 'pre-line' // Para que respete los saltos de línea
            }}>
                {m.text}
                <div style={{fontSize:'0.7rem', opacity:0.7, marginTop:'5px', textAlign:'right'}}>
                    {new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
            </div>
        </div>
    );
  }

  // Lógica de Tarifas para mostrar en el Modal
  const getFee = () => {
    const f = deliveryForm.faculty;
    if(["FCNM", "FIEC", "FIMCP"].includes(f)) return 0.25;
    if(["FCSH", "CELEX", "FADCOM"].includes(f)) return 0.50;
    if(f === "FCV") return 1.00;
    return 0.50;
  }

  if (!currentUser || !chat) return <div className="container">Cargando chat...</div>;

  const isSeller = currentUser.id === chat.seller_id;
  const isBuyer = currentUser.id === chat.buyer_id;

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100vh', background:'var(--bg-body)'}}>
      <header className="header">
        <button onClick={() => navigate("/chats")} style={{background:'none', border:'none', fontSize:'1.2rem'}}>←</button>
        <div style={{fontWeight:'bold'}}>{chat.product ? chat.product.title : 'Chat'}</div>
        <div className="user-icon" onClick={()=>navigate('/profile')}></div>
      </header>

      {/* ÁREA DE MENSAJES */}
      <div style={{flex:1, overflowY:'auto', padding:'20px'}}>
        {messages.map(renderMessage)}
      </div>

      {/* --- BARRA DE ACCIONES (Lógica de Negocio) --- */}
      <div style={{padding:'10px', background:'var(--bg-card)', borderTop:'1px solid var(--border-color)'}}>
        
        {/* CASO 1: SOY VENDEDOR y Aún no confirmo pago */}
        {isSeller && !chat.payment_confirmed && (
            <button 
                className="login-btn" 
                style={{background:'#2ecc71', marginBottom:'10px'}}
                onClick={handleConfirmPayment}
            >
                💰 Confirmar Pago Recibido
            </button>
        )}

        {/* CASO 2: SOY COMPRADOR y El pago ya fue confirmado */}
        {isBuyer && chat.payment_confirmed && (
            <div style={{display:'flex', gap:'10px', marginBottom:'10px'}}>
                <button 
                    className="login-btn" 
                    style={{background:'var(--text-muted)', flex:1}}
                    onClick={handlePickupSelf}
                >
                    🙋‍♂️ Recoger yo mismo
                </button>
                <button 
                    className="login-btn" 
                    style={{background:'var(--accent)', flex:1, color:'black'}}
                    onClick={() => setShowDeliveryModal(true)}
                >
                    🛵 Pedir Delivery
                </button>
            </div>
        )}

        {/* INPUT NORMAL DE CHAT */}
        <div style={{display:'flex', gap:'10px'}}>
            <input 
                className="login-input" 
                style={{marginBottom:0}} 
                placeholder="Escribe un mensaje..."
                value={msgText}
                onChange={e => setMsgText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMsg()}
            />
            <button className="login-btn" style={{width:'auto'}} onClick={() => sendMsg()}>Enviar</button>
        </div>
      </div>

      {/* --- MODAL DELIVERY --- */}
      {showDeliveryModal && (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>🛵 Solicitar Repartidor</h3>
                <form onSubmit={handleDeliverySubmit}>
                    <label>Facultad (Define tarifa):</label>
                    <select className="login-input" value={deliveryForm.faculty} onChange={e => setDeliveryForm({...deliveryForm, faculty: e.target.value})}>
                        <option value="FIEC">FIEC ($0.25)</option>
                        <option value="FCNM">FCNM ($0.25)</option>
                        <option value="FIMCP">FIMCP ($0.25)</option>
                        <option value="FCSH">FCSH / CELEX ($0.50)</option>
                        <option value="FADCOM">FADCOM ($0.50)</option>
                        <option value="FCV">FCV ($1.00)</option>
                    </select>
                    
                    <p style={{textAlign:'right', fontWeight:'bold', color:'var(--accent)'}}>
                        Costo Envío: ${getFee().toFixed(2)}
                    </p>

                    <label>Ubicación exacta:</label>
                    <input className="login-input" placeholder="Aula, piso..." required value={deliveryForm.building} onChange={e => setDeliveryForm({...deliveryForm, building: e.target.value})}/>
                    
                    <label>Método de Pago (del envío):</label>
                    <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
                         <label><input type="radio" name="pay" value="Efectivo" checked={deliveryForm.payment_method === 'Efectivo'} onChange={e => setDeliveryForm({...deliveryForm, payment_method: e.target.value})}/> Efectivo</label>
                         <label><input type="radio" name="pay" value="Transferencia" checked={deliveryForm.payment_method === 'Transferencia'} onChange={e => setDeliveryForm({...deliveryForm, payment_method: e.target.value})}/> Transferencia</label>
                    </div>

                    <div style={{display:'flex', gap:'10px'}}>
                        <button type="button" onClick={() => setShowDeliveryModal(false)} style={{flex:1, background:'transparent', border:'1px solid #ccc', color:'var(--text-main)', padding:'10px', borderRadius:'8px'}}>Cancelar</button>
                        <button type="submit" className="login-btn" style={{flex:1}}>Confirmar</button>
                    </div>
                </form>
            </div>
        </div>
      )}
      
      {/* Estilos Modal inline por si acaso */}
      <style>{`
        .modal-overlay { position: fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.6); display:flex; justify-content:center; align-items:center; z-index:999; }
        .modal-content { background: var(--bg-card); padding:20px; border-radius:16px; width:90%; max-width:400px; color:var(--text-main); }
      `}</style>
    </div>
  );
};

export default ChatRoom;