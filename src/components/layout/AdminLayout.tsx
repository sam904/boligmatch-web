// src/components/layout/AdminLayout.tsx
import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
// import { logout } from "../../features/auth/authSlice";
// import { IconLogout } from "../common/Icons/Index";

// Enhanced route mapping with titles and subtitles
interface RouteInfo {
  title: string;
  subtitle?: string;
}

const routeMap: Record<string, RouteInfo> = {
  "/admin/dashboard": {
    title: "nav.dashboard",
    subtitle: "admin.dashboard.subtitle",
  },
  "/admin/categories": {
    title: "nav.categories",
    subtitle: "admin.categories.subtitle",
  },
  "/admin/subcategories": {
    title: "nav.subcategories",
    subtitle: "admin.subcategories.subtitle",
  },
  "/admin/partners": {
    title: "nav.partners",
    subtitle: "admin.partners.subtitle",
  },
  "/admin/users": {
    title: "nav.users",
    subtitle: "admin.users.subtitle",
  },
};

export default function AdminLayout() {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  console.log('dispatch', dispatch)
  const user = useAppSelector((s) => s.auth.user);
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Get current page info based on route
  const getCurrentPageInfo = (): RouteInfo => {
    const currentPath = location.pathname;

    // Find matching route
    for (const [route, routeInfo] of Object.entries(routeMap)) {
      if (currentPath.startsWith(route)) {
        return routeInfo;
      }
    }

    // Fallback for unknown routes
    const pathSegments = currentPath.split("/").filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];
    const fallbackTitle = lastSegment
      ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
      : "Admin";

    return {
      title: fallbackTitle,
      subtitle: `admin.${lastSegment || "dashboard"}.subtitle`,
    };
  };

  // Get user initials for profile circle
  const getUserInitials = () => {
    if (!user) return "U";
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";

    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  // const handleLogout = () => {
  //   dispatch(logout());
  //   setShowUserDropdown(false);
  // };

  const currentPageInfo = getCurrentPageInfo();
  const currentPageTitle = t(currentPageInfo.title);
  const currentPageSubtitle = currentPageInfo.subtitle
    ? t(currentPageInfo.subtitle)
    : "";
  const currentLang = i18n.language || "en";

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 p-3 transition-all duration-200 text-sm relative ${
      isActive
        ? "text-white bg-white/10 shadow-inner backdrop-blur-sm border-l-4 border-[#95C11F]"
        : "text-gray-200 hover:bg-white/5 hover:text-white border-l-4 border-transparent"
    } ${isCollapsed ? "justify-center" : ""}`;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar - removed logout button from bottom */}
      <aside
        className={`flex-shrink-0 bg-[#043428] text-white shadow-xl transition-all duration-300 ${
          isCollapsed ? "w-16" : "w-64"
        } flex flex-col`}
      >
        <div className="p-4 flex items-center">
          {!isCollapsed && (
            <img src="/logo.svg" alt="BoligMatch" className="h-10 ml-4" />
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 text-gray-200 hover:bg-white/5 hover:text-white rounded-lg transition-colors ml-auto"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isCollapsed ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              )}
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {/* Navigation links */}
          <NavLink
            to="/admin/dashboard"
            className={navLinkClass}
            title={isCollapsed ? t("nav.dashboard") : ""}
          >
            <svg
              className="w-5 h-5 flex-shrink-0 mx-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2zm0 8l2.5-1.5L8 15l3.5-4.5 5 6"
              />
            </svg>
            {!isCollapsed && <span className="ml-2">{t("nav.dashboard")}</span>}
          </NavLink>

          <NavLink
            to="/admin/categories"
            className={navLinkClass}
            title={isCollapsed ? t("nav.categories") : ""}
          >
            <svg
              className="w-5 h-5 flex-shrink-0 mx-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
            {!isCollapsed && (
              <span className="ml-2">{t("nav.categories")}</span>
            )}
          </NavLink>

          <NavLink
            to="/admin/subcategories"
            className={navLinkClass}
            title={isCollapsed ? t("nav.subcategories") : ""}
          >
            <svg
              className="w-5 h-5 flex-shrink-0 mx-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7m14 6l-7 7-7-7"
              />
            </svg>
            {!isCollapsed && (
              <span className="ml-2">{t("nav.subcategories")}</span>
            )}
          </NavLink>

          <NavLink
            to="/admin/partners"
            className={navLinkClass}
            title={isCollapsed ? t("nav.partners") : ""}
          >
            <svg
              className="w-5 h-5 flex-shrink-0 mx-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {!isCollapsed && <span className="ml-2">{t("nav.partners")}</span>}
          </NavLink>

          <NavLink
            to="/admin/users"
            className={navLinkClass}
            title={isCollapsed ? t("nav.users") : ""}
          >
            <svg
              className="w-5 h-5 flex-shrink-0 mx-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            {!isCollapsed && <span className="ml-2">{t("nav.users")}</span>}
          </NavLink>
        </nav>
      </aside>

      {/* Right Side: Header + Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 bg-white text-[#043428] shadow-sm border-b border-gray-300">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              {/* Dynamic page title and subtitle */}
              <div>
                <h1 className="text-xl font-bold text-black">
                  {currentPageTitle}
                </h1>
                {currentPageSubtitle && (
                  <p className="text-gray-500 text-sm mt-1">
                    {currentPageSubtitle}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Language Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowLangDropdown(!showLangDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 text-[#043428] hover:bg-gray-100 rounded-lg transition-colors text-sm"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                    />
                  </svg>
                  <span>{currentLang.toUpperCase()}</span>
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {showLangDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowLangDropdown(false)}
                    />
                    <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-lg shadow-xl overflow-hidden z-50 border border-gray-200">
                      <button
                        onClick={() => {
                          i18n.changeLanguage("en");
                          setShowLangDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-[#043428] hover:bg-gray-100 transition-colors"
                      >
                        English (EN)
                      </button>
                      <button
                        onClick={() => {
                          i18n.changeLanguage("da");
                          setShowLangDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-[#043428] hover:bg-gray-100 transition-colors"
                      >
                        Dansk (DA)
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* User Info with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {/* Profile Circle with Initials */}
                  <div className="w-10 h-10 bg-[#064c3a] text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {getUserInitials()}
                  </div>
                </button>
                <div className="text-left">
                  <p className="text-md font-bold text-[#165933]">
                    {user?.firstName &&
                      user.firstName.charAt(0).toUpperCase() +
                        user.firstName.slice(1).toLowerCase()}
                    {user?.lastName &&
                      user.lastName.charAt(0).toUpperCase() +
                        user.lastName.slice(1).toLowerCase()}
                  </p>
                  <p className="text-xs text-gray-500">{user?.roleName}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 bg-gray-100 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
