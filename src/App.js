import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Shop from "./pages/Shop";
import ShopCategory from "./pages/ShopCategory";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import LoginSignUp from "./pages/LoginSignUp";
import Admin from "./pages/Admin";
import PlaceOrder from "./pages/PlaceOrder";
import MyOrders from "./pages/MyOrders";
import TrackOrder from "./pages/TrackOrder";

import Footer from "./components/Footer/Footer";
import men_banner from "./components/Assets/Frontend_Assets/banner_mens.png";
import women_banner from "./components/Assets/Frontend_Assets/banner_women.png";
import kid_banner from "./components/Assets/Frontend_Assets/banner_kids.png";
import { ModalProvider } from "./context/ModalContext";
import Modal from "./components/Modal/Modal";

function App() {
  return (
    <ModalProvider>
      <div>
        <BrowserRouter>
          <Navbar />
          <Modal />
          <Routes>
            <Route path="/" element={<Shop />} />
            <Route
              path="/mens"
              element={<ShopCategory banner={men_banner} category="men" />}
            />
            <Route
              path="/womens"
              element={<ShopCategory banner={women_banner} category="women" />}
            />
            <Route
              path="/kids"
              element={<ShopCategory banner={kid_banner} category="kid" />}
            />
            <Route path="/product" element={<Product />}>
              <Route path=":productId" element={<Product />} />
            </Route>
            <Route path="/cart" element={<Cart />} />
            <Route path="/placeorder" element={<PlaceOrder />} />
            <Route path="/myorders" element={<MyOrders />} />
            <Route path="/trackorder/:orderId" element={<TrackOrder />} />

            <Route path="/login" element={<LoginSignUp />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </div>
    </ModalProvider>
  );
}

export default App;
