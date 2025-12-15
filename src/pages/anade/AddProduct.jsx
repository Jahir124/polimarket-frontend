import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../utils/api"; // ✅ CORREGIDO

export default function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("food");
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ VALIDACIONES
    if (!title || !desc || !price || !file) {
      alert("Todos los campos son obligatorios");
      return;
    }
    
    if (parseFloat(price) <= 0) {
      alert("El precio debe ser mayor a 0");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen no debe superar 5MB");
      return;
    }
    
    setLoading(true);
    
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", desc);
    formData.append("price", price);
    formData.append("category", category);
    formData.append("file", file);
    
    const token = localStorage.getItem("token");
    
    try {
      const res = await fetch(`${API}/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Error al subir producto");
      }
      
      alert("¡Producto publicado exitosamente!");
      navigate("/seller");
    } catch (error) {
      console.error(error);
      alert(error.message || "Falló la publicación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Publicar Producto</h1>
      <form onSubmit={handleSubmit} className="login-container">
        <input
          className="login-input"
          type="text"
          placeholder="Título del producto"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Descripción"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows="4"
          required
        />
        <input
          className="login-input"
          type="number"
          step="0.01"
          placeholder="Precio ($)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="food">Comida</option>
          <option value="electronics">Electrónicos</option>
          <option value="study">Estudio</option>
          <option value="other">Otro</option>
        </select>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />
        <button 
          type="submit" 
          className="login-btn" 
          disabled={loading}
        >
          {loading ? "Publicando..." : "Publicar"}
        </button>
      </form>
    </div>
  );
}
