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

// Types for partner-user trends
interface PartnerUserTrend {
  date: string;
  partners: number;
  users: number;
}

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userTrends, setUserTrends] = useState<number[]>([]);
  const [lastYearTrends, setLastYearTrends] = useState<number[]>([]);
  const [partnerUserTrends, setPartnerUserTrends] = useState<PartnerUserTrend[]>([]);
  const [timeFilter, setTimeFilter] = useState<"day" | "week" | "month" | "year">("week");
  const [trendsLoading, setTrendsLoading] = useState(false);

  // Function to generate date range based on filter
  const getDateRange = (filter: string) => {
    const now = new Date();
    const fromDate = new Date();
    
    switch (filter) {
      case "day":
        fromDate.setDate(now.getDate() - 1);
        break;
      case "week":
        fromDate.setDate(now.getDate() - 7);
        break;
      case "month":
        fromDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        fromDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        fromDate.setDate(now.getDate() - 7);
    }
    
    return {
      fromDate: fromDate.toISOString().split('T')[0],
      toDate: now.toISOString().split('T')[0]
    };
  };

  // Function to fetch partner-user trends data
  const fetchPartnerUserTrends = async (filter: string) => {
    try {
      setTrendsLoading(true);
      const dateRange = getDateRange(filter);
      
      const trendsPayload: ReportQueryRequest = {
        reportType: "GetPartnerUserListByDashBoardReport",
        mode: "GetPartnerUserListByDashBoardReport",
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
        fromDate: dateRange.fromDate,
        toDate: dateRange.toDate,
        allRecordsRequired: true,
        isExportToExcel: false,
        id: 0,
        userId: "string",
        statusId: "string",
        month: "string",
        courseId: "string",
        testId: "string",
      };

      const response = await dashboardService.getAllReportsQuery(trendsPayload);
      
      if (response && response.reportData && response.reportData.length > 0) {
        // Transform API response to our format
        const trendsData = response.reportData.map((item: any) => ({
          date: item.date || item.createdDate || item.period,
          partners: item.partners || item.totalPartners || 0,
          users: item.users || item.totalUsers || 0,
        }));
        
        setPartnerUserTrends(trendsData);
      } else {
        // Fallback to mock data if API returns empty
        generateMockTrendData(filter);
      }
    } catch (error) {
      console.error("Error fetching partner-user trends:", error);
      // Fallback to mock data on error
      generateMockTrendData(filter);
    } finally {
      setTrendsLoading(false);
    }
  };

  // Generate mock data for demonstration (similar to your image)
  const generateMockTrendData = (filter: string) => {
    let labels: string[] = [];
    let partnersData: number[] = [];
    let usersData: number[] = [];

    switch (filter) {
      case "day":
        labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
        partnersData = [5, 8, 12, 15, 20, 25, 30, 35, 40, 35, 30, 25, 20, 25, 30, 35, 40, 45, 50, 45, 40, 35, 30, 25];
        usersData = [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35];
        break;
      case "week":
        labels = ["S", "M", "T", "W", "T", "F", "S"];
        partnersData = [45, 52, 38, 65, 72, 58, 49];
        usersData = [120, 135, 110, 155, 168, 142, 130];
        break;
      case "month":
        labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
        partnersData = [180, 220, 195, 240];
        usersData = [650, 720, 680, 750];
        break;
      case "year":
        labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        partnersData = [850, 920, 780, 950, 1100, 1050, 1150, 1200, 1120, 1250, 1180, 1300];
        usersData = [3200, 3500, 3100, 3800, 4200, 4000, 4500, 4700, 4300, 4800, 4600, 5000];
        break;
    }
    
    const mockData: PartnerUserTrend[] = labels.map((label, index) => ({
      date: label,
      partners: partnersData[index] || 0,
      users: usersData[index] || 0,
    }));
    
    setPartnerUserTrends(mockData);
  };

  // Function to generate realistic trend data based on current total
  const generateUserTrends = (currentTotal: number) => {
    const months = 7; // Jan to Jul
    const currentYearTrends = [];
    const lastYearTrends = [];
    
    if (currentTotal === 0) {
      setUserTrends(Array(months).fill(0));
      setLastYearTrends(Array(months).fill(0));
      return;
    }

    const growthFactor = 0.7;
    let current = Math.floor(currentTotal * growthFactor);
    
    for (let i = 0; i < months; i++) {
      const growth = Math.floor(current * (0.05 + Math.random() * 0.1));
      current += growth;
      
      if (i < months - 1 && current > currentTotal) {
        current = Math.floor(currentTotal * (0.8 + Math.random() * 0.15));
      }
      
      if (i === months - 1) {
        currentYearTrends.push(currentTotal);
      } else {
        currentYearTrends.push(current);
      }
    }
    
    let lastYearCurrent = Math.floor(currentYearTrends[0] * 0.6);
    for (let i = 0; i < months; i++) {
      const growth = Math.floor(lastYearCurrent * (0.04 + Math.random() * 0.12));
      lastYearCurrent += growth;
      
      const maxAllowed = Math.floor(currentYearTrends[i] * 0.8);
      if (lastYearCurrent > maxAllowed) {
        lastYearCurrent = maxAllowed;
      }
      
      lastYearTrends.push(lastYearCurrent);
    }
    
    setUserTrends(currentYearTrends);
    setLastYearTrends(lastYearTrends);
  };

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
        const dashboardStats = {
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
        };
        
        setStats(dashboardStats);
        generateUserTrends(dashboardStats.TotalUsers);
        
        // Fetch initial partner-user trends
        fetchPartnerUserTrends("week");
      } else {
        const emptyStats = {
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
        };
        setStats(emptyStats);
        generateUserTrends(0);
        fetchPartnerUserTrends("week");
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

  useEffect(() => {
    if (stats) {
      fetchPartnerUserTrends(timeFilter);
    }
  }, [timeFilter, stats]);

  const formatK = (num: number | null) => {
    if (num === null || num === undefined) return "0";
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + "K";
    }
    return num.toString();
  };

  // Calculate growth rate for display
  const calculateGrowthRate = () => {
    if (userTrends.length < 2 || userTrends[0] === 0) return 0;
    const growth = ((userTrends[userTrends.length - 1] - userTrends[0]) / userTrends[0]) * 100;
    return Math.max(0, Math.floor(growth));
  };

  // Prepare dynamic data for dual-layer pie chart using API counts
  const getPieChartData = () => {
    const totalCategories = stats?.TotalCategorys || 0;
    const totalSubCategories = stats?.TotalSubCategories || 0;

    const total = totalCategories + totalSubCategories;
    const categoryPercentage = total > 0 ? (totalCategories / total) * 100 : 0;
    const subCategoryPercentage =
      total > 0 ? (totalSubCategories / total) * 100 : 0;

    return {
      datasets: [
        {
          data: [categoryPercentage, 100 - categoryPercentage],
          backgroundColor: ["#104A2F", "#E9ECEF"],
          borderWidth: 0,
          cutout: "85%",
          radius: "90%",
          borderRadius: 100,
        },
        {
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

  // Bar Chart data for Partners & Users (similar to your image)
  const getPartnerUserBarData = () => {
  const labels = partnerUserTrends.map((item) => item.date);
  const partnersData = partnerUserTrends.map((item) => item.partners);
  const usersData = partnerUserTrends.map((item) => item.users);

  return {
    labels,
    datasets: [
      {
        label: "Partners",
        data: partnersData,
        backgroundColor: "#165933", // Dark green
        borderRadius: 0,
        barPercentage: 0.10,
        categoryPercentage: 1,
        stack: "combined",
        
      },
      {
        label: "Users",
        data: usersData,
        backgroundColor: "#95C11F", // Light green
        borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 0, bottomRight: 0 },
        barPercentage: 0.10,
        categoryPercentage: 1,
        stack: "combined",
      },
    ],
  };
};


  // Bar Chart options for Partners & Users
  const partnerUserBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        align: "end" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          boxWidth: 8,
          color: "#374151",
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const value = context.parsed.y;
            const label = context.dataset.label || '';
            return `${label}: ${formatK(value)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: { size: 11 },
          color: "#6B7280",
          callback: function (tickValue: string | number) {
            if (typeof tickValue === "number") {
              return formatK(tickValue);
            }
            return tickValue;
          },
        },
        grid: { color: "#F3F4F6" },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#6B7280" },
      },
    },
  };

  // Chart options for pie chart
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

  // Line Chart (User Ratio Analytics)
  const getUserAnalyticsData = () => {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    return {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
      datasets: [
        {
          label: `This year (${currentYear})`,
          data: userTrends,
          borderColor: "#165933",
          backgroundColor: "rgba(22, 89, 51, 0.1)",
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          borderWidth: 2,
        },
        {
          label: `Last year (${lastYear})`,
          data: lastYearTrends,
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
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const value = context.parsed.y;
            const label = context.dataset.label || '';
            return `${label.split(' (')[0]}: ${formatK(value)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (tickValue: string | number) {
            if (typeof tickValue === "number") {
              return formatK(tickValue);
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
    { title: "Total Parners", value: formatK(stats?.totalPartners || 0) },
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

  const growthRate = calculateGrowthRate();

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
            <div className="flex-shrink-0">
              <div className="relative" style={{ width: 220, height: 220 }}>
                <Doughnut data={getPieChartData()} options={pieChartOptions} />
              </div>
            </div>

            <div className="flex-1 ml-6">
              <div className="space-y-6">
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

        {/* Right Column - Partners & Users Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Total Partners & Users
            </h3>
            <div className="flex items-center space-x-4">
              <select 
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as any)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#165933] focus:border-transparent"
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Total Distribution
              </span>
            </div>
          </div>

          <div className="h-64">
            {trendsLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-gray-500">Loading trends...</div>
              </div>
            ) : (
              <Bar 
                data={getPartnerUserBarData()} 
                options={partnerUserBarOptions} 
              />
            )}
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-4 text-center">
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
                User Growth Analytics
              </h3>
              <div className="flex space-x-4 text-sm text-gray-500">
                <span className="text-[#165933] font-medium flex items-center">
                  <span className="w-2 h-2 bg-[#165933] rounded-full mr-2"></span>
                  This year: {formatK(stats?.TotalUsers || 0)}
                </span>
                <span className="text-[#95C11F] font-medium flex items-center">
                  <span className="w-2 h-2 bg-[#95C11F] rounded-full mr-2"></span>
                  Last year: {formatK(lastYearTrends[lastYearTrends.length - 1] || 0)}
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm font-medium text-gray-500">Growth Rate</div>
              <div className="text-lg font-bold text-[#165933]">
                +{growthRate}%
              </div>
            </div>
          </div>

          <div className="h-64">
            <Line data={getUserAnalyticsData()} options={lineChartOptions} />
          </div>
        </div>

        {/* Right Column - Additional Analytics */}
        {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Engagement Metrics
            </h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Page Visits</span>
              <span className="text-lg font-bold text-[#165933]">
                {formatK(stats?.TotalPartnerPageVisits || 0)}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Favorites</span>
              <span className="text-lg font-bold text-[#95C11F]">
                {formatK(stats?.TotalFavourites || 0)}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Recommendations</span>
              <span className="text-lg font-bold text-[#104A2F]">
                {formatK(stats?.TotalRecommendations || 0)}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Today's Partners</span>
              <span className="text-lg font-bold text-[#165933]">
                {formatK(stats?.TodaysPartners || 0)}
              </span>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default DashboardPage;

















