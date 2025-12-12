// utils/Functions.js
import { API } from "./api";

// --- AUTH ---

export async function login(email, password) {
  const formData = new URLSearchParams();
  formData.append("username", email);   // El backend usa form.username -> User.email
  formData.append("password", password);

  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  if (!res.ok) {
    // Opcional: puedes leer el texto para debug
    const text = await res.text();
    console.error("Login error:", res.status, text);
    throw new Error("Login fallido");
  }

  const data = await res.json();
  localStorage.setItem("token", data.access_token);
  return data;
}

// Obtener info del usuario autenticado
export async function loadMe() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const res = await fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      return await res.json();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error verificando sesión:", error);
    return null;
  }
}

// --- ÓRDENES / DELIVERY ---

export async function createOrder({ product_id, faculty, building, payment_method }) {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No autenticado");
  }

  const res = await fetch(`${API}/orders/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      product_id,
      faculty,
      building,
      payment_method,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Error en createOrder:", res.status, text);
    throw new Error(`Error creando orden: ${res.status}`);
  }

  return await res.json();
}
