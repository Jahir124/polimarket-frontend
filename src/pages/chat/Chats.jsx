import { useEffect } from "react";
import { loadChatList, loadMe } from "../utils/Functions";

const Chats = () => {

  useEffect(() => {
    loadMe();
    loadChatList();
  }, []);

  return (
    <>
      <header className="header">
        <a href="/home" className="logo" style={{ fontSize: "1.2rem" }}>← Volver</a>
        <h2>Mis Chats</h2>
        <div
          className="user-icon"
          id="user-icon"
          onClick={() => (window.location.href = "seller.html")}
        ></div>
      </header>

      <div className="container">
        <div id="chat-list-container">
          <p>Cargando tus chats...</p>
        </div>
      </div>
    </>
  );
};

export default Chats;
