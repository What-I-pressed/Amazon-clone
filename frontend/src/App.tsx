import { BrowserRouter as Router, Routes, Route } from "react-router";
import { ScrollToTop } from "./components/common/ScrollToTop";

// Layout
import AppLayout from "./layout/AppLayout";

// Auth
import LoginForm from "./components/Login/LoginForm";
import RegistrationForm from "./components/Register/RegistrationForm";

// Other
import NotFound from "./pages/OtherPage/NotFound";

// Dashboard (Admin)
import Admin from "./pages/Dashboard/Home";
import UserProfiles from "./pages/UserProfiles";
import Calendar from "./pages/Calendar";
import Blank from "./pages/Blank";
import FormElements from "./pages/Forms/FormElements";
import BasicTables from "./pages/Tables/BasicTables";
import Alerts from "./pages/UiElements/Alerts";
import Avatars from "./pages/UiElements/Avatars";
import Badges from "./pages/UiElements/Badges";
import Buttons from "./pages/UiElements/Buttons";
import Images from "./pages/UiElements/Images";
import Videos from "./pages/UiElements/Videos";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";

// Shop
import HomePage from "./pages/Home";
import CatalogPage from "./pages/CatalogPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import ProfilePage from "./pages/ProfilePage";
import ChatPage from "./pages/ChatPage";

// Seller
import SellerProfile from "./pages/Seller/Profile";
import SellerDashboard from "./pages/Seller/Dashboard";
import SellerEditProfile from "./pages/Seller/Edit";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>

        {/* з лейаутом */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/seller/:id" element={<SellerProfile />} />
          <Route path="seller">
              <Route index element={<SellerProfile />} /> 
              <Route path="dashboard" element={<SellerDashboard />} /> 
              <Route path="edit" element={<SellerEditProfile />} /> 
            </Route>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/chat" element={<ChatPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegistrationForm />} />
        </Route>

        {/* Адмінка (з лейаутом) */}
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
        
        {/* Інші */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>
  );
}