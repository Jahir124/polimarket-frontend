import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../utils/Functions";

export default function ConfigPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Correos autorizados para delivery (MISMOS QUE EN EL BACKEND)
  const DELIVERY_EMAILS = ["tu_correo@espol.edu.ec", "correo_socio@espol.edu.ec"];

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
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        });
        if (res.ok) {
            alert("Perfil actualizado correctamente");
            window.location.reload(); // Recargar para ver la foto nueva
        }
    } catch (error) {
        console.error(error);
        alert("Error al actualizar");
    } finally {
        setLoading(false);
    }
  };

  if (!user) return <div>Cargando...</div>;

  return (
    <div>
      <header className="header">
        <button className="logo" style={{background:'none', border:'none', fontSize:'1.2rem', cursor:'pointer'}} onClick={() => navigate("/profile")}>← Volver</button>
        <h2>Configuración</h2>
        <div style={{width:'40px'}}></div>
      </header>

      <div className="container login-container">
        <div 
            className="user-icon" 
            style={{
                width:'100px', height:'100px', margin:'0 auto 20px', 
                backgroundImage: user.profile_image ? `url(${user.profile_image})` : "none",
                fontSize: '2rem', display:'flex', alignItems:'center', justifyContent:'center', color:'#ccc'
            }}
        >
            {!user.profile_image && "Foto"}
        </div>

        <form onSubmit={handleUpdate}>
            <label style={{display:'block', textAlign:'left', marginBottom:'5px'}}>Nombre Público:</label>
            <input 
                className="login-input" 
                value={name} 
                onChange={e => setName(e.target.value)} 
            />

            <label style={{display:'block', textAlign:'left', marginBottom:'5px'}}>Cambiar Foto:</label>
            <input 
                type="file" 
                className="login-input"
                onChange={e => setFile(e.target.files[0])}
            />

            <button className="login-btn" type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
        </form>

        <div style={{marginTop:'30px', borderTop:'1px solid #eee', paddingTop:'20px'}}>
            <p style={{fontSize:'0.9rem', color:'#666'}}>Correo: {user.email}</p>
            <button 
                onClick={() => { localStorage.clear(); navigate("/"); }} 
                style={{background:'none', border:'1px solid red', color:'red', padding:'10px 20px', borderRadius:'8px', cursor:'pointer'}}
            >
                Cerrar Sesión
            </button>
        </div>

        {/* ZONA DELIVERY: Solo visible para ustedes */}
        {DELIVERY_EMAILS.includes(user.email) && (
            <div style={{marginTop:'30px', background:'#e3f2fd', padding:'15px', borderRadius:'12px'}}>
                <h3>🚀 Modo Delivery</h3>
                <p>Panel exclusivo para repartidores Beta.</p>
                <button 
                    className="login-btn" 
                    style={{background:'var(--accent)', color:'black'}}
                    onClick={() => navigate("/delivery-dashboard")}
                >
                    Ir al Panel de Entregas
                </button>
            </div>
        )}

      </div>
    </div>
  );
}