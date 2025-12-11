import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../utils/Functions";

export default function ProductPage() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  
  // Estado para el Modal de Delivery
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryForm, setDeliveryForm] = useState({
    faculty: "FCSH",
    building: "",
    payment_method: "Efectivo"
  });

  useEffect(() => {
    // ... (Tu lógica de carga existente se mantiene igual) ...
    const fetchData = async () => {
        try {
            const resProd = await fetch(`${API}/products/${id}`);
            if (!resProd.ok) throw new Error("Producto no encontrado");
            const prodData = await resProd.json();
            setProduct(prodData);

            if (prodData.seller_id) {
                const resUser = await fetch(`${API}/users/${prodData.seller_id}`);
                if (resUser.ok) setSeller(await resUser.json());
            }
        } catch (e) { console.error(e); }
    };
    fetchData();
  }, [id]);

  // Manejar el envío del Delivery
  const handleDeliverySubmit = async (e) => {
    e.preventDefault();
    if (!token) return alert("Inicia sesión primero");

    try {
        const res = await fetch(`${API}/orders/create`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
                product_id: product.id,
                faculty: deliveryForm.faculty,
                building: deliveryForm.building,
                payment_method: deliveryForm.payment_method
            })
        });

        if (res.ok) {
            const data = await res.json();
            alert("¡Pedido enviado! Redirigiendo al chat...");
            navigate(`/chat-room?id=${data.chat_id}`);
        } else {
            alert("Error al procesar el pedido");
        }
    } catch (error) {
        console.error(error);
    }
  };

  const handleContact = async () => {
     // ... (Tu lógica anterior de chat simple) ...
     if (!token) return navigate("/");
     const res = await fetch(`${API}/chats/start?product_id=${id}`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
     });
     if(res.ok) {
         const data = await res.json();
         navigate(`/chat-room?id=${data.chat_id}`);
     }
  };

  if (!product) return <div>Cargando...</div>;

  return (
    <div>
      <header className="header">
        <button className="logo" style={{background:'none', border:'none', fontSize:'1.2rem', cursor:'pointer'}} onClick={() => navigate("/home")}>← Volver</button>
        <div className="user-icon" onClick={() => navigate('/profile')}></div>
      </header>

      <div className="container">
        <div className="product-detail-container">
          <div className="detail-image-box">
            <img src={product.image_url} alt={product.title} />
          </div>

          <div className="detail-info">
            <span className="category-tag">{product.category}</span>
            <h1>{product.title}</h1>
            <div className="detail-price">${product.price.toFixed(2)}</div>
            <p>{product.description}</p>

            {seller && (
                <div className="seller-card">
                    <div className="seller-avatar" style={seller.profile_image ? {backgroundImage: `url(${seller.profile_image})`} : {}}></div>
                    <div>
                        <div style={{fontWeight:'bold'}}>{seller.name}</div>
                        <small>Vendedor @espol.edu.ec</small>
                    </div>
                </div>
            )}

            <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
                {/* Botón Chat Normal */}
                <button className="contact-btn" style={{background:'#eee', color:'#333'}} onClick={handleContact}>
                    💬 Preguntar
                </button>
                
                {/* Botón Delivery Destacado */}
                <button className="contact-btn" onClick={() => setShowDeliveryModal(true)}>
                    🛵 Pedir Delivery
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL DE DELIVERY --- */}
      {showDeliveryModal && (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>🛵 Datos de Entrega</h3>
                <form onSubmit={handleDeliverySubmit}>
                    <label>Facultad / Zona:</label>
                    <select 
                        className="login-input" 
                        value={deliveryForm.faculty}
                        onChange={e => setDeliveryForm({...deliveryForm, faculty: e.target.value})}
                    >
                        <option value="FCSH">FCSH (Humanísticas)</option>
                        <option value="FIMCP">FIMCP (Mecánica)</option>
                        <option value="FIEC">FIEC (Eléctrica/Computación)</option>
                        <option value="FCNM">FCNM (Matemáticas)</option>
                        <option value="FADCOM">FADCOM</option>
                        <option value="CELEX">Celex</option>
                    </select>

                    <label>Edificio / Aula / Referencia:</label>
                    <input 
                        className="login-input" 
                        placeholder="Ej. Edificio Nuevo, Aula 105" 
                        required
                        value={deliveryForm.building}
                        onChange={e => setDeliveryForm({...deliveryForm, building: e.target.value})}
                    />

                    <label>Método de Pago:</label>
                    <div style={{display:'flex', gap:'20px', margin:'10px 0 20px 0'}}>
                        <label>
                            <input 
                                type="radio" 
                                name="payment" 
                                value="Efectivo" 
                                checked={deliveryForm.payment_method === "Efectivo"}
                                onChange={e => setDeliveryForm({...deliveryForm, payment_method: e.target.value})}
                            /> Contra Entrega (Efectivo)
                        </label>
                        <label>
                            <input 
                                type="radio" 
                                name="payment" 
                                value="Transferencia"
                                checked={deliveryForm.payment_method === "Transferencia"}
                                onChange={e => setDeliveryForm({...deliveryForm, payment_method: e.target.value})}
                            /> Transferencia
                        </label>
                    </div>

                    <div style={{display:'flex', gap:'10px'}}>
                        <button type="button" onClick={() => setShowDeliveryModal(false)} style={{background:'#ccc', border:'none', padding:'10px', borderRadius:'8px', cursor:'pointer', flex:1}}>Cancelar</button>
                        <button type="submit" className="login-btn" style={{flex:1}}>Confirmar Pedido</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Estilos del Modal (Agrégalos aquí o en tu CSS) */}
      <style>{`
        .modal-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex; justify-content: center; align-items: center;
            z-index: 1000;
        }
        .modal-content {
            background: white; padding: 2rem;
            border-radius: 16px; width: 90%; max-width: 400px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            animation: popIn 0.3s ease;
        }
        @keyframes popIn { from {transform: scale(0.8); opacity:0;} to {transform: scale(1); opacity:1;} }
      `}</style>
    </div>
  );
}