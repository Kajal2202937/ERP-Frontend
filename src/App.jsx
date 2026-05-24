import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Toaster } from "react-hot-toast";

import Layout from "./UI/Layout/Layout";
import MainLayout from "./components/layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Loader from "./components/common/Loader";
import NotFound from "./components/common/NotFound";

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

const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const Products = lazy(() => import("./pages/Products/Products"));
const Orders = lazy(() => import("./pages/Orders/Orders"));
const Inventory = lazy(() => import("./pages/Inventory/Inventory"));
const Suppliers = lazy(() => import("./pages/Suppliers/Suppliers"));
const Production = lazy(() => import("./pages/Production/Production"));
const Reports = lazy(() => import("./pages/Reports/Reports"));
const Profile = lazy(() => import("./pages/Profile/Profile"));

const SupportPage = lazy(() => import("./components/Ticket/SupportPage"));
const TicketsPage = lazy(() => import("./pages/Ticket/TicketPage"));

function App() {
  return (
    <Suspense fallback={<Loader fullscreen />}>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

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

        <Route path="/support" element={<SupportPage />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Navigate to="/login" replace />} />

        <Route
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "employee"]} />
          }
        >
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/inventory" element={<Inventory />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin", "manager"]} />}>
          <Route element={<MainLayout />}>
            <Route path="/products" element={<Products />} />
            <Route path="/production" element={<Production />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/suppliers" element={<Suppliers />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route element={<MainLayout />}>
            <Route path="/reports" element={<Reports />} />
            <Route path="/tickets" element={<TicketsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
