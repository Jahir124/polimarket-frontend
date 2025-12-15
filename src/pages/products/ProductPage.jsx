import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../utils/api";

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
        alert("Error cargando producto");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // ✅ CORREGIDO: AHORA ENVIA JSON BODY
  const handleContact = async () => {
    if (!token) {
      alert("Debes iniciar sesión para contactar al vendedor.");
      navigate("/");
      return;
    }

    try {
      const res = await fetch(`${API}/chats/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: parseInt(id) }),
      });

      if (res.ok) {
        const data = await res.json();
        navigate(`/chat-room?id=${data.chat_id}`);
      } else {
        const error = await res.json();
        alert(error.detail || "Error al iniciar chat");
      }
    } catch (error) {
      console.error("Error contactando", error);
      alert("Error de conexión");
    }
  };

  if (loading) return <div className="container">Cargando...</div>;

  if (!product) return <div className="container">Producto no encontrado</div>;

  return (
    <div className="container">
      <div className="product-detail-container">
        <div className="detail-image-box">
          <img src={product.image_url} alt={product.title} style={{ width: "100%" }} />
        </div>
        <div className="detail-info">
          <h1>{product.title}</h1>
          <p className="detail-price">${product.price.toFixed(2)}</p>
          <span className="category-tag">{product.category}</span>
          <p>{product.description}</p>

          {seller && (
            <div className="seller-card">
              <img
                src={seller.profile_image || "https://via.placeholder.com/50"}
                alt={seller.name}
                style={{ width: 50, height: 50, borderRadius: "50%" }}
              />
              <div>
                <strong>{seller.name}</strong>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  {seller.email}
                </p>
              </div>
            </div>
          )}

          <button className="contact-btn" onClick={handleContact}>
            Contactar vendedor
          </button>
        </div>
      </div>
    </div>
  );
}
