// src/components/layout/AdminLayout.tsx
import { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { logout } from "../../features/auth/authSlice";
import UpdateProfileModal from "../common/UpdateProfileModal";
import ResetPasswordModal from "../common/ResetPasswordModal";
import {
  IconDashboard,
  IconCategories,
  IconSubcategories,
  IconPartners,
  IconUsers,
  IconLanguage,
  IconChevronDown,
  IconMenu,
  IconCollapse,
  IconExpand,
  IconLogout,
  IconKey,
  IconProfile,
} from "../common/Icons/Index";
import AdminToast from "../common/AdminToast";
import type { AdminToastType } from "../common/AdminToast";
import ScrollToTop from "../common/ScrollToTop";

// Enhanced route mapping with titles and subtitles
interface RouteInfo {
  title: string;
  subtitle?: string;
}

interface ToastState {
  id: string;
  type: AdminToastType;
  message: string;
  title?: string;
  subtitle?: string;
  open: boolean;
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
  // ADD TESTIMONIAL ROUTES
  "/admin/testimonial": {
    title: "admin.testimonials.title",
    subtitle: "admin.testimonials.subtitle",
  },
  "/admin/testimonials": {
    title: "admin.testimonials.title",
    subtitle: "admin.testimonials.subtitle",
  },
};

export default function AdminLayout() {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] =
    useState(false);
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Detect mobile screen size and set initial collapse state
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      // Auto-collapse sidebar on mobile, keep open on desktop
      if (mobile) {
        setIsCollapsed(true);
        setSidebarVisible(false); // Hide sidebar by default on mobile
      } else {
        setIsCollapsed(false);
        setSidebarVisible(true); // Show sidebar by default on desktop
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowLangDropdown(false);
      setShowUserDropdown(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Get current page info based on route
  const getCurrentPageInfo = (): RouteInfo => {
    const currentPath = location.pathname;

    // Handle testimonial routes specifically
    if (currentPath.startsWith("/admin/testimonial")) {
      return {
        title: "admin.testimonials.title",
        subtitle: "admin.testimonials.subtitle",
      };
    }

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

  // Toast management functions
  const showToast = (
    type: AdminToastType,
    message: string,
    title?: string,
    subtitle?: string
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastState = {
      id,
      type,
      message,
      title,
      subtitle,
      open: true,
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  };

  const hideToast = (id: string) => {
    setToasts((prev) =>
      prev.map((toast) => (toast.id === id ? { ...toast, open: false } : toast))
    );

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 300);
  };

  const toast = {
    success: (message: string, title?: string, subtitle?: string) =>
      showToast("success", message, title, subtitle),
    error: (message: string, title?: string, subtitle?: string) =>
      showToast("error", message, title, subtitle),
    info: (message: string, title?: string, subtitle?: string) =>
      showToast("info", message, title, subtitle),
  };

  const handleLogout = () => {
    dispatch(logout());
    setShowUserDropdown(false);
  };

  const handleUpdateProfile = () => {
    setIsProfileModalOpen(true);
    setShowUserDropdown(false);
  };

  const handleResetPassword = () => {
    setIsResetPasswordModalOpen(true);
    setShowUserDropdown(false);
  };

  const handleProfileUpdateSuccess = () => {
    toast.success(
      t("admin.users.updateSuccess") || "Users updated successfully"
    );
  };

  const handlePasswordResetSuccess = () => {
    toast.success("Password reset successfully");
  };

  // Toggle sidebar with mobile consideration
  const toggleSidebar = () => {
    if (isMobile) {
      // On mobile, toggle visibility completely
      setSidebarVisible(!sidebarVisible);
      setIsCollapsed(!sidebarVisible);
    } else {
      // On desktop, toggle between collapsed and expanded
      setIsCollapsed(!isCollapsed);
      setSidebarVisible(true); // Always visible on desktop
    }
  };

  // Prevent dropdown close when clicking inside
  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const currentPageInfo = getCurrentPageInfo();
  const currentPageTitle = t(currentPageInfo.title);
  const currentPageSubtitle = currentPageInfo.subtitle
    ? t(currentPageInfo.subtitle)
    : "";
  const currentLang = i18n.language || "en";

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 p-3 transition-all duration-200 text-sm relative cursor-pointer ${
      isActive
        ? "text-white bg-white/10 shadow-inner backdrop-blur-sm border-l-4 border-[#95C11F]"
        : "text-gray-200 hover:bg-white/5 hover:text-white border-l-4 border-transparent"
    } ${isCollapsed ? "justify-center" : ""}`;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <ScrollToTop />
      {/* Render Toast Banners */}
      {toasts.map((toastItem) => (
        <AdminToast
          key={toastItem.id}
          type={toastItem.type}
          message={toastItem.message}
          onClose={() => hideToast(toastItem.id)}
          autoDismissMs={5000}
        />
      ))}

      {/* Update Profile Modal */}
      <UpdateProfileModal
        open={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSuccess={handleProfileUpdateSuccess}
      />

      {/* Reset Password Modal */}
      <ResetPasswordModal
        open={isResetPasswordModalOpen}
        onClose={() => setIsResetPasswordModalOpen(false)}
        onSuccess={handlePasswordResetSuccess}
      />

      {/* Sidebar */}
      {sidebarVisible && (
        <aside
          className={`flex-shrink-0 bg-[#01351f] text-white shadow-xl transition-all duration-300 ${
            isCollapsed ? "w-16" : "w-64"
          } flex flex-col ${
            isMobile ? "fixed inset-y-0 left-0 z-50" : "relative"
          }`}
        >
          <div className="p-4 flex items-center">
            {!isCollapsed && (
              <img
                src="/logo.svg"
                alt="BoligMatch"
                className="h-10 ml-4 cursor-pointer"
              />
            )}
            <button
              onClick={toggleSidebar}
              className="p-2 text-gray-200 hover:bg-white/5 hover:text-white rounded-lg transition-colors ml-auto cursor-pointer"
            >
              {isCollapsed ? (
                <IconCollapse className="w-4 h-4" />
              ) : (
                <IconExpand className="w-4 h-4" />
              )}
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto">
            <NavLink
              to="/admin/dashboard"
              className={navLinkClass}
              title={isCollapsed ? t("nav.dashboard") : ""}
            >
              <IconDashboard className="w-5 h-5 flex-shrink-0 mx-2" />
              {!isCollapsed && (
                <span className="ml-2">{t("nav.dashboard")}</span>
              )}
            </NavLink>

            <NavLink
              to="/admin/categories"
              className={navLinkClass}
              title={isCollapsed ? t("nav.categories") : ""}
            >
              <IconCategories className="w-5 h-5 flex-shrink-0 mx-2" />
              {!isCollapsed && (
                <span className="ml-2">{t("nav.categories")}</span>
              )}
            </NavLink>

            <NavLink
              to="/admin/subcategories"
              className={navLinkClass}
              title={isCollapsed ? t("nav.subcategories") : ""}
            >
              <IconSubcategories className="w-5 h-5 flex-shrink-0 mx-2" />
              {!isCollapsed && (
                <span className="ml-2">{t("nav.subcategories")}</span>
              )}
            </NavLink>

            <NavLink
              to="/admin/partners"
              className={navLinkClass}
              title={isCollapsed ? t("nav.partners") : ""}
            >
              <IconPartners className="w-5 h-5 flex-shrink-0 mx-2" />
              {!isCollapsed && (
                <span className="ml-2">{t("nav.partners")}</span>
              )}
            </NavLink>

            <NavLink
              to="/admin/users"
              className={navLinkClass}
              title={isCollapsed ? t("nav.users") : ""}
            >
              <IconUsers className="w-5 h-5 flex-shrink-0 mx-2" />
              {!isCollapsed && <span className="ml-2">{t("nav.users")}</span>}
            </NavLink>
          </nav>
        </aside>
      )}

      {/* Mobile overlay when sidebar is open */}
      {isMobile && sidebarVisible && (
        <div
          className="fixed inset-0 bg-opacity-50 z-40 lg:hidden"
          onClick={() => {
            setSidebarVisible(false);
            setIsCollapsed(true);
          }}
        />
      )}

      {/* Right Side: Header + Content */}
      <div
        className={`flex-1 flex flex-col overflow-hidden min-w-0 ${
          !sidebarVisible && isMobile ? "ml-0" : ""
        }`}
      >
        {/* Header */}
        <header className="flex-shrink-0 bg-white text-[#043428] shadow-sm border-b border-gray-300">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              {/* Mobile menu button - Always show on mobile when sidebar is hidden */}
              {isMobile && (
                <button
                  onClick={toggleSidebar}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer lg:hidden"
                >
                  <IconMenu className="w-5 h-5" />
                </button>
              )}

              {/* Dynamic page title and subtitle */}
              <div className="max-w-xs sm:max-w-none">
                <h1 className="text-lg sm:text-xl font-bold text-black truncate">
                  {currentPageTitle}
                </h1>
                {currentPageSubtitle && (
                  <p className="text-gray-500 text-xs sm:text-sm mt-1 truncate">
                    {currentPageSubtitle}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Language Dropdown */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowLangDropdown(!showLangDropdown);
                    setShowUserDropdown(false);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-[#043428] hover:bg-gray-100 rounded-lg transition-colors text-sm cursor-pointer"
                >
                  <IconLanguage className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {currentLang.toUpperCase()}
                  </span>
                  <IconChevronDown
                    className={`w-3 h-3 transition-transform cursor-pointer flex-shrink-0 ${
                      showLangDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {showLangDropdown && (
                  <div
                    className="absolute top-full right-0 mt-2 w-40 bg-white rounded-lg shadow-xl overflow-hidden z-50 border border-gray-200"
                    onClick={handleDropdownClick}
                  >
                    <button
                      onClick={() => {
                        i18n.changeLanguage("en");
                        setShowLangDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-[#043428] hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      English (EN)
                    </button>
                    <button
                      onClick={() => {
                        i18n.changeLanguage("da");
                        setShowLangDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-[#043428] hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      Dansk (DA)
                    </button>
                  </div>
                )}
              </div>

              {/* User Info with Dropdown */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUserDropdown(!showUserDropdown);
                    setShowLangDropdown(false);
                  }}
                  className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  {/* Profile Circle with Initials */}
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#064c3a] text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold cursor-pointer">
                    {getUserInitials()}
                  </div>

                  {/* User info - hidden on mobile */}
                  <div className="hidden sm:block text-left">
                    <p className="text-md font-bold text-[#165933] truncate max-w-24">
                      {user?.firstName &&
                        user.firstName.charAt(0).toUpperCase() +
                          user.firstName.slice(1).toLowerCase()}
                      {user?.lastName &&
                        user.lastName.charAt(0).toUpperCase() +
                          user.lastName.slice(1).toLowerCase()}
                    </p>
                    <p className="text-xs text-gray-500">{user?.roleName}</p>
                  </div>

                  {/* Dropdown arrow */}
                  <IconChevronDown
                    className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-500 transition-transform cursor-pointer flex-shrink-0 ${
                      showUserDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* User Dropdown Menu */}
                {showUserDropdown && (
                  <div
                    className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl overflow-hidden z-50 border border-gray-200"
                    onClick={handleDropdownClick}
                  >
                    <button
                      onClick={handleUpdateProfile}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100 cursor-pointer"
                    >
                      <IconProfile className="w-4 h-4" />
                      <span>{t("auth.profile")}</span>
                    </button>

                    <button
                      onClick={handleResetPassword}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100 cursor-pointer"
                    >
                      <IconKey className="w-4 h-4" />
                      <span>{t("auth.resetPassword")}</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                    >
                      <IconLogout />
                      <span>{t("auth.logout")}</span>
                    </button>
                  </div>
                )}
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
