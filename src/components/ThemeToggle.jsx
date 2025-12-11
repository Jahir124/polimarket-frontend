import { useEffect, useState } from "react";

export default function ThemeToggle() {
  // Leemos del localStorage o usamos 'light' por defecto
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    // Aplicamos la clase al body
    if (theme === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
    // Guardamos la preferencia
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <button
      onClick={toggleTheme}
      style={{
        background: "var(--bg-input)",
        border: "1px solid var(--border)",
        color: "var(--text-main)",
        padding: "8px 12px",
        borderRadius: "20px",
        cursor: "pointer",
        fontSize: "1.2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.3s"
      }}
      title="Cambiar Modo Oscuro/Claro"
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}