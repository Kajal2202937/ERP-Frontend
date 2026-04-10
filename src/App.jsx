import "./App.css";
import { Routes, Route } from "react-router-dom";

// 🌐 PUBLIC LAYOUT
import Layout from "./UI/Layout/Layout";
import HomePage from "./UI/DefaultPages/HomePage/HomePage";
import AboutPage from "./UI/DefaultPages/AboutPage/AboutPage";
import Contact from "./UI/DefaultPages/Contact/Contact";

// 📦 MODULE INFO
import InventoryInfo from "./UI/DefaultPages/ModuleInfo/InventoryInfo";
import ProductionInfo from "./UI/DefaultPages/ModuleInfo/ProductionInfo";
import SalesInfo from "./UI/DefaultPages/ModuleInfo/SalesInfo";
import ReportsInfo from "./UI/DefaultPages/ModuleInfo/ReportsInfo";

// 🔐 AUTH
import Login from "./Authentication/Login";
import Register from "./Authentication/Register";

// 🔒 PROTECTED (REAL ERP)
import Dashboard from "./pages/Dashboard/Dashboard";
import Products from "./pages/Products/Products";
import Orders from "./pages/Orders/Orders";
import Inventory from "./pages/Inventory/Inventory";
import Suppliers from "./pages/Suppliers/Suppliers";
import Production from "./pages/Production/Production";
import Reports from "./pages/Reports/Reports";

// 🧠 LAYOUTS
import MainLayout from "./components/layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/inventory" element={<InventoryInfo />} />
        <Route path="/production" element={<ProductionInfo />} />
        <Route path="/sales" element={<SalesInfo />} />
        <Route path="/reports" element={<ReportsInfo />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute allowedRoles={["admin", "manager"]} />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/inventory/manage" element={<Inventory />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/production/manage" element={<Production />} />
          <Route path="/reports/manage" element={<Reports />} />
        </Route>
      </Route>

      <Route path="*" element={<h1>Page Not Found</h1>} />
    </Routes>
  );
}

export default App;
