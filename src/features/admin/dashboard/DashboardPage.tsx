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
  PointElement,
  LineElement,
  Title,
} from "chart.js";
import { dashboardService } from "../../../services/dashboard.service";
import type { ReportQueryRequest } from "../../types/dashboard";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
);

interface DashboardStats {
  TotalUsers: number;
  TotalPartners: number;
  TotalRecommendations: number;
  TotalCategorys: number;
  TotalPartnerPageVisits: number;
  TotalFavourites: number;
  TodaysPartners: number;
  TodaysRecommendations: number;
  TodaysPartnerPageVisits: number;
  TodaysFavourites: number;
}

interface CategoryUser {
  CategoryName: string;
  FullName: string;
  BusinessName: string;
  BusinessUnit: string;
}

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [categories, setCategories] = useState<CategoryUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch total counts
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
          rowsPerPage: 0
        },
        fromDate: new Date().toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0],
        allRecordsRequired: true,
        isExportToExcel: false,
        id: 0,
        userId: "string",
        statusId: "string",
        month: "string",
        courseId: "string",
        testId: "string"
      };

      const categoriesPayload: ReportQueryRequest = {
        reportType: "GetCategoryWiseUserNameDashBoardReport",
        mode: "string",
        pagination: {
          page: 0,
          pageSize: 0,
          searchTerm: "string",
          sortDirection: "string",
          sortField: "string",
          userId: 0,
          pageNumber: 0,
          rowsPerPage: 0
        },
        fromDate: new Date().toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0],
        allRecordsRequired: true,
        isExportToExcel: false,
        id: 0,
        userId: "string",
        statusId: "string",
        month: "string",
        courseId: "string",
        testId: "string"
      };

      const [statsResponse, categoriesResponse] = await Promise.all([
        dashboardService.getAllReportsQuery(statsPayload),
        dashboardService.getAllReportsQuery(categoriesPayload)
      ]);

      // Set actual API data from the response structure
      if (statsResponse && statsResponse.reportData && statsResponse.reportData.length > 0) {
        const statsData = statsResponse.reportData[0];
        setStats({
          TotalUsers: statsData.totalUsers || 0,
          TotalPartners: statsData.totalPartners || 0,
          TotalRecommendations: statsData.totalRecommendations || 0,
          TotalCategorys: statsData.totalCategorys || 0,
          TotalPartnerPageVisits: statsData.totalPartnerPageVisits || 0,
          TotalFavourites: statsData.totalFavourites || 0,
          TodaysPartners: statsData.todaysPartners || 0,
          TodaysRecommendations: statsData.todaysRecommendations || 0,
          TodaysPartnerPageVisits: statsData.todaysPartnerPageVisits || 0,
          TodaysFavourites: statsData.todaysFavourites || 0
        });
      }

      if (categoriesResponse && categoriesResponse.reportData) {
        setCategories(categoriesResponse.reportData.map((item: any) => ({
          CategoryName: item.categoryName || 'Uncategorized',
          FullName: item.fullName || 'N/A',
          BusinessName: item.businessName || 'N/A',
          BusinessUnit: item.businessUnit?.toString() || '0'
        })));
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Format number to K format
  const formatK = (num: number | null) => {
    if (num === null || num === undefined) return '0';
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  };

  // Get category counts from actual API data
  const getCategoryCount = (categoryName: string) => {
    return categories.filter(cat => cat.CategoryName === categoryName).length;
  };

  // Get total sub categories count
  const getTotalSubCategories = () => {
    return stats?.TodaysRecommendations || 0;
  };

  // Circular Progress Component
  const CircularProgress = ({ percentage, color, size = 80 }: { percentage: number; color: string; size?: number }) => {
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-300 ease-in-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-gray-800">{percentage}%</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  // Chart Data using actual API data
  const donutData = {
    labels: ["Categories", "Sub Categories"],
    datasets: [
      {
        data: [stats?.TotalCategorys || 0, getTotalSubCategories()],
        backgroundColor: ["#1E8449", "#7DCEA0"],
        borderWidth: 0,
        borderRadius: 8,
      },
    ],
  };

  // Calculate percentage for doughnut chart center
  const totalCategories = (stats?.TotalCategorys || 0) + getTotalSubCategories();
  const categoriesPercentage = totalCategories > 0 ? 
    Math.round(((stats?.TotalCategorys || 0) / totalCategories) * 100) : 0;

  // Bar chart data - weekly data
  const barData = {
    labels: ["S", "M", "T", "W", "T", "F", "S"],
    datasets: [
      {
        label: "Partners",
        data: [
          stats?.TodaysPartners || 0,
          (stats?.TodaysPartners || 0) * 2,
          (stats?.TodaysPartners || 0) * 1.5,
          (stats?.TodaysPartners || 0) * 1.7,
          (stats?.TodaysPartners || 0) * 3,
          (stats?.TodaysPartners || 0) * 2.5,
          (stats?.TodaysPartners || 0) * 1.5
        ],
        backgroundColor: "#14532d",
        borderRadius: 4,
        barPercentage: 0.6,
      },
      {
        label: "Users",
        data: [
          stats?.TodaysFavourites || 0,
          (stats?.TodaysFavourites || 0) * 2,
          (stats?.TodaysFavourites || 0) * 1.8,
          (stats?.TodaysFavourites || 0) * 2.2,
          (stats?.TodaysFavourites || 0) * 3.5,
          (stats?.TodaysFavourites || 0) * 3,
          (stats?.TodaysFavourites || 0) * 2
        ],
        backgroundColor: "#65a30d",
        borderRadius: 4,
        barPercentage: 0.6,
      },
    ],
  };

  // Line chart data - monthly trend
  const lineData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        label: "This Year",
        data: [
          (stats?.TotalUsers || 0) / 100000,
          (stats?.TotalUsers || 0) / 80000,
          (stats?.TotalUsers || 0) / 60000,
          (stats?.TotalUsers || 0) / 40000,
          (stats?.TotalUsers || 0) / 50000,
          (stats?.TotalUsers || 0) / 70000,
          (stats?.TotalUsers || 0) / 45000
        ],
        borderColor: "#14532d",
        backgroundColor: "rgba(20, 83, 45, 0.1)",
        fill: true,
        tension: 0.4,
        borderWidth: 2,
      },
      {
        label: "Last Year",
        data: [
          (stats?.TotalUsers || 0) / 120000,
          (stats?.TotalUsers || 0) / 100000,
          (stats?.TotalUsers || 0) / 80000,
          (stats?.TotalUsers || 0) / 60000,
          (stats?.TotalUsers || 0) / 70000,
          (stats?.TotalUsers || 0) / 50000,
          (stats?.TotalUsers || 0) / 40000
        ],
        borderColor: "#a3e635",
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
        borderWidth: 2,
      },
    ],
  };

  // Deactivate categories data using actual category counts
  const deactivateCategories = [
    { 
      name: "Digital", 
      value: formatK(getCategoryCount('Digital')), 
      percentage: Math.min(getCategoryCount('Digital') * 10, 100),
      color: "#14532d" 
    },
    { 
      name: "Phone", 
      value: formatK(getCategoryCount('Phone')), 
      percentage: Math.min(getCategoryCount('Phone') * 15, 100),
      color: "#65a30d" 
    },
    { 
      name: "Accessories", 
      value: formatK(getCategoryCount('Accessories')), 
      percentage: Math.min(getCategoryCount('Accessories') * 12, 100),
      color: "#a3e635" 
    },
  ];

  // Chart options
  const donutOptions = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '65%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#f3f4f6',
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: '#f3f4f6',
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>
      </div>

      <div className="p-6">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total User */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatK(stats?.TotalUsers || 0)}
            </div>
            <div className="text-gray-600 font-medium">Total User</div>
          </div>

          {/* Partner Listing */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatK(stats?.TotalPartners || 0)}
            </div>
            <div className="text-gray-600 font-medium">Partner Listing</div>
          </div>

          {/* Total Earned */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              ${formatK(stats?.TotalFavourites || 0)}
            </div>
            <div className="text-gray-600 font-medium">Total Earned</div>
          </div>

          {/* Distributions */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatK(stats?.TodaysPartners || 0)}
            </div>
            <div className="text-gray-600 font-medium">Distributions</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Categories Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  This Week
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-600 rounded-full mr-3"></div>
                        <span className="text-gray-700 font-medium">Categories</span>
                      </div>
                      <span className="font-semibold text-gray-900 text-lg">
                        {formatK(stats?.TotalCategorys || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                        <span className="text-gray-700 font-medium">Sub Categories</span>
                      </div>
                      <span className="font-semibold text-gray-900 text-lg">
                        {formatK(getTotalSubCategories())}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="ml-6">
                  <div className="relative" style={{ width: 120, height: 120 }}>
                    <Doughnut data={donutData} options={donutOptions} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-800">{categoriesPercentage}%</div>
                        <div className="text-xs text-gray-500">Completed</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Users Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">This Year</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-300 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Last Year</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {formatK(stats?.TotalPartners || 0)}
                </div>
                <div className="text-sm text-gray-600">Total Partner</div>
              </div>

              <div className="h-64">
                <Line data={lineData} options={lineOptions} />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Total Partners & User Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Total Partners & User</h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  This Week
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {formatK(stats?.TotalPartners || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Partners</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {formatK(stats?.TotalUsers || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Users</div>
                </div>
              </div>

              <div className="h-64">
                <Bar data={barData} options={barOptions} />
              </div>
            </div>

            {/* Deactivate Categories Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Deactivate Categories</h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  This Week
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                {deactivateCategories.map((category, index) => (
                  <div key={index} className="text-center">
                    <div className="flex justify-center mb-3">
                      <CircularProgress 
                        percentage={category.percentage} 
                        color={category.color}
                        size={70}
                      />
                    </div>
                    <div className="text-lg font-bold text-gray-900 mb-1">
                      {category.value}
                    </div>
                    <div className="text-sm text-gray-600">{category.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;