import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ProductPage() {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [userImage, setUserImage] = useState(null);

  const loadMe = async () => {
    try {
      const res = await fetch(`${API}/auth/me`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setUserImage(data.profile_image || null);
      }
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const loadProduct = async () => 
  {
    try {
      const res = await fetch(`${API}/products/${id}`);

      if (!res.ok) throw new Error("Error al cargar producto");

      const data = await res.json();
      setProduct(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const startChat = async () => {
    try {
      const res = await fetch(`${API}/chat/start/${id}`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Error creando chat");

      navigate(`/chat/${data.chat_id}`);

    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    loadMe();
    loadProduct();
  }, []);

  if (!product) {
    return <h1 style={{ textAlign: "center" }}>Cargando producto...</h1>;
  }

  return (
    <div>
      <header className="header">
        <button
          className="logo"
          style={{ fontSize: "1.2rem" }}
          onClick={() => navigate(-1)}
        >
          ← Volver
        </button>

        <div
          className="user-icon"
          id="user-icon"
          onClick={() => navigate("/seller")}
          style={{
            backgroundImage: userImage ? `url(${userImage})` : "none",
            backgroundSize: "cover",
          }}
        ></div>
      </header>

      <div className="container product-detail">
        <img
          id="product-image"
          src={product.image}
          alt="Imagen del producto"
        />

        <h1 id="title">{product.title}</h1>

        <div className="price" id="price">
          ${product.price}
        </div>

        <p className="description" id="desc">
          {product.description}
        </p>

        <button className="cta-button" onClick={startChat}>
          Contactar vendedor
        </button>
      </div>
    </div>
  );
}
