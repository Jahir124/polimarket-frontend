import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../utils/httpClient";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    apiRequest("/auth/me")
      .then(setUser)
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading, token };
}

// Ejemplo de uso en componentes:
// const { user, loading } = useAuth();
// if (loading) return <p>Cargando...</p>;
