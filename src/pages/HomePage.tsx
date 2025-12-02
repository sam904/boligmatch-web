// src/pages/HomePage.tsx
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../app/hooks";

export default function HomePage() {
  const { t } = useTranslation();
  const user = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.accessToken);

  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-brand-light">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <div className="mb-8 inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-brand-gradient">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
          <h1
            className="text-6xl font-extrabold text-gray-900 mb-6 bg-clip-text"
            style={{
              backgroundImage:
                "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {t("home.welcomeTo")}
          </h1>
          <p className="text-2xl text-gray-600 mb-12 max-w-2xl mx-auto">
            {t("auth.pleaseLogin")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              to="/"
              className="inline-flex items-center px-8 py-4 text-white text-lg font-semibold rounded-xl hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 hover:opacity-90 bg-brand-gradient"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              {t("home.goToLogin")}
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 mx-auto"
                style={{ backgroundColor: "var(--color-primary-light)" }}
              >
                <svg
                  className="w-8 h-8"
                  style={{ color: "var(--color-primary)" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t("home.easyManagement")}
              </h3>
              <p className="text-gray-600">{t("home.easyManagementDesc")}</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 mx-auto"
                style={{ backgroundColor: "var(--color-secondary-light)" }}
              >
                <svg
                  className="w-8 h-8"
                  style={{ color: "var(--color-secondary)" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t("home.secureAccess")}
              </h3>
              <p className="text-gray-600">{t("home.secureAccessDesc")}</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 mx-auto"
                style={{ backgroundColor: "var(--color-primary-light)" }}
              >
                <svg
                  className="w-8 h-8"
                  style={{ color: "var(--color-primary)" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t("home.multiLanguage")}
              </h3>
              <p className="text-gray-600">{t("home.multiLanguageDesc")}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-brand-light py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-brand-gradient">
              <span className="text-2xl font-bold text-white">
                {user?.firstName?.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                {t("home.welcomeUser", { name: user?.firstName })}
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                {t("home.loggedInAs", { role: user?.roleName })}
              </p>
            </div>
          </div>

          {user?.roleName.toLowerCase() === "admin" && (
            <div className="rounded-2xl p-8 text-white bg-brand-gradient">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-3">
                    {t("home.adminDashboard")}
                  </h2>
                  <p className="text-white opacity-90 mb-6 max-w-2xl">
                    {t("home.adminDashboardDesc")}
                  </p>
                  <Link
                    to="/admin"
                    className="inline-flex items-center px-6 py-3 bg-white font-semibold rounded-xl hover:opacity-90 transition-all"
                    style={{ color: "var(--color-primary)" }}
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                    {t("home.goToAdmin")}
                  </Link>
                </div>
                <div className="hidden md:block">
                  <svg
                    className="w-32 h-32 text-white opacity-30"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {user?.roleName.toLowerCase() !== "admin" && (
            <div className="rounded-2xl p-8 text-white bg-brand-gradient">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-3">
                    {t("home.partnerDashboard")}
                  </h2>
                  <p className="text-white opacity-90 max-w-2xl">
                    {t("home.partnerDashboardDesc")}
                  </p>
                </div>
                <div className="hidden md:block">
                  <svg
                    className="w-32 h-32 text-white opacity-30"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                    <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="bg-gray-50 rounded-xl p-6">
              <div
                className="text-3xl font-bold mb-2"
                style={{ color: "var(--color-primary)" }}
              >
                24/7
              </div>
              <p className="text-gray-600">Access anytime</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <div
                className="text-3xl font-bold mb-2"
                style={{ color: "var(--color-secondary)" }}
              >
                100%
              </div>
              <p className="text-gray-600">Secure platform</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <div
                className="text-3xl font-bold mb-2"
                style={{ color: "var(--color-primary)" }}
              >
                Fast
              </div>
              <p className="text-gray-600">Lightning speed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
