import { useState, useEffect } from "react";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  LineElement,
  PointElement,
  Filler,
} from "chart.js";
import { dashboardService } from "../../../services/dashboard.service";
import type {
  ReportQueryRequest,
  DashboardStats,
} from "../../../types/dashboard";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  LineElement,
  PointElement,
  Filler
);

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const statsPayload: ReportQueryRequest = {
        reportType: "GetTotalCountDashBoardReport",
        mode: "string",
        pagination: {
          page: 0,
          pageSize: 0,
          searchTerm: "string",
          sortDirection: "string",
          sortField: "string",
          userId: 0,
          pageNumber: 0,
          rowsPerPage: 0,
        },
        fromDate: new Date().toISOString().split("T")[0],
        toDate: new Date().toISOString().split("T")[0],
        allRecordsRequired: true,
        isExportToExcel: false,
        id: 0,
        userId: "string",
        statusId: "string",
        month: "string",
        courseId: "string",
        testId: "string",
      };

      const statsResponse = await dashboardService.getAllReportsQuery(
        statsPayload
      );

      if (
        statsResponse &&
        statsResponse.reportData &&
        statsResponse.reportData.length > 0
      ) {
        const statsData = statsResponse.reportData[0];
        setStats({
          TotalUsers: statsData.totalUsers || 0,
          TotalPartners: statsData.totalPartners || 0,
          TotalRecommendations: statsData.totalRecommendations || 0,
          TotalCategorys: statsData.totalCategorys || 0,
          TotalSubCategories: statsData.totalSubCategories || 0,
          TotalPartnerPageVisits: statsData.totalPartnerPageVisits || 0,
          TotalFavourites: statsData.totalFavourites || 0,
          TodaysPartners: statsData.todaysPartners || 0,
          TodaysRecommendations: statsData.todaysRecommendations || 0,
          TodaysPartnerPageVisits: statsData.todaysPartnerPageVisits || 0,
          TodaysFavourites: statsData.todaysFavourites || 0,
          TotalFalseSubCategories: statsData.TotalFalseSubCategories || 0,
          TotalFalseCategorys: statsData.TotalFalseCategorys || 0,
        });
      } else {
        setStats({
          TotalUsers: 0,
          TotalPartners: 0,
          TotalSubCategories: 0,
          TotalRecommendations: 0,
          TotalCategorys: 0,
          TotalPartnerPageVisits: 0,
          TotalFavourites: 0,
          TodaysPartners: 0,
          TodaysRecommendations: 0,
          TodaysPartnerPageVisits: 0,
          TodaysFavourites: 0,
          TotalFalseSubCategories: 0,
          TotalFalseCategorys: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatK = (num: number | null) => {
    if (num === null || num === undefined) return "0";
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + "K";
    }
    return num.toString();
  };

  // Prepare dynamic data for dual-layer pie chart using API counts
  const getPieChartData = () => {
    const totalCategories = stats?.TotalCategorys || 0;
    const totalSubCategories = stats?.TotalSubCategories || 0;

    // Calculate ratios (so chart fills proportionally)
    const total = totalCategories + totalSubCategories;
    const categoryPercentage = total > 0 ? (totalCategories / total) * 100 : 0;
    const subCategoryPercentage =
      total > 0 ? (totalSubCategories / total) * 100 : 0;

    return {
      datasets: [
        {
          // Outer Ring - Categories
          data: [categoryPercentage, 100 - categoryPercentage],
          backgroundColor: ["#104A2F", "#E9ECEF"],
          borderWidth: 0,
          cutout: "85%",
          radius: "90%",
          borderRadius: 100,
        },
        {
          // Inner Ring - Subcategories
          data: [subCategoryPercentage, 100 - subCategoryPercentage],
          backgroundColor: ["#95C11F", "#E9ECEF"],
          borderWidth: 0,
          cutout: "80%",
          radius: "70%",
          borderRadius: 80,
        },
      ],
    };
  };

  // Single line bar chart data for total partners and users
  const getBarChartData = () => {
    const totalPartners = stats?.TotalPartners || 0;
    const totalUsers = stats?.TotalUsers || 0;

    // Calculate percentages for visual comparison
    const total = totalPartners + totalUsers;
    const partnersPercentage = total > 0 ? (totalPartners / total) * 100 : 0;
    const usersPercentage = total > 0 ? (totalUsers / total) * 100 : 0;

    return {
      labels: ["Distribution"],
      datasets: [
        {
          label: `Partners (${totalPartners})`,
          data: [partnersPercentage],
          backgroundColor: "#165933",
          borderRadius: 8,
          barPercentage: 0.4,
          categoryPercentage: 0.5,
        },
        {
          label: `Users (${totalUsers})`,
          data: [usersPercentage],
          backgroundColor: "#95C11F",
          borderRadius: 8,
          barPercentage: 0.4,
          categoryPercentage: 0.5,
        },
      ],
    };
  };

  // Chart options for pie chart (not donut) - Exactly like second image
  const pieChartOptions: import("chart.js").ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    animation: {
      animateRotate: true,
      duration: 1500,
      easing: "easeInOutQuart",
    },
    cutout: "70%",
  };

  // Single line bar chart options
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          boxWidth: 8,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const value = context.parsed.y;
            return `${context.dataset.label}: ${value.toFixed(1)}%`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          font: { size: 11 },
          callback: (value: any) => value + "%",
        },
        grid: { color: "#F3F4F6" },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  // Line Chart (User Ratio Analytics)
  const getUserAnalyticsData = () => {
    return {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
      datasets: [
        {
          label: "This year",
          data: [8000, 12000, 15000, 20000, 22000, 18000, 21000],
          borderColor: "#165933",
          backgroundColor: "rgba(22, 89, 51, 0.1)",
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          borderWidth: 2,
        },
        {
          label: "Last year",
          data: [7000, 10000, 9000, 17000, 15000, 20000, 25000],
          borderColor: "#95C11F",
          backgroundColor: "rgba(149, 193, 31, 0.1)",
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          borderDash: [5, 5],
          borderWidth: 2,
        },
      ],
    };
  };

  const lineChartOptions: import("chart.js").ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        align: "start",
        labels: {
          boxWidth: 8,
          usePointStyle: true,
          color: "#374151",
          font: { size: 12 },
          padding: 20,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (tickValue: string | number) {
            if (typeof tickValue === "number") {
              return `${tickValue / 1000}K`;
            }
            return tickValue;
          },
          color: "#6B7280",
        },
        grid: { color: "#F3F4F6" },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#6B7280" },
      },
    },
  };

  // Dual-layer pie data for "Deactivate Categories"
  const getDeactivatedPieChartData = () => {
    return {
      datasets: [
        {
          // Outer Ring
          data: [70, 30],
          backgroundColor: ["#104A2F", "#E9ECEF"],
          borderWidth: 0,
          cutout: "80%",
          radius: "90%",
        },
        {
          // Inner Ring
          data: [50, 50],
          backgroundColor: ["#95C11F", "#E9ECEF"],
          borderWidth: 0,
          cutout: "75%",
          radius: "70%",
        },
      ],
    };
  };

  const deactivatePieOptions: import("chart.js").ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  const statsData = [
    { title: "Total Users", value: formatK(stats?.TotalUsers || 0) },
    {
      title: "Total Sub Categories",
      value: formatK(stats?.TotalSubCategories || 0),
    },
    { title: "Categories", value: formatK(stats?.TotalCategorys || 0) },
    { title: "Favourites", value: formatK(stats?.TotalFavourites || 0) },
    {
      title: "Page Visits",
      value: formatK(stats?.TotalPartnerPageVisits || 0),
    },
    { title: "Today's Partners", value: formatK(stats?.TodaysPartners || 0) },
    {
      title: "Recommendations",
      value: formatK(stats?.TotalRecommendations || 0),
    },
  ];

  const barData = getBarChartData();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Single Horizontal Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-nowrap overflow-x-auto justify-between items-center">
          {statsData.map((stat, index) => (
            <div key={stat.title} className="flex items-center">
              <div className="flex flex-col items-center text-center px-3 min-w-[100px]">
                <div className="text-lg font-semibold text-[#232D42] mb-1">
                  {stat.value}
                </div>
                <div className="text-xs font-medium text-[#8A92A6] whitespace-nowrap">
                  {stat.title}
                </div>
              </div>

              {index < statsData.length - 1 && (
                <div className="h-8 w-px bg-gray-300 mx-1"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout for Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Categories & Subcategories Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Categories & Subcategories
            </h3>
          </div>

          <div className="flex items-center justify-between">
            {/* Pie Chart - Left side - Exactly like second image */}
            <div className="flex-shrink-0">
              <div className="relative" style={{ width: 220, height: 220 }}>
                <Doughnut data={getPieChartData()} options={pieChartOptions} />
              </div>
            </div>

            {/* Stats Section - Right side */}
            <div className="flex-1 ml-6">
              <div className="space-y-6">
                {/* Categories Row */}
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-4 h-4 rounded-full mr-2 bg-[#165933]"></div>
                    <span className="text-gray-700 font-medium text-sm">
                      Categories
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatK(stats?.TotalCategorys || 0)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Total Categories
                  </div>
                </div>

                {/* Sub Categories Row */}
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-4 h-4 rounded-full mr-2 bg-[#95C11F]"></div>
                    <span className="text-gray-700 font-medium text-sm">
                      Sub Categories
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatK(stats?.TotalSubCategories || 0)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Total Subcategories
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Single Line Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Partners & Users
            </h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Total Distribution
            </span>
          </div>

          <div className="h-48">
            <Bar data={barData} options={barChartOptions} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-[#165933]">
                {formatK(stats?.TotalPartners || 0)}
              </div>
              <div className="text-sm text-[#8A92A6]">Total Partners</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#95C11F]">
                {formatK(stats?.TotalUsers || 0)}
              </div>
              <div className="text-sm text-[#8A92A6]">Total Users</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Left Column - User Ratio Analytics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Total User
              </h3>
              <div className="flex space-x-4 text-sm text-gray-500">
                <span className="text-[#165933] font-medium">● This year</span>
                <span className="text-[#95C11F] font-medium">● Last year</span>
              </div>
            </div>
          </div>

          <div className="h-64">
            <Line data={getUserAnalyticsData()} options={lineChartOptions} />
          </div>
        </div>

        {/* Right Column - Deactivate Categories */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Deactivate Categories
            </h3>
            <span className="text-sm text-gray-500">This Week ▾</span>
          </div>

          <div className="flex items-center justify-between">
            {/* Left Pie Chart */}
            <div className="relative" style={{ width: 160, height: 160 }}>
              <Doughnut
                data={getDeactivatedPieChartData()}
                options={deactivatePieOptions}
              />
            </div>

            {/* Right Stats */}
            <div className="ml-6 space-y-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#104A2F] mr-2"></div>
                <span className="text-sm text-gray-700 font-medium mr-2">
                  English
                </span>
                <span className="text-sm text-gray-500 font-semibold">
                  251K
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#95C11F] mr-2"></div>
                <span className="text-sm text-gray-700 font-medium mr-2">
                  French
                </span>
                <span className="text-sm text-gray-500 font-semibold">
                  176K
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#B3D76D] mr-2"></div>
                <span className="text-sm text-gray-700 font-medium mr-2">
                  Accessories
                </span>
                <span className="text-sm text-gray-500 font-semibold">
                  176K
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
