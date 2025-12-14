import { useState } from "react";
import "../../styles/homeStyles.css";
import { Link, useNavigate } from "react-router-dom";
// IMPORTANTE: Asegúrate de importar también 'API' para ver si está bien configurada
import { API } from "../utils/api"; 
import { login } from "../utils/Functions";
// NOTA: Si cambiaste el nombre del archivo a "api.js", cambia la línea de arriba a:
// import { login, API } from "../utils/api";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- ZONA DE DIAGNÓSTICO ---
    console.log("------------------------------------------------");
    console.log("🔍 1. Botón 'Ingresar' presionado.");
    console.log("📧 2. Datos capturados:", { email, password });
    console.log("🌍 3. URL de la API detectada:", API); 
    // ^^^ Si esto imprime 'undefined', el problema es tu archivo Functions.js / api.js
    console.log("🚀 4. Intentando conectar con:", `${API}/auth/login`);

    try {
      await login(email, password);
      console.log("✅ 5. ¡Login Exitoso! Redirigiendo a /home...");
      navigate("/home");
    } catch (error) {
      console.error("❌ 6. ERROR FATAL:", error);
      console.log("------------------------------------------------");
      alert("Error: " + (error.message || "Usuario o contraseña incorrectos."));
    }
  };

  return (
    <div>
      <div className="login-container">
        <h1>POLIMARKET</h1>

        <form id="login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            id="email"
            className="login-input"
            placeholder="usuario@espol.edu.ec"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            id="password"
            className="login-input"
            placeholder="Contraseña"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="login-btn">
            Ingresar
          </button>
        </form>
      </div>

      <div className="login-container">
        <a href="/recupera">Olvidé mi contraseña</a>
        <br />
        ¿No tienes una cuenta? <Link to="/register"> Regístrate aquí </Link>
      </div>
    </div>
  );
};
