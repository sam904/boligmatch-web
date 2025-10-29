import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import AdminLayout from "../components/layout/AdminLayout";
import PartnerLayout from "../components/layout/PartnerLayout";
import HomePage from "../pages/HomePage";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../features/auth/LoginPage";
import AuthGuard from "../features/auth/AuthGuard";
import RoleGuard from "../features/auth/RoleGuard";
import NotFound from "../pages/NotFound";

import CategoriesPage from "../features/admin/categories/CategoriesPage";
import SubCategoriesPage from "../features/admin/subcategories/SubCategoriesPage";
import PartnersPage from "../features/admin/partners/PartnersPage";
import UsersListPage from "../features/admin/users/UsersListPage";
import UserDashboardPage from "../pages/UserDashboardPage";
import PartnerDashboard from "../features/partners/PartnerDashboard";
import ParentStatistics from "../features/partners/PartnerPages/PartnerStatistics";
import PartnerProfileShortcut from "../features/partners/PartnerPages/PartnerProfileShortcut";
import SearchForPartner from "../features/partners/PartnerPages/SearchForPartner";
import UserSupplier from "../pages/UserSupplier";
import SupplierProfile from "../pages/SupplierProfile";
import DashboardPage from "../features/admin/dashboard/DashboardPage";

const router = createBrowserRouter([
  // 🔹 User Routes (Main Site)
  {
    path: "/",
    element: <AppLayout />,
    children: [
      // { index: true, element: <HomePage /> },
      { path: "home-page", element: <HomePage /> },
      { index: true, element: <LandingPage /> },
      { path: "profile", element: <UserDashboardPage /> },
      { path: "user-supplier", element: <UserSupplier /> },
      { path: "supplier-profile", element: <SupplierProfile /> },
      { path: "login", element: <LoginPage /> },
      { path: "*", element: <NotFound /> },
    ],
  },

  // 🔹 Partner Routes
  {
    path: "/partner",
    element: (
      <AuthGuard>
        <RoleGuard roles={["partner"]}>
          <PartnerLayout />
        </RoleGuard>
      </AuthGuard>
    ),
    children: [
      { index: true, element: <PartnerDashboard /> },
      { path: "dashboard", element: <PartnerDashboard /> },
      { path: "statistics", element: <ParentStatistics /> },
      { path: "profile-shortcut", element: <PartnerProfileShortcut /> },
      { path: "search", element: <SearchForPartner /> },
    ],
  },

  // 🔹 Admin Routes
  {
    path: "/admin",
    element: (
      <AuthGuard>
        <RoleGuard roles={["admin"]}>
          <AdminLayout />
        </RoleGuard>
      </AuthGuard>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "categories", element: <CategoriesPage /> },
      { path: "subcategories", element: <SubCategoriesPage /> },
      { path: "partners", element: <PartnersPage /> },
      { path: "users", element: <UsersListPage /> },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
