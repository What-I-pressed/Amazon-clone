import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Home";
import Admin from "./pages/Dashboard/Home";
import SellerProfile from "./pages/Seller/Profile";
import LoginForm from "./components/LoginForm";
import Dashboard from "./pages/Dashboard";

// нові сторінки магазина
import HomePage from "./pages/Shop/Home";
import CatalogPage from "./pages/Shop/CatalogPage";
import ProductPage from "./pages/Shop/ProductPage";
import SellerPage from "./pages/Shop/Profile";
import CartPage from "./pages/Shop/CartPage";
import CheckoutPage from "./pages/Shop/CheckoutPage";
import ProfilePage from "./pages/Shop/ProfilePage";
import ChatPage from "./pages/Shop/ChatPage";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* 🔹 Магазин */}
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/seller/:id" element={<SellerProfile />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/chat" element={<ChatPage />} />

          {/* 🔹 Головна сторінка */}
          <Route path="/home" element={<Home />} />

          {/* 🔹 Адмін панель */}
          <Route path="/admin" element={<AppLayout />}>
            <Route index element={<Admin />} />
            <Route path="profile" element={<UserProfiles />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="blank" element={<Blank />} />
            <Route path="form-elements" element={<FormElements />} />
            <Route path="basic-tables" element={<BasicTables />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="avatars" element={<Avatars />} />
            <Route path="badge" element={<Badges />} />
            <Route path="buttons" element={<Buttons />} />
            <Route path="images" element={<Images />} />
            <Route path="videos" element={<Videos />} />
            <Route path="line-chart" element={<LineChart />} />
            <Route path="bar-chart" element={<BarChart />} />
          </Route>

          {/* 🔹 Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* 🔹 Login */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* 🔹 Fallback Route */}
          <Route path="*" element={<NotFound />} />

          {/* 🔹 Seller */}
          <Route path="/seller-old/:id" element={<SellerProfile />} />
        </Routes>
      </Router>
    </>
  );
}
