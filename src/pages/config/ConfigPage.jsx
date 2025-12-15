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

  // ✅ DELIVERY - Estado basado en el backend
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [inputCode, setInputCode] = useState("");

  useEffect(() => {
    fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
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
        const error = await res.json();
        throw new Error(error.detail || "Error en la respuesta del servidor");
      }

      const updatedUser = await res.json();
      setUser(updatedUser);
      setFile(null);
      alert("Perfil actualizado correctamente ✅");
    } catch (error) {
      console.error("ERROR:", error);
      alert(error.message || "Error al actualizar ❌");
    } finally {
      setLoading(false);
    }
  };

  // ✅ VALIDACIÓN EN BACKEND
  const verifyDeliveryCode = async () => {
    try {
      const res = await fetch(`${API}/users/me/become-delivery`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ secret_code: inputCode }),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        alert("¡Código correcto! Ahora eres parte del equipo de Delivery.");
        setShowCodeInput(false);
        setInputCode("");
      } else {
        const error = await res.json();
        alert(error.detail || "Código incorrecto. Intenta de nuevo.");
      }
    } catch (error) {
      console.error(error);
      alert("Error verificando código");
    }
  };

  if (!user)
    return (
      <div className="container">
        <p>Cargando...</p>
      </div>
    );

  return (
    <div className="container">
      <h1>⚙️ Configuración</h1>

      <div className="login-container">
        <h2>Información de Usuario</h2>
        <p>
          <strong>Correo:</strong> {user.email}
        </p>
        <p>
          <strong>Estado:</strong> ✅ Activo
        </p>
      </div>

      <form onSubmit={handleUpdate} className="login-container">
        <h2>Editar Perfil</h2>
        <input
          className="login-input"
          type="text"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? "Guardando..." : "Guardar Cambios"}
        </button>
      </form>

      <div className="login-container">
        <h2>🛵 Modo Delivery</h2>
        {user.is_delivery ? (
          <div>
            <p style={{ color: "var(--primary)" }}>
              ✅ Ya eres parte del equipo de Delivery
            </p>
            <button className="login-btn" onClick={() => navigate("/delivery")}>
              Ir al Panel
            </button>
          </div>
        ) : (
          <div>
            <p>¿Quieres ser repartidor? Ingresa el código secreto.</p>
            {!showCodeInput ? (
              <button className="login-btn" onClick={() => setShowCodeInput(true)}>
                Desbloquear Modo Delivery
              </button>
            ) : (
              <div>
                <input
                  className="login-input"
                  type="text"
                  placeholder="Código secreto"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                />
                <button className="login-btn" onClick={verifyDeliveryCode}>
                  Verificar Código
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
