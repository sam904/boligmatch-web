import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import AdminLayout from "../components/layout/AdminLayout";
import LandingLayout from "../components/layout/LandingLayout";
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
import PartnerSubCategoriesPage from "../features/admin/partner-subcategories/PartnerSubCategoriesPage";
import UserDashboardPage from "../pages/UserDashboardPage";
import PartnerDashboard from "../features/partners/PartnerDashboard";
import ParentStatistics from "../features/partners/PartnerPages/PartnerStatistics";
import PartnerProfileShortcut from "../features/partners/PartnerPages/PartnerProfileShortcut";
import SearchForPartner from "../features/partners/PartnerPages/SearchForPartner";
// import UserLayout from "../components/layout/UserLayout";
import UserSupplier from "../pages/UserSupplier";
import SupplierProfile from "../pages/SupplierProfile";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "*", element: <NotFound /> },
    ],
  },
  {
    path: "/userDashboard",
    element: <LandingLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "dashboard", element: <UserDashboardPage /> },
      { path: "user-supplier", element: <UserSupplier /> },
      { path: "supplier-profile", element: <SupplierProfile /> },
    ],
  },
  {
    path: "/partnerDashboard",
    element: <PartnerLayout />,
    children: [
      { index: true, element: <PartnerDashboard /> },
      { path: "statistics", element: <ParentStatistics /> },
      { path: "profile-shortcut", element: <PartnerProfileShortcut /> },
      { path: "search-partner", element: <SearchForPartner /> },
    ],
  },
  // {
  //   path: '/partner',
  //   element: (
  //     <RoleGuard roles={['partner']}>
  //       <PartnerLayout />
  //     </RoleGuard>
  //   ),
  //   children: [
  //     { index: true, element: <PartnerDashboard /> },
  //   ],
  // },
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
      { index: true, element: <CategoriesPage /> },
      { path: "categories", element: <CategoriesPage /> },
      { path: "subcategories", element: <SubCategoriesPage /> },
      { path: "partners", element: <PartnersPage /> },
      { path: "users", element: <UsersListPage /> },
      { path: "partner-subcategories", element: <PartnerSubCategoriesPage /> },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
