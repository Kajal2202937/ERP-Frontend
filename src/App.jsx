import "./App.css";
import { Routes, Route } from "react-router-dom";

// PUBLIC
import Layout from "./UI/Layout/Layout";
import HomePage from "./UI/DefaultPages/HomePage/HomePage";
import AboutPage from "./UI/DefaultPages/AboutPage/AboutPage";
import Contact from "./UI/DefaultPages/Contact/Contact";

// MODULE INFO
import InventoryInfo from "./UI/DefaultPages/ModuleInfo/InventoryInfo";
import ProductionInfo from "./UI/DefaultPages/ModuleInfo/ProductionInfo";
import SalesInfo from "./UI/DefaultPages/ModuleInfo/SalesInfo";
import ReportsInfo from "./UI/DefaultPages/ModuleInfo/ReportsInfo";

// AUTH
import Login from "./Authentication/Login";
import Register from "./Authentication/Register";

// ERP PAGES
import Dashboard from "./pages/Dashboard/Dashboard";
import Products from "./pages/Products/Products";
import Orders from "./pages/Orders/Orders";
import Inventory from "./pages/Inventory/Inventory";
import Suppliers from "./pages/Suppliers/Suppliers";
import Production from "./pages/Production/Production";
import Reports from "./pages/Reports/Reports";
import Profile from "./pages/Profile/Profile";
import Contacts from "./pages/Contacts/Contacts";

// SYSTEM
import MainLayout from "./components/layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

function App() {
  return (
    <Routes>

      {/* 🌐 PUBLIC ROUTES */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/inventory/info" element={<InventoryInfo />} />
        <Route path="/production/info" element={<ProductionInfo />} />
        <Route path="/sales" element={<SalesInfo />} />
        <Route path="/reports/info" element={<ReportsInfo />} />
      </Route>

      {/* AUTH */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* 🔐 DASHBOARD (ALL ROLES) */}
      <Route element={<ProtectedRoute allowedRoles={["admin", "manager", "staff"]} />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* 📦 PRODUCTS (ADMIN + MANAGER ONLY) */}
      <Route element={<ProtectedRoute allowedRoles={["admin", "manager"]} />}>
        <Route element={<MainLayout />}>
          <Route path="/products" element={<Products />} />
        </Route>
      </Route>

      {/* 📊 INVENTORY (ADMIN + MANAGER + STAFF VIEW) */}
      <Route element={<ProtectedRoute allowedRoles={["admin", "manager", "staff"]} />}>
        <Route element={<MainLayout />}>
          <Route path="/inventory" element={<Inventory />} />
        </Route>
      </Route>

      {/* 🏭 PRODUCTION (ADMIN + MANAGER ONLY) */}
      <Route element={<ProtectedRoute allowedRoles={["admin", "manager"]} />}>
        <Route element={<MainLayout />}>
          <Route path="/production" element={<Production />} />
        </Route>
      </Route>

      {/* 📈 REPORTS (ADMIN ONLY) */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route element={<MainLayout />}>
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Route>

      {/* 👥 GENERAL MODULES */}
      <Route element={<ProtectedRoute allowedRoles={["admin", "manager"]} />}>
        <Route element={<MainLayout />}>
          <Route path="/orders" element={<Orders />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/contacts" element={<Contacts />} />
        </Route>
      </Route>

      {/* ❌ FALLBACK */}
      <Route path="*" element={<h1>Page Not Found</h1>} />

    </Routes>
  );
}

export default App;