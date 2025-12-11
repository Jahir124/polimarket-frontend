import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../utils/Functions";

export default function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Estados del formulario
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("food");
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
          // No poner 'Content-Type' aquí, fetch lo pone automático con FormData
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Error al subir producto");

      alert("¡Producto publicado!");
      navigate("/seller"); // Volver al panel
    } catch (error) {
      console.error(error);
      alert("Falló la publicación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Publicar Producto</h2>
      <form onSubmit={handleSubmit}>
        <input
          className="login-input"
          placeholder="Título (ej: Brownies Mágicos)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className="login-input"
          placeholder="Descripción detallada..."
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          required
        />
        <input
          className="login-input"
          type="number"
          placeholder="Precio ($)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        
        <select 
          className="login-input" 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="food">Alimentos</option>
          <option value="electronics">Electrónica</option>
          <option value="study">Estudios/Papelería</option>
          <option value="other">Otros</option>
        </select>

        <label style={{display:'block', margin:'10px 0'}}>Foto del producto:</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />

        <button className="login-btn" type="submit" disabled={loading}>
          {loading ? "Publicando..." : "Vender ahora"}
        </button>
      </form>
      <button onClick={() => navigate(-1)} style={{marginTop:'10px', background:'none', border:'none', color:'#666', cursor:'pointer'}}>Cancelar</button>
    </div>
  );
}