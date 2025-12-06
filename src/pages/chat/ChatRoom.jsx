import { useEffect } from "react";
import { loadChatRoom, loadMe, sendMsg} from "../utils/Functions";

export const ChatRoom = () => {

  useEffect(() => {
    loadMe();
    loadChatRoom();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMsg();
    }
  };

  return (
    <>
      <header className="header">
        <a href="/chats" className="logo" style={{ fontSize: "1.2rem" }}>← Volver</a>
        <h2 id="chat-header-title">Cargando...</h2>
        <div className="user-icon" id="user-icon"></div>
      </header>

      <div className="chat-room-container">
        <div id="msgs"></div>

        <div className="chat-input-area">
          <input
            id="msgInput"
            placeholder="Escribe..."
            onKeyDown={handleKeyDown}
          />
          <button className="send-btn" onClick={sendMsg}>Enviar</button>
        </div>
      </div>
    </>
  );
};

export default ChatRoom;
