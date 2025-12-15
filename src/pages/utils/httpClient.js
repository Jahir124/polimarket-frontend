import { API } from "./api";

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  
  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  try {
    const response = await fetch(`${API}${endpoint}`, config);

    // Manejo automático de 401
    if (response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/";
      throw new Error("Sesión expirada");
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `Error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error en ${endpoint}:`, error);
    throw error;
  }
}

// Ejemplo de uso:
// const products = await apiRequest('/products');
// const user = await apiRequest('/users/me');
