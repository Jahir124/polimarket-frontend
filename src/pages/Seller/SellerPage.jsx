import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../utils/Functions";

export default function ProfilePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Estados
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("my_products"); 
  const [myProducts, setMyProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);

  // Estados del Formulario
  const [isEditing, setIsEditing] = useState(null);
  const [formData, setFormData] = useState({ title: "", description: "", price: "", category: "food", file: null });

  // 1. CARGA SEGURA DE USUARIO
  useEffect(() => {
    const fetchMe = async () => {
        if (!token) {
            navigate("/"); // Si no hay token, fuera.
            return;
        }

        try {
            const res = await fetch(`${API}/auth/me`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });

            if (!res.ok) {
                throw new Error("Sesión caducada");
            }

            const data = await res.json();
            setUser(data);
        } catch (error) {
            console.error("Error de sesión:", error);
            localStorage.removeItem("token");
            localStorage.removeItem("me");
            navigate("/"); 
        }
    };
    
    fetchMe();
  }, [token, navigate]);

  // 2. CARGAR DATOS SEGÚN LA PESTAÑA
  useEffect(() => {
    if (user) { 
        if (activeTab === "my_products") loadMyProducts();
        if (activeTab === "favorites") loadFavorites();
    }
  }, [activeTab, user]); 

  const loadMyProducts = async () => {
    if (!user || !user.id) return; 
    try {
        const res = await fetch(`${API}/users/${user.id}/products`);
        if (res.ok) {
            const data = await res.json();
            setMyProducts(data);
        }
    } catch (e) { console.error("Error cargando mis productos", e); }
  };

  const loadFavorites = async () => {
    try {
        const res = await fetch(`${API}/users/me/favorites`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
            const data = await res.json();
            setFavorites(data);
        }
    } catch (e) { console.error("Error cargando favoritos", e); }
  };

  // 3. MANEJO DEL FORMULARIO
  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isEditing ? `${API}/products/${isEditing}` : `${API}/products`;
    const method = isEditing ? "PUT" : "POST";

    const formBody = new FormData();
    formBody.append("title", formData.title);
    formBody.append("description", formData.description);
    formBody.append("price", formData.price);
    formBody.append("category", formData.category);
    
    if (formData.file) {
        formBody.append("file", formData.file);
    }

    try {
        const res = await fetch(url, {
            method: method,
            headers: { Authorization: `Bearer ${token}` },
            body: formBody,
        });

        if (res.ok) {
            alert(isEditing ? "Producto actualizado" : "¡Producto publicado con éxito!");
            setIsEditing(null);
            setFormData({ title: "", description: "", price: "", category: "food", file: null });
            await loadMyProducts(); 
            setActiveTab("my_products"); 
        } else {
            const errData = await res.json();
            alert("Error: " + (errData.detail || "No se pudo guardar"));
        }
    } catch (error) {
        console.error(error);
        alert("Error de conexión al guardar.");
    }
  };

  const handleEditClick = (p) => {
    setIsEditing(p.id);
    setFormData({ title: p.title, description: p.description, price: p.price, category: p.category, file: null });
    setActiveTab("add");
  };

  // --- RENDERIZADO ---
  if (!user) return <div className="container" style={{textAlign:'center', marginTop:'50px'}}>Cargando perfil...</div>;

  return (
    <div>
      <header className="header">
        <button 
            className="logo" 
            style={{background:'none', border:'none', fontSize:'1.2rem', cursor:'pointer'}} 
            onClick={() => navigate("/home")}
        >
          ← Volver
        </button>
        
        <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
           {/* --- AQUÍ ESTÁ EL NUEVO BOTÓN DE CONFIGURACIÓN --- */}
           <button 
             onClick={() => navigate("/config")} 
             title="Configuración de usuario"
             style={{background:'none', border:'none', fontSize:'1.5rem', cursor:'pointer'}}
           >
             ⚙️
           </button>
           {/* ------------------------------------------------ */}

           <span style={{fontWeight:'bold', color:'var(--primary)', fontSize:'1.1rem'}}>{user.name}</span>
           <div className="user-icon" style={user.profile_image ? {backgroundImage: `url(${user.profile_image})`} : {}}></div>
        </div>
      </header>

      <div className="container">
        
        {/* PESTAÑAS */}
        <div style={{textAlign:'center', marginBottom:'2rem'}}>
            <div className="tabs">
                <button className={activeTab === "my_products" ? "active" : ""} onClick={() => setActiveTab("my_products")}>📦 Mis Ventas</button>
                <button className={activeTab === "favorites" ? "active" : ""} onClick={() => setActiveTab("favorites")}>❤️ Favoritos</button>
                <button className={activeTab === "add" ? "active" : ""} onClick={() => { setIsEditing(null); setFormData({ title: "", description: "", price: "", category: "food", file: null }); setActiveTab("add"); }}>
                    {isEditing ? "✏️ Editando..." : "➕ Vender"}
                </button>
            </div>
        </div>

        {/* PESTAÑA: MIS PRODUCTOS */}
        {activeTab === "my_products" && (
          <div className="product-grid">
            {myProducts.length === 0 && <p style={{gridColumn:'1/-1', textAlign:'center', color:'#888'}}>No has publicado nada aún. ¡Anímate!</p>}
            {myProducts.map(p => (
              <div key={p.id} className="product-card">
                <img src={p.image_url || 'https://via.placeholder.com/150'} alt={p.title} />
                <div className="product-info">
                  <div>
                    <h3>{p.title}</h3>
                    <span className="product-price">${p.price.toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={() => handleEditClick(p)} 
                    style={{border:'none', background:'#eff0f1', padding:'8px 12px', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', color:'var(--text-dark)'}}
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PESTAÑA: FAVORITOS */}
        {activeTab === "favorites" && (
          <div className="product-grid">
            {favorites.length === 0 && <p style={{gridColumn:'1/-1', textAlign:'center', color:'#888'}}>Aún no tienes favoritos.</p>}
            {favorites.map(p => (
              <div key={p.id} className="product-card" onClick={() => navigate(`/product/${p.id}`)}>
                <img src={p.image_url || 'https://via.placeholder.com/150'} alt={p.title} />
                <div className="product-info">
                   <div>
                       <h3>{p.title}</h3>
                       <div className="product-price">${p.price.toFixed(2)}</div>
                   </div>
                   <span style={{color:'#ff4757', fontSize:'1.5rem'}}>♥</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PESTAÑA: FORMULARIO */}
        {activeTab === "add" && (
          <div className="login-container">
            <h2 style={{marginTop:0, color:'var(--primary)'}}>{isEditing ? "Editar Producto" : "Publicar Nuevo Producto"}</h2>
            <form onSubmit={handleSubmit}>
              <input 
                className="login-input" 
                placeholder="Título (Ej. Calculadora Científica)" 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                required 
              />
              <textarea 
                className="login-input" 
                placeholder="Descripción (Estado, detalles, lugar de entrega...)" 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                rows="4"
                style={{fontFamily:'inherit'}}
                required 
              />
              <div style={{display:'flex', gap:'10px'}}>
                  <input 
                    className="login-input" 
                    type="number" 
                    placeholder="Precio ($)" 
                    value={formData.price} 
                    onChange={e => setFormData({...formData, price: e.target.value})} 
                    required 
                  />
                  <select 
                    className="login-input" 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="food">🍔 Comida</option>
                    <option value="electronics">💻 Electrónica</option>
                    <option value="study">📚 Estudio</option>
                    <option value="other">🌈 Otro</option>
                  </select>
              </div>

              <div style={{textAlign:'left', marginBottom:'15px'}}>
                  <label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>Foto del Producto:</label>
                  <input 
                    type="file" 
                    className="login-input" 
                    style={{padding:'5px'}}
                    onChange={e => setFormData({...formData, file: e.target.files[0]})} 
                    required={!isEditing} 
                  />
              </div>

              <button className="login-btn" type="submit">
                {isEditing ? "Guardar Cambios" : "¡Publicar Ahora!"}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}