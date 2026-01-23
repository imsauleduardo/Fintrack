import React from "react";

export default function OfflinePage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
        padding: "20px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🌐</div>
      <h1
        style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "10px" }}
      >
        Estás fuera de línea
      </h1>
      <p
        style={{
          fontSize: "1.1rem",
          color: "#666",
          marginBottom: "30px",
          maxWidth: "400px",
        }}
      >
        Parece que no tienes conexión a internet. Fintrack guardará tus datos
        localmente y los sincronizará cuando vuelvas.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: "12px 24px",
          fontSize: "1rem",
          backgroundColor: "#000",
          color: "#fff",
          border: "none",
          borderRadius: "12px",
          fontWeight: "600",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        Reintentar conexión
      </button>
    </div>
  );
}
