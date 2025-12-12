import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../utils/Functions";

export default function ProfilePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("products");

  const [myProducts, setMyProducts] = useState([]);
  const [mySales, setMySales] = useState([]);
  const [myPurchases, setMyPurchases] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const [earnings, setEarnings] = useState(0);

  const [isEditingId, setIsEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "food",
    file: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    fetchMe();
  }, [token]);

  useEffect(() => {
    if (!user) return;
    if (activeTab === "products") loadMyProducts();
    if (activeTab === "sales") loadMySales();
    if (activeTab === "purchases") loadMyPurchases();
    if (activeTab === "favorites") loadFavorites();
  }, [activeTab, user]);

  const fetchMe = async () => {
    try {
      const res = await fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Sesión caducada");
      setUser(await res.json());
    } catch (e) {
      navigate("/");
    }
  };

  const loadMyProducts = async () => {
    const res = await fetch(`${API}/users/${user.id}/products`);
    if (res.ok) setMyProducts(await res.json());
  };

  const loadMySales = async () => {
    const res = await fetch(`${API}/users/me/sales`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setMySales(data);
      const total = data.reduce(
        (sum, order) => sum + Number(order.product?.price || 0),
        0
      );
      setEarnings(total);
    }
  };

  const loadMyPurchases = async () => {
    const res = await fetch(`${API}/users/me/purchases`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setMyPurchases(await res.json());
  };

  const loadFavorites = async () => {
    const res = await fetch(`${API}/users/me/favorites`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setFavorites(await res.json());
  };

  const handleEditClick = (p) => {
    setIsEditingId(p.id);
    setFormData({
      title: p.title,
      description: p.description,
      price: p.price,
      category: p.category,
      file: null,
    });
    setActiveTab("edit_form");
  };

  const handleCreateClick = () => {
    setIsEditingId(null);
    setFormData({
      title: "",
      description: "",
      price: "",
      category: "food",
      file: null,
    });
    setActiveTab("edit_form");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const url = isEditingId ? `${API}/products/${isEditingId}` : `${API}/products`;
    const method = isEditingId ? "PUT" : "POST";

    const formBody = new FormData();
    formBody.append("title", formData.title);
    formBody.append("description", formData.description);
    formBody.append("price", formData.price);
    formBody.append("category", formData.category);
    if (formData.file) formBody.append("file", formData.file);

    try {
      const res = await fetch(url, {
        method: method,
        headers: { Authorization: `Bearer ${token}` },
        body: formBody,
      });

      if (res.ok) {
        alert(isEditingId ? "Producto actualizado" : "Producto publicado");
        await loadMyProducts();
        setActiveTab("products");
      } else {
        alert("Error al guardar");
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (!user)
    return (
      <div
        className="container"
        style={{ textAlign: "center", marginTop: "50px" }}
      >
        Cargando perfil...
      </div>
    );

  return (
    <div>
      <header className="header">
        <button
          className="logo"
          style={{
            background: "none",
            border: "none",
            fontSize: "1.2rem",
            cursor: "pointer",
            color: "var(--text-main)",
          }}
          onClick={() => navigate("/home")}
        >
          ← Volver
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <button
            onClick={() => navigate("/config")}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
            }}
          >
            ⚙️
          </button>
          <span
            style={{
              fontWeight: "bold",
              color: "var(--primary)",
              fontSize: "1.1rem",
            }}
          >
            {user.name}
          </span>
          <div
            className="user-icon"
            style={
              user.profile_image
                ? { backgroundImage: `url(${user.profile_image})` }
                : {}
            }
          ></div>
        </div>
      </header>

      <div className="container">
        {/* Tabs */}
        <div
          style={{
            overflowX: "auto",
            whiteSpace: "nowrap",
            marginBottom: "2rem",
            paddingBottom: "10px",
          }}
        >
          <div className="tabs" style={{ display: "inline-flex" }}>
            <button
              className={activeTab === "products" ? "active" : ""}
              onClick={() => setActiveTab("products")}
            >
              📦 Mis Productos
            </button>
            <button
              className={activeTab === "sales" ? "active" : ""}
              onClick={() => setActiveTab("sales")}
            >
              💰 Mis Ventas
            </button>
            <button
              className={activeTab === "purchases" ? "active" : ""}
              onClick={() => setActiveTab("purchases")}
            >
              🛍️ Mis Compras
            </button>
            <button
              className={activeTab === "favorites" ? "active" : ""}
              onClick={() => setActiveTab("favorites")}
            >
              ❤️ Favoritos
            </button>
          </div>
        </div>

        {/* 1. Mis productos */}
        {activeTab === "products" && (
          <>
            <button
              className="login-btn"
              style={{ marginBottom: "20px" }}
              onClick={handleCreateClick}
            >
              + Publicar Nuevo Producto
            </button>
            <div className="product-grid">
              {myProducts.length === 0 && (
                <p style={{ color: "var(--text-muted)" }}>
                  No tienes productos en venta.
                </p>
              )}
              {myProducts.map((p) => (
                <div key={p.id} className="product-card">
                  <img src={p.image_url} alt={p.title} />
                  <div className="product-info">
                    <div>
                      <h3>{p.title}</h3>
                      <span className="product-price">
                        ${Number(p.price || 0).toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleEditClick(p)}
                      style={{
                        border: "none",
                        background: "var(--bg-body)",
                        padding: "8px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "1.2rem",
                      }}
                      title="Editar este producto"
                    >
                      ✏️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 2. Ventas */}
        {activeTab === "sales" && (
          <div>
            <div
              style={{
                background:
                  "linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)",
                padding: "25px",
                borderRadius: "16px",
                color: "#0f172a",
                marginBottom: "30px",
                boxShadow: "var(--shadow)",
              }}
            >
              <div
                style={{
                  fontSize: "1rem",
                  opacity: 0.8,
                  marginBottom: "5px",
                  color: "white",
                }}
              >
                Ganancias Totales
              </div>
              <div
                style={{
                  fontSize: "3rem",
                  fontWeight: "800",
                  color: "white",
                }}
              >
                ${Number(earnings || 0).toFixed(2)}
              </div>
              <div
                style={{
                  fontSize: "0.9rem",
                  color: "white",
                  opacity: 0.9,
                }}
              >
                Has vendido {mySales.length} productos exitosamente.
              </div>
            </div>

            <h3 style={{ color: "var(--text-main)" }}>Historial de Ventas</h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "15px",
              }}
            >
              {mySales.length === 0 && (
                <p style={{ color: "var(--text-muted)" }}>
                  Aún no has realizado ventas.
                </p>
              )}
              {mySales.map((order) => (
                <div
                  key={order.id}
                  style={{
                    background: "var(--bg-card)",
                    padding: "15px",
                    borderRadius: "12px",
                    border: "1px solid var(--border-color)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                    }}
                  >
                    <img
                      src={order.product?.image_url}
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "8px",
                        objectFit: "cover",
                      }}
                    />
                    <div>
                      <div
                        style={{
                          fontWeight: "bold",
                          color: "var(--text-main)",
                        }}
                      >
                        {order.product?.title || "Producto eliminado"}
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        color: "var(--accent)",
                        fontWeight: "bold",
                      }}
                    >
                      +
                      {`$${Number(order.product?.price || 0).toFixed(2)}`}
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "green",
                      }}
                    >
                      Completado
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Compras */}
        {activeTab === "purchases" && (
          <div>
            <h3 style={{ color: "var(--text-main)" }}>Historial de Compras</h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "15px",
              }}
            >
              {myPurchases.length === 0 && (
                <p style={{ color: "var(--text-muted)" }}>
                  No has comprado nada aún.
                </p>
              )}
              {myPurchases.map((order) => (
                <div
                  key={order.id}
                  style={{
                    background: "var(--bg-card)",
                    padding: "15px",
                    borderRadius: "12px",
                    border: "1px solid var(--border-color)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                    }}
                  >
                    <img
                      src={order.product?.image_url}
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "8px",
                        objectFit: "cover",
                      }}
                    />
                    <div>
                      <div
                        style={{
                          fontWeight: "bold",
                          color: "var(--text-main)",
                        }}
                      >
                        {order.product?.title}
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        Vendedor ID: {order.seller_id}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        color: "var(--text-main)",
                        fontWeight: "bold",
                      }}
                    >
                      -
                      {`$${Number(
                        order.total_amount != null
                          ? order.total_amount
                          : order.product?.price || 0
                      ).toFixed(2)}`}
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--primary)",
                      }}
                    >
                      Recibido
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Favoritos */}
        {activeTab === "favorites" && (
          <div className="product-grid">
            {favorites.length === 0 && (
              <p style={{ color: "var(--text-muted)" }}>
                No tienes favoritos.
              </p>
            )}
            {favorites.map((p) => (
              <div
                key={p.id}
                className="product-card"
                onClick={() => navigate(`/product/${p.id}`)}
              >
                <img src={p.image_url} alt={p.title} />
                <div className="product-info">
                  <div>
                    <h3>{p.title}</h3>
                    <div className="product-price">
                      ${Number(p.price || 0).toFixed(2)}
                    </div>
                  </div>
                  <span style={{ color: "#ff4757", fontSize: "1.5rem" }}>
                    ♥
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 5. Formulario */}
        {activeTab === "edit_form" && (
          <div className="login-container">
            <h2
              style={{
                marginTop: 0,
                color: "var(--primary)",
              }}
            >
              {isEditingId ? "Editar Producto" : "Nuevo Producto"}
            </h2>
            <form onSubmit={handleSubmit}>
              <label
                style={{
                  display: "block",
                  textAlign: "left",
                  fontWeight: "bold",
                }}
              >
                Nombre del producto
              </label>
              <input
                className="login-input"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />

              <label
                style={{
                  display: "block",
                  textAlign: "left",
                  fontWeight: "bold",
                }}
              >
                Descripción
              </label>
              <textarea
                className="login-input"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows="4"
                required
              />

              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      textAlign: "left",
                      fontWeight: "bold",
                    }}
                  >
                    Precio ($)
                  </label>
                  <input
                    className="login-input"
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      textAlign: "left",
                      fontWeight: "bold",
                    }}
                  >
                    Categoría
                  </label>
                  <select
                    className="login-input"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    <option value="food">🍔 Comida</option>
                    <option value="electronics">💻 Electrónica</option>
                    <option value="study">📚 Estudio</option>
                    <option value="other">🌈 Otro</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  textAlign: "left",
                  marginBottom: "15px",
                }}
              >
                <label
                  style={{
                    fontWeight: "bold",
                    display: "block",
                    marginBottom: "5px",
                  }}
                >
                  Foto (Opcional si editas):
                </label>
                <input
                  type="file"
                  className="login-input"
                  onChange={(e) =>
                    setFormData({ ...formData, file: e.target.files[0] })
                  }
                  required={!isEditingId}
                />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setActiveTab("products")}
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-main)",
                    padding: "10px",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  className="login-btn"
                  type="submit"
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  {loading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
