import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../utils/Functions";

export default function DeliveryPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadOrders();
    // Auto-refresh cada 10 segundos para ver nuevos pedidos en vivo
    const interval = setInterval(loadOrders, 10000); 
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
        const res = await fetch(`${API}/delivery/orders`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            setOrders(await res.json());
        } else {
            // Si falla (ej: no es admin), volver
            navigate("/home");
        }
    } catch (e) { console.error(e); }
  };

  const updateStatus = async (id, status) => {
    if(!confirm(`¿Marcar como ${status}?`)) return;
    
    await fetch(`${API}/delivery/orders/${id}?status=${status}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
    });
    loadOrders();
  };

  return (
    <div>
      <header className="header" style={{background:'#2d3436', color:'white'}}>
        <button className="logo" style={{color:'white', background:'none', border:'none'}} onClick={() => navigate("/config")}>← Salir</button>
        <div>🛵 Delivery Beta</div>
      </header>

      <div className="container">
        <h2>Pedidos Activos ({orders.length})</h2>
        
        <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
            {orders.length === 0 && <p>No hay pedidos pendientes. ¡A descansar!</p>}
            
            {orders.map(order => (
                <div key={order.id} className="product-card" style={{padding:'15px', borderLeft: order.status === 'pending' ? '5px solid orange' : '5px solid green'}}>
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                        <h3 style={{margin:0}}>📍 {order.faculty} - {order.building}</h3>
                        <span style={{fontWeight:'bold', background:'#eee', padding:'2px 8px', borderRadius:'4px'}}>{order.payment_method}</span>
                    </div>
                    
                    <p style={{margin:'10px 0'}}>
                        <strong>Producto ID:</strong> {order.product_id} <br/>
                        <strong>Estado:</strong> {order.status === 'pending' ? '⏳ Pendiente' : '🚀 En camino'}
                    </p>

                    <div style={{display:'flex', gap:'10px'}}>
                        {order.status === 'pending' && (
                            <button 
                                className="login-btn" 
                                style={{background:'#0984e3'}}
                                onClick={() => updateStatus(order.id, "accepted")}
                            >
                                Aceptar Pedido (Voy yo)
                            </button>
                        )}
                        
                        {order.status === 'accepted' && (
                            <button 
                                className="login-btn" 
                                style={{background:'#00b894'}}
                                onClick={() => updateStatus(order.id, "completed")}
                            >
                                ✅ Confirmar Entrega
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}