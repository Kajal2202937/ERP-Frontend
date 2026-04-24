import "./App.css";
import { Routes, Route } from "react-router-dom";
import { useEffect, useRef, lazy, Suspense } from "react";

import Layout from "./UI/Layout/Layout";
import MainLayout from "./components/layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

import { initSocket } from "./services/socket";
import useAuth from "./hooks/useAuth";

const HomePage = lazy(() => import("./UI/DefaultPages/HomePage/HomePage"));
const AboutPage = lazy(() => import("./UI/DefaultPages/AboutPage/AboutPage"));
const Contact = lazy(() => import("./UI/DefaultPages/Contact/Contact"));

const InventoryInfo = lazy(
  () => import("./UI/DefaultPages/ModuleInfo/InventoryInfo"),
);
const ProductionInfo = lazy(
  () => import("./UI/DefaultPages/ModuleInfo/ProductionInfo"),
);
const SalesInfo = lazy(() => import("./UI/DefaultPages/ModuleInfo/SalesInfo"));
const ReportsInfo = lazy(
  () => import("./UI/DefaultPages/ModuleInfo/ReportsInfo"),
);

const Login = lazy(() => import("./Authentication/Login"));
const Register = lazy(() => import("./Authentication/Register"));

const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const Products = lazy(() => import("./pages/Products/Products"));
const Orders = lazy(() => import("./pages/Orders/Orders"));
const Inventory = lazy(() => import("./pages/Inventory/Inventory"));
const Suppliers = lazy(() => import("./pages/Suppliers/Suppliers"));
const Production = lazy(() => import("./pages/Production/Production"));
const Reports = lazy(() => import("./pages/Reports/Reports"));
const Profile = lazy(() => import("./pages/Profile/Profile"));
const Contacts = lazy(() => import("./pages/Contacts/Contacts"));

function App() {
  const { user } = useAuth();
  const socketInitialized = useRef(false);

  useEffect(() => {
    const token = user?.token || localStorage.getItem("token");

    if (token && !socketInitialized.current) {
      initSocket(token);
      socketInitialized.current = true;
      console.log("🚀 Socket initialized from App.js");
    }
  }, [user]);

  return (
    <Suspense fallback={<h2 style={{ textAlign: "center" }}>Loading...</h2>}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/inventory/info" element={<InventoryInfo />} />
          <Route path="/production/info" element={<ProductionInfo />} />
          <Route path="/sales" element={<SalesInfo />} />
          <Route path="/reports/info" element={<ReportsInfo />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "staff"]} />
          }
        >
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        <Route
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "staff"]} />
          }
        ></Route>

        <Route element={<ProtectedRoute allowedRoles={["admin", "manager"]} />}>
          <Route element={<MainLayout />}>
            <Route path="/products" element={<Products />} />
          </Route>
        </Route>

        <Route
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "staff"]} />
          }
        >
          <Route element={<MainLayout />}>
            <Route path="/inventory" element={<Inventory />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin", "manager"]} />}>
          <Route element={<MainLayout />}>
            <Route path="/production" element={<Production />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route element={<MainLayout />}>
            <Route path="/reports" element={<Reports />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin", "manager"]} />}>
          <Route element={<MainLayout />}>
            <Route path="/orders" element={<Orders />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/contacts" element={<Contacts />} />
          </Route>
        </Route>

        <Route path="*" element={<h1>Page Not Found</h1>} />
      </Routes>
    </Suspense>
  );
}

export default App;
