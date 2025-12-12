import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../utils/Functions";

export default function ProductPage() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resProd = await fetch(`${API}/products/${id}`);
        if (!resProd.ok) throw new Error("Producto no encontrado");
        const prodData = await resProd.json();
        setProduct(prodData);

        if (prodData.seller_id) {
            const resUser = await fetch(`${API}/users/${prodData.seller_id}`);
            if (resUser.ok) {
                const userData = await resUser.json();
                setSeller(userData);
            }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleContact = async () => {
    if (!token) {
        alert("Debes iniciar sesión para contactar al vendedor.");
        navigate("/");
        return;
    }

    try {
        const res = await fetch(`${API}/chats/start?product_id=${id}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const data = await res.json();
            navigate(`/chat-room?id=${data.chat_id}`); 
        } else {
            alert("Error al iniciar chat");
        }
    } catch (error) {
        console.error("Error contactando", error);
    }
  };

  if (loading) return <div className="container" style={{textAlign:'center', marginTop:'50px'}}>Cargando...</div>;
  if (!product) return <div className="container">Producto no encontrado.</div>;

  return (
    <div>
      <header className="header">
        <button className="logo" style={{background:'none', border:'none', fontSize:'1.2rem', cursor:'pointer', color:'var(--text-main)'}} onClick={() => navigate("/home")}>← Volver</button>
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
            <div className="detail-price">${Number(product?.price??0).toFixed(2)}</div>
            <p style={{marginBottom:'2rem', color:'var(--text-muted)'}}>{product.description}</p>

            {seller && (
                <div className="seller-card">
                    <div className="user-icon" style={{width:'50px', height:'50px', backgroundImage: seller.profile_image ? `url(${seller.profile_image})` : 'none'}}></div>
                    <div>
                        <div style={{fontWeight:'bold'}}>{seller.name}</div>
                        <small>Vendedor @espol.edu.ec</small>
                    </div>
                </div>
            )}

            {/* ÚNICO BOTÓN DE ACCIÓN: IR AL CHAT */}
            <button className="contact-btn" onClick={handleContact}>
                💬 Contactar con Vendedor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}