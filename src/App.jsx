import { Route, Routes } from "react-router-dom"
import { Login } from "./pages/login/Login"
import { Register } from "./pages/register/Register"
import { ChatRoom } from "./pages/chat/ChatRoom"
import { Recupera } from "./pages/recupera/Recupera";
import "./styles/general.css"
import ProductPage from "./pages/products/ProductPage";
import ProfilePage from "./pages/Seller/SellerPage";
import Home from "./pages/home/Home";
import Chats from "./pages/chat/Chats";

import ConfigPage from "./pages/config/ConfigPage";
import DeliveryPage from "./pages/delivery/DeliveryPage";




function App() {

  return (
    <Routes>
      <Route path="/" element={<Login/>}/>
      <Route path="/home" element={<Home />}/>
      <Route path="/Register" element={<Register />}/>
      <Route path="/Recupera" element={<Recupera />}/>
      <Route path="/chat-room" element={<ChatRoom />}/>
      <Route path="chats" element={<Chats />}/>
      <Route path='/product/:id' element={<ProductPage />}/>
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/config" element={<ConfigPage />} />
      <Route path="/deliveryDashboard" element={<DeliveryPage />} /> 
    </Routes>
  )
}

export default App