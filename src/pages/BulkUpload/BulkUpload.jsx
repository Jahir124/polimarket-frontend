import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../utils/api";
import * as XLSX from "xlsx";

export default function BulkUpload() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Preview del archivo antes de subirlo
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setResult(null);

    // Leer y mostrar preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);

      // Limitar preview a 10 productos
      setPreview(json.slice(0, 10));
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  // Subir archivo al backend
  const handleUpload = async () => {
    if (!file) {
      alert("Selecciona un archivo Excel primero");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API}/products/bulk-upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Error subiendo productos");
      }

      const data = await res.json();
      setResult(data);

      if (data.errors.length === 0) {
        alert(
          `✅ ¡${data.products_created} productos subidos exitosamente!`
        );
      } else {
        alert(
          `⚠️ ${data.products_created} productos creados, pero hubo ${data.errors.length} errores`
        );
      }
    } catch (error) {
      console.error(error);
      alert(error.message || "Error al procesar archivo");
    } finally {
      setLoading(false);
    }
  };

  // Descargar plantilla
  const downloadTemplate = async () => {
    try {
      const res = await fetch(`${API}/products/bulk-upload/template`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Error descargando plantilla");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "plantilla_productos_polimarket.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error(error);
      alert("Error descargando plantilla");
    }
  };

  return (
    <div className="container">
      <h1>📊 Carga Masiva de Productos</h1>

      <div className="login-container">
        <h2>Paso 1: Descarga la Plantilla</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
          Descarga el archivo Excel de ejemplo con el formato correcto
        </p>
        <button className="login-btn" onClick={downloadTemplate}>
          📥 Descargar Plantilla Excel
        </button>
      </div>

      <div className="login-container">
        <h2>Paso 2: Sube tu Archivo</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
          Llena la plantilla con tus productos y súbela aquí
        </p>

        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          style={{ marginBottom: "1rem" }}
        />

        {preview.length > 0 && (
          <div>
            <h3 style={{ color: "var(--primary)" }}>
              Vista Previa ({preview.length} primeros productos)
            </h3>
            <div style={{ overflowX: "auto", marginTop: "1rem" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.9rem",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "var(--input-bg)" }}>
                    <th style={{ padding: "0.5rem", border: "1px solid var(--border-color)" }}>
                      Título
                    </th>
                    <th style={{ padding: "0.5rem", border: "1px solid var(--border-color)" }}>
                      Precio
                    </th>
                    <th style={{ padding: "0.5rem", border: "1px solid var(--border-color)" }}>
                      Categoría
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: "0.5rem", border: "1px solid var(--border-color)" }}>
                        {row.title}
                      </td>
                      <td style={{ padding: "0.5rem", border: "1px solid var(--border-color)" }}>
                        ${row.price}
                      </td>
                      <td style={{ padding: "0.5rem", border: "1px solid var(--border-color)" }}>
                        {row.category}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <button
          className="login-btn"
          onClick={handleUpload}
          disabled={!file || loading}
          style={{ marginTop: "1rem" }}
        >
          {loading ? "Subiendo..." : "🚀 Subir Productos"}
        </button>
      </div>

      {result && (
        <div className="login-container">
          <h2>Resultado</h2>
          <div style={{ marginBottom: "1rem" }}>
            <p style={{ color: "var(--primary)", fontSize: "1.2rem" }}>
              ✅ {result.products_created} productos creados exitosamente
            </p>
            <p style={{ color: "var(--text-muted)" }}>
              Total de filas procesadas: {result.total_rows}
            </p>
          </div>

          {result.errors.length > 0 && (
            <div>
              <h3 style={{ color: "var(--accent)" }}>
                ⚠️ Errores ({result.errors.length})
              </h3>
              <ul style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                {result.errors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {result.products_details.length > 0 && (
            <div>
              <h3 style={{ color: "var(--primary)" }}>
                Productos Creados
              </h3>
              <ul style={{ fontSize: "0.9rem" }}>
                {result.products_details.map((prod, idx) => (
                  <li key={idx}>
                    Fila {prod.row}: {prod.title}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            className="login-btn"
            onClick={() => navigate("/seller")}
            style={{ marginTop: "1rem" }}
          >
            Ver Mis Productos
          </button>
        </div>
      )}
    </div>
  );
}
