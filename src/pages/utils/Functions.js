// --- CONFIGURACIÓN CENTRAL DE LA API ---

// 1. PARA PRODUCCIÓN (Cuando subes a Vercel)
// Esta dirección apunta a tu backend en Render.
export const API = "https://api-polimarket.onrender.com";

// 2. PARA DESARROLLO LOCAL (Cuando trabajas en tu PC)
// Si vuelves a probar en tu computadora, comenta la línea de arriba y descomenta esta:
// export const API = "http://127.0.0.1:8000";


// --- UTILIDADES ---

/**
 * Función auxiliar para obtener datos del usuario actual (opcional).
 * Los componentes de React suelen hacer esto por su cuenta, pero es útil tenerla aquí.
 */
export async function loadMe() {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        const res = await fetch(`${API}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
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