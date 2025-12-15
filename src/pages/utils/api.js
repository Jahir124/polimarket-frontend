// src/utils/api.js
export const API = import.meta.env.VITE_APP_API_URL || "https://api-polimarket.onrender.com";

// Para debug (eliminar en producción)
console.log("🌍 API configurada:", API);
