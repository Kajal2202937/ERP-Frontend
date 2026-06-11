import "./App.css";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";

import Layout from "./UI/Layout/Layout";
import MainLayout from "./components/layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Loader from "./components/common/Loader";
import NotFound from "./components/common/NotFound";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import ResetPassword from "./Authentication/ResetPassword";
import GlobalSearch from "./components/common/Globalsearch";

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
const SupportPage = lazy(() => import("./components/Ticket/SupportPage"));

/* ── Lazy authenticated pages ── */
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const Products = lazy(() => import("./pages/Products/Products"));
const Orders = lazy(() => import("./pages/Orders/Orders"));
const Inventory = lazy(() => import("./pages/Inventory/Inventory"));
const Suppliers = lazy(() => import("./pages/Suppliers/Suppliers"));
const Production = lazy(() => import("./pages/Production/Production"));
const Reports = lazy(() => import("./pages/Reports/Reports"));
const Profile = lazy(() => import("./pages/Profile/Profile"));
const TicketsPage = lazy(() => import("./pages/Ticket/TicketPage"));

/* ── Document title map ── */
const PAGE_TITLES = {
  "/": "ERP System",
  "/about": "About · ERP",
  "/contact": "Contact · ERP",
  "/login": "Sign in · ERP",
  "/dashboard": "Dashboard · ERP",
  "/products": "Products · ERP",
  "/orders": "Orders · ERP",
  "/inventory": "Inventory · ERP",
  "/suppliers": "Suppliers · ERP",
  "/production": "Production · ERP",
  "/reports": "Reports · ERP",
  "/profile": "My Profile · ERP",
  "/tickets": "Support · ERP",
};

/* Sets browser tab title on every navigation */
function DocumentTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = PAGE_TITLES[pathname] ?? "ERP System";
  }, [pathname]);
  return null;
}

/**
 * Page — per-route Suspense + ErrorBoundary wrapper
 *
 * Wraps each lazy-loaded page so that:
 *  - It shows a page-specific loading spinner while the chunk downloads
 *  - If the chunk fails, only that route shows an error boundary —
 *    the navbar, sidebar, and other routes are unaffected
 */
function Page({ children, title }) {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <Loader fullscreen text={title ? `Loading ${title}…` : undefined} />
        }
      >
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

function GlobalSearchWrapper() {
  return (
    <>
      <GlobalSearch />
      <Outlet />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <DocumentTitle />

      <Routes>
        {/* ════════════════════════════════════════
            PUBLIC ROUTES
        ════════════════════════════════════════ */}
        <Route element={<Layout />}>
          <Route
            path="/"
            element={
              <Page title="Home">
                {" "}
                <HomePage />{" "}
              </Page>
            }
          />
          <Route
            path="/about"
            element={
              <Page title="About">
                {" "}
                <AboutPage />{" "}
              </Page>
            }
          />
          <Route
            path="/contact"
            element={
              <Page title="Contact">
                {" "}
                <Contact />{" "}
              </Page>
            }
          />
          <Route
            path="/inventory/info"
            element={
              <Page>
                {" "}
                <InventoryInfo />{" "}
              </Page>
            }
          />
          <Route
            path="/production/info"
            element={
              <Page>
                {" "}
                <ProductionInfo />
              </Page>
            }
          />
          <Route
            path="/sales"
            element={
              <Page>
                {" "}
                <SalesInfo />{" "}
              </Page>
            }
          />
          <Route
            path="/reports/info"
            element={
              <Page>
                {" "}
                <ReportsInfo />{" "}
              </Page>
            }
          />
        </Route>

        <Route
          path="/support"
          element={
            <Page title="Support">
              {" "}
              <SupportPage />{" "}
            </Page>
          }
        />
        <Route
          path="/login"
          element={
            <Page title="Sign in">
              {" "}
              <Login />{" "}
            </Page>
          }
        />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<Navigate to="/login" replace />} />

        {/* ════════════════════════════════════════
            AUTHENTICATED ROUTES
            — Single ProtectedRoute guards the entire section
            — Single MainLayout prevents remount on navigation
            — GlobalSearchWrapper mounts ⌘K once for all pages
        ════════════════════════════════════════ */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={["admin", "manager", "employee", "staff"]}
            />
          }
        >
          <Route element={<MainLayout />}>
            <Route element={<GlobalSearchWrapper />}>
              {/* ── All authenticated roles ── */}
              <Route
                path="/dashboard"
                element={
                  <Page title="Dashboard">
                    <Dashboard />
                  </Page>
                }
              />
              <Route
                path="/profile"
                element={
                  <Page title="Profile">
                    <Profile />
                  </Page>
                }
              />

              {/* ── admin + manager + employee ── */}
              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={["admin", "manager", "employee"]}
                  />
                }
              >
                <Route
                  path="/inventory"
                  element={
                    <Page title="Inventory">
                      <Inventory />
                    </Page>
                  }
                />
              </Route>

              {/* ── admin + manager ── */}
              <Route
                element={<ProtectedRoute allowedRoles={["admin", "manager"]} />}
              >
                <Route
                  path="/products"
                  element={
                    <Page title="Products">
                      <Products />
                    </Page>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <Page title="Orders">
                      <Orders />
                    </Page>
                  }
                />
                <Route
                  path="/suppliers"
                  element={
                    <Page title="Suppliers">
                      <Suppliers />
                    </Page>
                  }
                />
                <Route
                  path="/production"
                  element={
                    <Page title="Production">
                      <Production />
                    </Page>
                  }
                />
              </Route>

              {/* ── admin only ── */}
              <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                <Route
                  path="/reports"
                  element={
                    <Page title="Reports">
                      <Reports />
                    </Page>
                  }
                />
                <Route
                  path="/tickets"
                  element={
                    <Page title="Support">
                      <TicketsPage />
                    </Page>
                  }
                />
              </Route>
            </Route>
          </Route>
        </Route>

        {/* ── 404 ── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
