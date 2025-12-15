import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../utils/api";
import { login } from "../utils/Functions";
import "../../styles/homeStyles.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      navigate("/home");
    } catch (error) {
      console.error("Error de login:", error); // ✅ Solo error, no password
      alert(error.message || "Usuario o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ marginTop: "4rem" }}>
      <h1>Iniciar Sesión</h1>
      <form onSubmit={handleSubmit}>
        <input
          className="login-input"
          type="email"
          placeholder="Correo @espol.edu.ec"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="login-input"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
      <p style={{ marginTop: "1rem" }}>
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
      <p>
        <Link to="/recupera">¿Olvidaste tu contraseña?</Link>
      </p>
    </div>
  );
}
