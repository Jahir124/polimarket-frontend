import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../utils/api";

export default function ConfigPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- LÓGICA DE DELIVERY ---
  // 1. Definimos la variable fija del código secreto
  const SECRET_CODE = "POLI2025"; 

  // 2. Estado para saber si ya desbloqueó la función
  const [isDelivery, setIsDelivery] = useState(() => {
    return localStorage.getItem("is_delivery_unlocked") === "true";
  });

  // 3. Estados para el formulario de desbloqueo
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [inputCode, setInputCode] = useState("");

  useEffect(() => {
    fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
          setUser(data);
          setName(data.name);
      })
      .catch(() => navigate("/"));
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    if (file) formData.append("file", file);

    try {
        const res = await fetch(`${API}/users/me`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
        });

        if (!res.ok) {
        throw new Error("Error en la respuesta del servidor");
        }

        const updatedUser = await res.json();
        setUser(updatedUser);
        setFile(null);

        alert("Perfil actualizado correctamente ✅");
    } catch (error) {
        console.error("ERROR REAL:", error);
        alert("Error al actualizar ❌");
    } finally {
        setLoading(false);
    }
    };


  const verifyDeliveryCode = () => {
    if (inputCode === SECRET_CODE) {
        alert("¡Código correcto! Ahora eres parte del equipo de Delivery.");
        localStorage.setItem("is_delivery_unlocked", "true");
        setIsDelivery(true);
        setShowCodeInput(false);
    } else {
        alert("Código incorrecto. Intenta de nuevo.");
    }
  };

  if (!user) return <div className="container" style={{textAlign:'center', marginTop:'50px'}}>Cargando...</div>;

  return (
    <div>
      <header className="header">
        <button 
            className="logo back" 
             
            onClick={() => navigate("/profile")}
        >
            ← Volver
        </button>
        <h2 style={{margin:0, fontSize:'1.2rem', color:'var(--primary)'}}>Configuración</h2>
        <div style={{width:'40px'}}></div>
      </header>

      <div className="container login-container">
        
        {/* FOTO Y DATOS BÁSICOS */}
        <div 
            className="user-icon" 
            style={{
                width:'100px', height:'100px', margin:'0 auto 20px', 
                backgroundImage: user.profile_image ? `url(${user.profile_image})` : "none",
                fontSize: '2rem', display:'flex', alignItems:'center', justifyContent:'center', color:'#ccc',
                border: '2px solid var(--border-color)'
            }}
        >
            {!user.profile_image && "Foto"}
        </div>

        <form onSubmit={handleUpdate}>
            <label style={{display:'block', textAlign:'left', marginBottom:'5px', fontWeight:'bold'}}>Nombre Público:</label>
            <input 
                className="login-input" 
                value={name} 
                onChange={e => setName(e.target.value)} 
            />

            <label style={{display:'block', textAlign:'left', marginBottom:'5px', fontWeight:'bold'}}>Cambiar Foto:</label>
            <input 
                type="file"
                accept="image/*"
                className="login-input"
                onChange={e => setFile(e.target.files[0])}
            />

            <button className="login-btn" type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
        </form>

        <div style={{marginTop:'30px', borderTop:'1px solid var(--border-color)', paddingTop:'20px'}}>
            <p style={{fontSize:'0.9rem', color:'var(--text-muted)'}}>Correo: {user.email}</p>
            <button 
                onClick={() => { localStorage.clear(); navigate("/"); }} 
                style={{background:'none', border:'1px solid #ff4757', color:'#ff4757', padding:'10px 20px', borderRadius:'8px', cursor:'pointer'}}
            >
                Cerrar Sesión
            </button>
        </div>

        {/* --- ZONA DELIVERY --- */}
        <div style={{marginTop:'40px', background:'var(--bg-body)', padding:'20px', borderRadius:'12px', border:'1px solid var(--border-color)'}}>
            <h3 style={{marginTop:0}}>🛵 Zona de Repartidores</h3>
            
            {/* OPCIÓN 1: YA ES DELIVERY (Desbloqueado) */}
            {isDelivery ? (
                <div>
                    <p style={{color:'green', fontWeight:'bold'}}>✅ Estado: Activo</p>
                    <button 
                        className="login-btn" 
                        style={{background:'var(--accent)', color:'black'}}
                        onClick={() => navigate("/delivery-dashboard")}
                    >
                        Ir al Panel de Entregas
                    </button>
                </div>
            ) : (
                /* OPCIÓN 2: NO ES DELIVERY (Bloqueado) */
                <div>
                    {!showCodeInput ? (
                        <button 
                            className="login-btn" 
                            style={{background:'var(--text-main)', color:'var(--bg-card)'}}
                            onClick={() => setShowCodeInput(true)}
                        >
                            Unirse como Delivery
                        </button>
                    ) : (
                        <div style={{animation:'fadeIn 0.3s'}}>
                            <p style={{fontSize:'0.9rem'}}>Ingresa el código secreto de administrador:</p>
                            <input
                                className="login-input"
                                type="password"
                                placeholder="Código secreto"
                                value={inputCode}
                                onChange={(e) => setInputCode(e.target.value)}
                            />
                            <div style={{display:'flex', gap:'10px'}}>
                                <button 
                                    type="button"
                                    onClick={() => setShowCodeInput(false)}
                                    style={{flex:1, padding:'10px', background:'transparent', border:'1px solid var(--border-color)', borderRadius:'8px', color:'var(--text-main)', cursor:'pointer'}}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={verifyDeliveryCode}
                                    style={{flex:1, padding:'10px', background:'var(--primary)', border:'none', borderRadius:'8px', color:'white', fontWeight:'bold', cursor:'pointer'}}
                                >
                                    Validar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>

      </div>
      
      {/* Animación simple */}
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}