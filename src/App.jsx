import { Route, Routes } from "react-router-dom";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import ChatRoom from "./pages/chat/ChatRoom";
import Recupera from "./pages/recupera/Recupera";
import ProductPage from "./pages/products/ProductPage";
import ProfilePage from "./pages/Seller/SellerPage";
import Home from "./pages/home/Home";
import Chats from "./pages/chat/Chats";
import ConfigPage from "./pages/config/ConfigPage";
import DeliveryPage from "./pages/delivery/DeliveryPage";
import BulkUpload from "./pages/BulkUpload/BulkUpload";
import "./styles/general.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/recupera" element={<Recupera />} />
      <Route path="/home" element={<Home />} />
      <Route path="/product/:id" element={<ProductPage />} />
      <Route path="/seller" element={<ProfilePage />} />
      <Route path="/chats" element={<Chats />} />
      <Route path="/chat-room" element={<ChatRoom />} />
      <Route path="/config" element={<ConfigPage />} />
      <Route path="/delivery" element={<DeliveryPage />} />
      <Route path="/bulk-upload" element={<BulkUpload />} />
    </Routes>
  );
}

export default App;
