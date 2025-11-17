import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { useAppSelector } from "./hooks";
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
import PartnerDocuments from "../features/partners/PartnerPages/PartnerDocuments";
// import PartnerProfileShortcut from "../features/partners/PartnerPages/PartnerProfileShortcut";
// import SearchForPartner from "../features/partners/PartnerPages/SearchForPartner";
import UserSupplier from "../pages/UserSupplier";
import SupplierProfile from "../pages/SupplierProfile";
import DashboardPage from "../features/admin/dashboard/DashboardPage";
import TestimonialPage from "../features/admin/testimonial/TestimonialPage";
import AboutBoligmatch from "../pages/AboutBoligmatch";
import TermsAndConditions from "../pages/TermsAndConditions";
import RecommendUser from "../pages/RecommendUser";
import ManageProfile from "../pages/ManageProfile";

function BlockPartner({ children }: { children: React.ReactNode }) {
  let partner: any = null;
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem("bm_partner") : null;
    if (raw) partner = JSON.parse(raw);
  } catch {}
  if (partner) {
    return <Navigate to="/partner" replace />;
  }
  return <>{children}</>;
}

function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const storeUser = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.accessToken);

  let bmUser: any = null;
  let bmPartner: any = null;
  try {
    const rawUser = typeof window !== "undefined" ? localStorage.getItem("bm_user") : null;
    const rawPartner = typeof window !== "undefined" ? localStorage.getItem("bm_partner") : null;
    if (rawUser) bmUser = JSON.parse(rawUser);
    if (rawPartner) bmPartner = JSON.parse(rawPartner);
  } catch {}

  const roleName = (storeUser as any)?.roleName?.toLowerCase?.() ?? "";

  if (token && storeUser && roleName === "admin") {
    return <Navigate to="/admin" replace />;
  }

  if (bmPartner) {
    return <Navigate to="/partner" replace />;
  }

  if (bmUser) {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
}

const router = createBrowserRouter([
  // 🔹 User Routes (Main Site)
  {
    path: "/",
    element: <AppLayout />,
    children: [
      // { index: true, element: <HomePage /> },
      { path: "home-page", element: <HomePage /> },
      { index: true, element: (
        <BlockPartner>
          <LandingPage />
        </BlockPartner>
      ) },
      { path: "about", element: <AboutBoligmatch /> },
      { path: "terms", element: <TermsAndConditions /> },
      { path: "profile", element: (
        <AuthGuard>
          <RoleGuard roles={["User"]}>
            <UserDashboardPage />
          </RoleGuard>
        </AuthGuard>
      ) },
      { path: "manage-profile", element: (
        <AuthGuard>
          <RoleGuard roles={["User"]}>
            <ManageProfile />
          </RoleGuard>
        </AuthGuard>
      ) },
      { path: "user-supplier", element: <UserSupplier /> },
      { path: "supplier-profile", element: <SupplierProfile /> },
      { path: "login", element: (
        <RedirectIfAuthed>
          <LoginPage />
        </RedirectIfAuthed>
      ) },
      { path: "*", element: <NotFound /> },
      { path: "user/recommenduser/:recommendationKey", element: <RecommendUser /> },
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
      { path: "documents", element: <PartnerDocuments /> },
      // { path: "profile-shortcut", element: <PartnerProfileShortcut /> },
      // { path: "search", element: <SearchForPartner /> },
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
      { path: "testimonial/:partnerId", element: <TestimonialPage /> },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
