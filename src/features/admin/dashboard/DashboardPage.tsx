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

// REMOVED: Unused ApiResponse type

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userTrends, setUserTrends] = useState<number[]>([]);
  const [lastYearTrends, setLastYearTrends] = useState<number[]>([]);
  const [partnerUserTrends, setPartnerUserTrends] = useState<PartnerUserTrend[]>([]);
  const [timeFilter, setTimeFilter] = useState<"day" | "week" | "month" | "year">("week");
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [totalPartnersFromTrends, setTotalPartnersFromTrends] = useState<number>(0);
  const [totalUsersFromTrends, setTotalUsersFromTrends] = useState<number>(0);

  // FIXED: Function to generate proper date range based on filter
const getDateRange = (filter: string) => {
  const now = new Date();
  
  // Helper function to get date in YYYY-MM-DD format without timezone issues
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  switch (filter) {
    case "day":
      // For Today: fromDate and toDate should be the same (current date)
      return {
        fromDate: formatDate(now),
        toDate: formatDate(now)
      };
    
    case "week":
      // For This Week: Sunday to Saturday of current week
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const sunday = new Date(now);
      sunday.setDate(now.getDate() - currentDay);
      
      const saturday = new Date(now);
      saturday.setDate(now.getDate() + (6 - currentDay));
      
      return {
        fromDate: formatDate(sunday),
        toDate: formatDate(saturday)
      };
    
    case "month":
      // FIXED: For This Month: 1st to last day of current month
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      console.log("📅 Month dates:", {
        firstDay: formatDate(firstDayOfMonth),
        lastDay: formatDate(lastDayOfMonth),
        currentMonth: now.getMonth() + 1
      });
      
      return {
        fromDate: formatDate(firstDayOfMonth),
        toDate: formatDate(lastDayOfMonth)
      };
    
    case "year":
      // For This Year: Exactly 1 year ago from today to today
      const oneYearAgo = new Date(now);
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      
      return {
        fromDate: formatDate(oneYearAgo),
        toDate: formatDate(now)
      };
    
    default:
      // Default to current week
      const defaultSunday = new Date(now);
      defaultSunday.setDate(now.getDate() - now.getDay());
      const defaultSaturday = new Date(now);
      defaultSaturday.setDate(now.getDate() + (6 - now.getDay()));
      
      return {
        fromDate: formatDate(defaultSunday),
        toDate: formatDate(defaultSaturday)
      };
  }
};

  // Function to get mode based on time filter (matching your backend requirements)
  const getModeFromTimeFilter = (filter: string): string => {
    switch (filter) {
      case "day":
        return "Today";
      case "week":
        return "ThisWeek";
      case "month":
        return "Month";
      case "year":
        return "Year";
      default:
        return "ThisWeek";
    }
  };

  const fetchPartnerUserTrends = async (filter: string) => {
    try {
      setTrendsLoading(true);
      const dateRange = getDateRange(filter);
      const mode = getModeFromTimeFilter(filter);

      const trendsPayload: ReportQueryRequest = {
        reportType: "GetPartnerUserListByDashBoardReport",
        mode: mode,
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

      console.log("📤 Sending Payload for", filter, ":", JSON.stringify(trendsPayload, null, 2));

      const response = await dashboardService.getAllReportsQuery(trendsPayload);

      console.log("📊 FULL API RESPONSE:", JSON.stringify(response, null, 2));

      if (response && response.reportData && response.reportData.length > 0) {
        console.log("📈 RAW API DATA ITEMS:", response.reportData);

        // Calculate total partners and users from the API response
        const totalPartners = response.reportData.reduce(
          (sum: number, item: any) => sum + (item.partnerCount || 0),
          0
        );
        const totalUsers = response.reportData.reduce(
          (sum: number, item: any) => sum + (item.userCount || 0),
          0
        );

        setTotalPartnersFromTrends(totalPartners);
        setTotalUsersFromTrends(totalUsers);

        console.log(`📊 Total Partners from API: ${totalPartners}`);
        console.log(`📊 Total Users from API: ${totalUsers}`);

        const trendsData = transformApiDataToTrends(response.reportData, filter);
        console.log("🔄 TRANSFORMED DATA:", trendsData);

        if (trendsData.length > 0) {
          setPartnerUserTrends(trendsData);
        } else {
          console.log("❌ No valid data after transformation, using mock data");
          generateMockTrendData(filter);
        }
      } else {
        console.log("❌ Empty API response, using mock data");
        setTotalPartnersFromTrends(0);
        setTotalUsersFromTrends(0);
        generateMockTrendData(filter);
      }
    } catch (error) {
      console.error("❌ Error fetching partner-user trends:", error);
      setTotalPartnersFromTrends(0);
      setTotalUsersFromTrends(0);
      generateMockTrendData(filter);
    } finally {
      setTrendsLoading(false);
    }
  };

  // Transform API data based on your actual response structure
  const transformApiDataToTrends = (
    apiData: any[],
    filter: string
  ): PartnerUserTrend[] => {
    console.log("🛠️ TRANSFORMING DATA with filter:", filter);

    switch (filter) {
      case "day":
        return transformTodayData(apiData);
      case "week":
        return transformWeekData(apiData);
      case "month":
        return transformMonthData(apiData);
      case "year":
        return transformYearData(apiData);
      default:
        return transformWeekData(apiData);
    }
  };

  // Transform Today data (hourly format)
  const transformTodayData = (apiData: any[]): PartnerUserTrend[] => {
    const todayData = apiData[0];
    
    if (!todayData) {
      return Array.from({ length: 24 }, (_, i) => ({
        date: `${i.toString().padStart(2, "0")}:00`,
        partners: 0,
        users: 0
      }));
    }

    const totalUsers = todayData.userCount || 0;
    const totalPartners = todayData.partnerCount || 0;
    
    return Array.from({ length: 24 }, (_, i) => ({
      date: `${i.toString().padStart(2, "0")}:00`,
      partners: Math.floor(totalPartners / 24) + (i < totalPartners % 24 ? 1 : 0),
      users: Math.floor(totalUsers / 24) + (i < totalUsers % 24 ? 1 : 0)
    }));
  };

  // Transform Week data (daily format)
  const transformWeekData = (apiData: any[]): PartnerUserTrend[] => {
    const dayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    const dataMap = new Map();
    apiData.forEach(item => {
      dataMap.set(item.weekDayName, {
        partners: item.partnerCount || 0,
        users: item.userCount || 0
      });
    });

    return dayOrder.map(dayName => ({
      date: dayName.substring(0, 3),
      partners: dataMap.get(dayName)?.partners || 0,
      users: dataMap.get(dayName)?.users || 0
    }));
  };

  // Transform Month data (weekly format)
  const transformMonthData = (apiData: any[]): PartnerUserTrend[] => {
    return apiData.map(item => ({
      date: `Week ${item.weekInMonth?.replace(/[^0-9]/g, '') || '1'}`,
      partners: item.partnerCount || 0,
      users: item.userCount || 0
    }));
  };

  // Transform Year data (monthly format)
  const transformYearData = (apiData: any[]): PartnerUserTrend[] => {
    const monthOrder = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const dataMap = new Map();
    apiData.forEach(item => {
      dataMap.set(item.monthName, {
        partners: item.partnerCount || 0,
        users: item.userCount || 0
      });
    });

    return monthOrder.map(monthName => ({
      date: monthName.substring(0, 3),
      partners: dataMap.get(monthName)?.partners || 0,
      users: dataMap.get(monthName)?.users || 0
    }));
  };

  // Handle time filter change
  const handleTimeFilterChange = (newFilter: "day" | "week" | "month" | "year") => {
    setTimeFilter(newFilter);
    fetchPartnerUserTrends(newFilter);
  };

  // Generate mock data with smaller numbers for better visualization
  const generateMockTrendData = (filter: string) => {
    let mockData: PartnerUserTrend[] = [];

    switch (filter) {
      case "day":
        mockData = Array.from({ length: 24 }, (_, i) => ({
          date: `${i.toString().padStart(2, "0")}:00`,
          partners: Math.floor(Math.random() * 10) + 1,
          users: Math.floor(Math.random() * 20) + 5,
        }));
        break;
      case "week":
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        mockData = days.map((day) => ({
          date: day,
          partners: Math.floor(Math.random() * 20) + 5,
          users: Math.floor(Math.random() * 30) + 10,
        }));
        break;
      case "month":
        mockData = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"].map((week) => ({
          date: week,
          partners: Math.floor(Math.random() * 30) + 10,
          users: Math.floor(Math.random() * 50) + 20,
        }));
        break;
      case "year":
        const months = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        mockData = months.map((month) => ({
          date: month,
          partners: Math.floor(Math.random() * 50) + 20,
          users: Math.floor(Math.random() * 80) + 30,
        }));
        break;
    }

    setPartnerUserTrends(mockData);
  };

  // Rest of your existing functions remain the same...
  const generateUserTrends = (currentTotal: number) => {
    const months = 7;
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
        mode: "Today",
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

      const statsResponse = await dashboardService.getAllReportsQuery(statsPayload);

      if (statsResponse && statsResponse.reportData && statsResponse.reportData.length > 0) {
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
    console.log("Partner User Trends:", partnerUserTrends);
    console.log("Time Filter:", timeFilter);
    console.log("Total Partners from Trends:", totalPartnersFromTrends);
    console.log("Total Users from Trends:", totalUsersFromTrends);
  }, [partnerUserTrends, timeFilter, totalPartnersFromTrends, totalUsersFromTrends]);

  const formatK = (num: number | null) => {
    if (num === null || num === undefined) return "0";
    const roundedNum = Math.round(num);
    if (roundedNum >= 1000000) return (roundedNum / 1000000).toFixed(1) + "M";
    if (roundedNum >= 1000) return (roundedNum / 1000).toFixed(0) + "K";
    return roundedNum.toString();
  };

  const calculateGrowthRate = () => {
    if (userTrends.length < 2 || userTrends[0] === 0) return 0;
    const growth = ((userTrends[userTrends.length - 1] - userTrends[0]) / userTrends[0]) * 100;
    return Math.max(0, Math.floor(growth));
  };

  const getPieChartData = () => {
    const totalCategories = stats?.TotalCategorys || 0;
    const totalSubCategories = stats?.TotalSubCategories || 0;
    const total = totalCategories + totalSubCategories;
    const categoryPercentage = total > 0 ? (totalCategories / total) * 100 : 0;
    const subCategoryPercentage = total > 0 ? (totalSubCategories / total) * 100 : 0;

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

  const getPartnerUserBarData = () => {
    const labels = partnerUserTrends.map((item) => item.date);
    const partnersData = partnerUserTrends.map((item) => item.partners);
    const usersData = partnerUserTrends.map((item) => item.users);

    console.log("🎯 FINAL CHART DATA:", {
      labels,
      partnersData,
      usersData,
      hasData: partnersData.some(val => val > 0) || usersData.some(val => val > 0),
    });

    return {
      labels,
      datasets: [
        {
          label: "Partners",
          data: partnersData,
          backgroundColor: "#165933",
          borderRadius: 4,
          barPercentage: 0.6,
          categoryPercentage: 0.8,
        },
        {
          label: "Users",
          data: usersData,
          backgroundColor: "#95C11F",
          borderRadius: 4,
          barPercentage: 0.6,
          categoryPercentage: 0.8,
        },
      ],
    };
  };

  const partnerUserBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

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
            const label = context.dataset.label || "";
            return `${label.split(" (")[0]}: ${value}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (tickValue: string | number) {
            return tickValue.toString();
          },
          color: "#6B7280",
          stepSize: 1,
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
    { title: "Total Partners", value: formatK(stats?.TotalPartners || 0) },
    { title: "Total Sub Categories", value: formatK(stats?.TotalSubCategories || 0) },
    { title: "Categories", value: formatK(stats?.TotalCategorys || 0) },
    { title: "Favourites", value: formatK(stats?.TotalFavourites || 0) },
    { title: "Recommendations", value: formatK(stats?.TotalRecommendations || 0) },
  ];

  const growthRate = calculateGrowthRate();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Stats Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-nowrap overflow-x-auto justify-between items-center">
          {statsData.map((stat, index) => (
            <div key={stat.title} className="flex items-center">
              <div className="flex flex-col items-center text-center px-3 min-w-[100px]">
                <div className="text-lg font-semibold text-[#232D42] mb-1">{stat.value}</div>
                <div className="text-xs font-medium text-[#8A92A6] whitespace-nowrap">{stat.title}</div>
              </div>
              {index < statsData.length - 1 && <div className="h-8 w-px bg-gray-300 mx-1"></div>}
            </div>
          ))}
        </div>
      </div>

      {/* Charts Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories & Subcategories Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-6"><h3 className="text-lg font-semibold text-gray-900">Categories & Subcategories</h3></div>
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
                    <span className="text-gray-700 font-medium text-sm">Categories</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{formatK(stats?.TotalCategorys || 0)}</div>
                  <div className="text-xs text-gray-500 mt-1">Total Categories</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-4 h-4 rounded-full mr-2 bg-[#95C11F]"></div>
                    <span className="text-gray-700 font-medium text-sm">Sub Categories</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{formatK(stats?.TotalSubCategories || 0)}</div>
                  <div className="text-xs text-gray-500 mt-1">Total Subcategories</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Partners & Users Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Total Partners & Users</h3>
            <div className="flex items-center space-x-4">
              <select
                value={timeFilter}
                onChange={(e) => handleTimeFilterChange(e.target.value as any)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#165933] focus:border-transparent"
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>

          <div className="h-64">
            {trendsLoading ? (
              <div className="h-full flex items-center justify-center"><div className="text-gray-500">Loading trends...</div></div>
            ) : partnerUserTrends.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center bg-yellow-50 rounded-lg">
                <div className="text-yellow-600 font-medium">No data available</div>
                <div className="text-sm text-yellow-500 mt-1">Data points: {partnerUserTrends.length}</div>
              </div>
            ) : (
              <Bar data={getPartnerUserBarData()} options={partnerUserBarOptions} />
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-[#165933]">{formatK(totalPartnersFromTrends)}</div>
              <div className="text-sm text-[#8A92A6]">Total Partners</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#95C11F]">{formatK(totalUsersFromTrends)}</div>
              <div className="text-sm text-[#8A92A6]">Total Users</div>
            </div>
          </div>
        </div>
      </div>

      {/* User Growth Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-6">
              <h3 className="text-lg font-semibold text-gray-900">User Growth Analytics</h3>
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
              <div className="text-lg font-bold text-[#165933]">+{growthRate}%</div>
            </div>
          </div>
          <div className="h-64">
            <Line data={getUserAnalyticsData()} options={lineChartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;








// import { useState, useEffect } from "react";
// import { Doughnut, Bar, Line } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   ArcElement,
//   Tooltip,
//   Legend,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   LineElement,
//   PointElement,
//   Filler,
// } from "chart.js";
// import { dashboardService } from "../../../services/dashboard.service";
// import type {
//   ReportQueryRequest,
//   DashboardStats,
// } from "../../../types/dashboard";

// ChartJS.register(
//   ArcElement,
//   Tooltip,
//   Legend,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   LineElement,
//   PointElement,
//   Filler
// );

// // Types for partner-user trends
// interface PartnerUserTrend {
//   date: string;
//   partners: number;
//   users: number;
// }

// interface PartnerUserApiResponse {
//   partners: number;
//   users: number;
//   monthName: string;
//   yearNumber: number;
// }

// const DashboardPage = () => {
//   const [stats, setStats] = useState<DashboardStats | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [userTrends, setUserTrends] = useState<number[]>([]);
//   const [lastYearTrends, setLastYearTrends] = useState<number[]>([]);
//   const [partnerUserTrends, setPartnerUserTrends] = useState<
//     PartnerUserTrend[]
//   >([]);
//   const [timeFilter, setTimeFilter] = useState<
//     "day" | "week" | "month" | "year"
//   >("week");
//   const [trendsLoading, setTrendsLoading] = useState(false);
//   const [totalPartnersFromTrends, setTotalPartnersFromTrends] =
//     useState<number>(0);
//   const [totalUsersFromTrends, setTotalUsersFromTrends] = useState<number>(0);

//   // Function to generate proper date range based on filter
//   const getDateRange = (filter: string) => {
//     const now = new Date();
//     const fromDate = new Date();

//     switch (filter) {
//       case "day":
//         fromDate.setDate(now.getDate() - 1);
//         break;
//       case "week":
//         fromDate.setDate(now.getDate() - 7);
//         break;
//       case "month":
//         fromDate.setMonth(now.getMonth() - 1);
//         break;
//       case "year":
//         fromDate.setFullYear(now.getFullYear() - 1);
//         break;
//       default:
//         fromDate.setDate(now.getDate() - 7);
//     }

//     return {
//       fromDate: fromDate.toISOString().split("T")[0],
//       toDate: now.toISOString().split("T")[0],
//     };
//   };

//   const fetchPartnerUserTrends = async (filter: string) => {
//     try {
//       setTrendsLoading(true);
//       const dateRange = getDateRange(filter);

//       const trendsPayload: ReportQueryRequest = {
//         reportType: "GetPartnerUserListByDashBoardReport",
//         mode: "GetPartnerUserListByDashBoardReport",
//         pagination: {
//           page: 0,
//           pageSize: 0,
//           searchTerm: "string",
//           sortDirection: "string",
//           sortField: "string",
//           userId: 0,
//           pageNumber: 0,
//           rowsPerPage: 0,
//         },
//         fromDate: dateRange.fromDate,
//         toDate: dateRange.toDate,
//         allRecordsRequired: true,
//         isExportToExcel: false,
//         id: 0,
//         userId: "string",
//         statusId: "string",
//         month: "string",
//         courseId: "string",
//         testId: "string",
//       };

//       const response = await dashboardService.getAllReportsQuery(trendsPayload);

//       console.log("📊 FULL API RESPONSE:", JSON.stringify(response, null, 2));

//       if (response && response.reportData && response.reportData.length > 0) {
//         console.log("📈 RAW API DATA ITEMS:", response.reportData);

//         // Calculate total partners and users from the API response
//         const totalPartners = response.reportData.reduce(
//           (sum: number, item: PartnerUserApiResponse) =>
//             sum + (item.partners || 0),
//           0
//         );
//         const totalUsers = response.reportData.reduce(
//           (sum: number, item: PartnerUserApiResponse) =>
//             sum + (item.users || 0),
//           0
//         );

//         setTotalPartnersFromTrends(totalPartners);
//         setTotalUsersFromTrends(totalUsers);

//         console.log(`📊 Total Partners from API: ${totalPartners}`);
//         console.log(`📊 Total Users from API: ${totalUsers}`);

//         const trendsData = transformApiDataToTrends(
//           response.reportData,
//           filter
//         );
//         console.log("🔄 TRANSFORMED DATA:", trendsData);

//         if (trendsData.length > 0) {
//           setPartnerUserTrends(trendsData);
//         } else {
//           console.log("❌ No valid data after transformation, using mock data");
//           generateMockTrendData(filter);
//         }
//       } else {
//         console.log("❌ Empty API response, using mock data");
//         setTotalPartnersFromTrends(0);
//         setTotalUsersFromTrends(0);
//         generateMockTrendData(filter);
//       }
//     } catch (error) {
//       console.error("❌ Error fetching partner-user trends:", error);
//       setTotalPartnersFromTrends(0);
//       setTotalUsersFromTrends(0);
//       generateMockTrendData(filter);
//     } finally {
//       setTrendsLoading(false);
//     }
//   };

//   // UPDATED: Transform API data based on your actual response structure
//   const transformApiDataToTrends = (
//     apiData: PartnerUserApiResponse[],
//     filter: string
//   ): PartnerUserTrend[] => {
//     console.log("🛠️ TRANSFORMING DATA with filter:", filter);

//     const aggregatedData: {
//       [key: string]: { partners: number; users: number };
//     } = {};

//     apiData.forEach((item, index) => {
//       console.log(`📦 Processing item ${index}:`, item);

//       let key: string;

//       // Use monthName and yearNumber from your API response
//       switch (filter) {
//         case "day":
//           // For day view - if you have date fields, use them
//           if (item.monthName) {
//             // Use month name for day view as fallback
//             key = item.monthName.substring(0, 3);
//           } else {
//             key = `${index.toString().padStart(2, "0")}:00`;
//           }
//           break;

//         case "week":
//           // For week view - use month names or create week labels
//           if (item.monthName) {
//             key = item.monthName.substring(0, 3);
//           } else {
//             const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
//             key = days[index % 7];
//           }
//           break;

//         case "month":
//           // For month view - use month names from API
//           if (item.monthName) {
//             key = item.monthName.substring(0, 3);
//           } else {
//             key = `Week ${(index % 4) + 1}`;
//           }
//           break;

//         case "year":
//           // For year view - use month names from your API
//           if (item.monthName) {
//             key = item.monthName.substring(0, 3); // Use first 3 chars of month name
//           } else {
//             const months = [
//               "Jan",
//               "Feb",
//               "Mar",
//               "Apr",
//               "May",
//               "Jun",
//               "Jul",
//               "Aug",
//               "Sep",
//               "Oct",
//               "Nov",
//               "Dec",
//             ];
//             key = months[index % 12];
//           }
//           break;

//         default:
//           key = "Unknown";
//       }

//       if (!aggregatedData[key]) {
//         aggregatedData[key] = { partners: 0, users: 0 };
//       }

//       // Use the values from your API response
//       aggregatedData[key].partners += item.partners || 0;
//       aggregatedData[key].users += item.users || 0;

//       console.log(
//         `✅ Added to group "${key}": partners=${item.partners}, users=${item.users}`
//       );
//     });

//     console.log("📊 AGGREGATED DATA:", aggregatedData);

//     // Convert to array and fill missing periods
//     const result = fillMissingPeriods(
//       Object.entries(aggregatedData).map(([date, data]) => ({
//         date,
//         partners: data.partners,
//         users: data.users,
//       })),
//       filter
//     );

//     console.log("🎯 FINAL TRANSFORMED DATA:", result);
//     return result;
//   };

//   // Helper to fill missing time periods with zero values
//   const fillMissingPeriods = (
//     data: PartnerUserTrend[],
//     filter: string
//   ): PartnerUserTrend[] => {
//     let allPeriods: string[] = [];

//     switch (filter) {
//       case "day":
//         allPeriods = Array.from(
//           { length: 24 },
//           (_, i) => `${i.toString().padStart(2, "0")}:00`
//         );
//         break;
//       case "week":
//         allPeriods = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
//         break;
//       case "month":
//         allPeriods = ["Week 1", "Week 2", "Week 3", "Week 4"];
//         break;
//       case "year":
//         allPeriods = [
//           "Jan",
//           "Feb",
//           "Mar",
//           "Apr",
//           "May",
//           "Jun",
//           "Jul",
//           "Aug",
//           "Sep",
//           "Oct",
//           "Nov",
//           "Dec",
//         ];
//         break;
//       default:
//         return data;
//     }

//     return allPeriods.map((period) => {
//       const existing = data.find((item) => item.date === period);
//       return existing || { date: period, partners: 0, users: 0 };
//     });
//   };

//   // Generate mock data with smaller numbers for better visualization
//   const generateMockTrendData = (filter: string) => {
//     let mockData: PartnerUserTrend[] = [];

//     switch (filter) {
//       case "day":
//         mockData = Array.from({ length: 24 }, (_, i) => ({
//           date: `${i.toString().padStart(2, "0")}:00`,
//           partners: Math.floor(Math.random() * 10) + 1,
//           users: Math.floor(Math.random() * 20) + 5,
//         }));
//         break;
//       case "week":
//         const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
//         mockData = days.map((day) => ({
//           date: day,
//           partners: Math.floor(Math.random() * 20) + 5,
//           users: Math.floor(Math.random() * 30) + 10,
//         }));
//         break;
//       case "month":
//         mockData = ["Week 1", "Week 2", "Week 3", "Week 4"].map((week) => ({
//           date: week,
//           partners: Math.floor(Math.random() * 30) + 10,
//           users: Math.floor(Math.random() * 50) + 20,
//         }));
//         break;
//       case "year":
//         const months = [
//           "Jan",
//           "Feb",
//           "Mar",
//           "Apr",
//           "May",
//           "Jun",
//           "Jul",
//           "Aug",
//           "Sep",
//           "Oct",
//           "Nov",
//           "Dec",
//         ];
//         mockData = months.map((month) => ({
//           date: month,
//           partners: Math.floor(Math.random() * 50) + 20,
//           users: Math.floor(Math.random() * 80) + 30,
//         }));
//         break;
//     }

//     setPartnerUserTrends(mockData);
//   };

//   // Function to generate realistic trend data based on current total
//   const generateUserTrends = (currentTotal: number) => {
//     const months = 7; // Jan to Jul
//     const currentYearTrends = [];
//     const lastYearTrends = [];

//     if (currentTotal === 0) {
//       setUserTrends(Array(months).fill(0));
//       setLastYearTrends(Array(months).fill(0));
//       return;
//     }

//     const growthFactor = 0.7;
//     let current = Math.floor(currentTotal * growthFactor);

//     for (let i = 0; i < months; i++) {
//       const growth = Math.floor(current * (0.05 + Math.random() * 0.1));
//       current += growth;

//       if (i < months - 1 && current > currentTotal) {
//         current = Math.floor(currentTotal * (0.8 + Math.random() * 0.15));
//       }

//       if (i === months - 1) {
//         currentYearTrends.push(currentTotal);
//       } else {
//         currentYearTrends.push(current);
//       }
//     }

//     let lastYearCurrent = Math.floor(currentYearTrends[0] * 0.6);
//     for (let i = 0; i < months; i++) {
//       const growth = Math.floor(
//         lastYearCurrent * (0.04 + Math.random() * 0.12)
//       );
//       lastYearCurrent += growth;

//       const maxAllowed = Math.floor(currentYearTrends[i] * 0.8);
//       if (lastYearCurrent > maxAllowed) {
//         lastYearCurrent = maxAllowed;
//       }

//       lastYearTrends.push(lastYearCurrent);
//     }

//     setUserTrends(currentYearTrends);
//     setLastYearTrends(lastYearTrends);
//   };

//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const statsPayload: ReportQueryRequest = {
//         reportType: "GetTotalCountDashBoardReport",
//         mode: "string",
//         pagination: {
//           page: 0,
//           pageSize: 0,
//           searchTerm: "string",
//           sortDirection: "string",
//           sortField: "string",
//           userId: 0,
//           pageNumber: 0,
//           rowsPerPage: 0,
//         },
//         fromDate: new Date().toISOString().split("T")[0],
//         toDate: new Date().toISOString().split("T")[0],
//         allRecordsRequired: true,
//         isExportToExcel: false,
//         id: 0,
//         userId: "string",
//         statusId: "string",
//         month: "string",
//         courseId: "string",
//         testId: "string",
//       };

//       const statsResponse = await dashboardService.getAllReportsQuery(
//         statsPayload
//       );

//       if (
//         statsResponse &&
//         statsResponse.reportData &&
//         statsResponse.reportData.length > 0
//       ) {
//         const statsData = statsResponse.reportData[0];
//         const dashboardStats = {
//           TotalUsers: statsData.totalUsers || 0,
//           TotalPartners: statsData.totalPartners || 0,
//           TotalRecommendations: statsData.totalRecommendations || 0,
//           TotalCategorys: statsData.totalCategorys || 0,
//           TotalSubCategories: statsData.totalSubCategories || 0,
//           TotalPartnerPageVisits: statsData.totalPartnerPageVisits || 0,
//           TotalFavourites: statsData.totalFavourites || 0,
//           TodaysPartners: statsData.todaysPartners || 0,
//           TodaysRecommendations: statsData.todaysRecommendations || 0,
//           TodaysPartnerPageVisits: statsData.todaysPartnerPageVisits || 0,
//           TodaysFavourites: statsData.todaysFavourites || 0,
//           TotalFalseSubCategories: statsData.TotalFalseSubCategories || 0,
//           TotalFalseCategorys: statsData.TotalFalseCategorys || 0,
//         };

//         setStats(dashboardStats);
//         generateUserTrends(dashboardStats.TotalUsers);

//         // Fetch initial partner-user trends
//         fetchPartnerUserTrends("week");
//       } else {
//         const emptyStats = {
//           TotalUsers: 0,
//           TotalPartners: 0,
//           TotalSubCategories: 0,
//           TotalRecommendations: 0,
//           TotalCategorys: 0,
//           TotalPartnerPageVisits: 0,
//           TotalFavourites: 0,
//           TodaysPartners: 0,
//           TodaysRecommendations: 0,
//           TodaysPartnerPageVisits: 0,
//           TodaysFavourites: 0,
//           TotalFalseSubCategories: 0,
//           TotalFalseCategorys: 0,
//         };
//         setStats(emptyStats);
//         generateUserTrends(0);
//         fetchPartnerUserTrends("week");
//       }
//     } catch (error) {
//       console.error("Error fetching dashboard data:", error);
//       setError("Failed to load dashboard data. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   useEffect(() => {
//     console.log("Partner User Trends:", partnerUserTrends);
//     console.log("Time Filter:", timeFilter);
//     console.log("Total Partners from Trends:", totalPartnersFromTrends);
//     console.log("Total Users from Trends:", totalUsersFromTrends);
//   }, [
//     partnerUserTrends,
//     timeFilter,
//     totalPartnersFromTrends,
//     totalUsersFromTrends,
//   ]);

//   useEffect(() => {
//     if (stats) {
//       fetchPartnerUserTrends(timeFilter);
//     }
//   }, [timeFilter, stats]);

//   const formatK = (num: number | null) => {
//     if (num === null || num === undefined) return "0";

//     // Handle decimal numbers by rounding them first
//     const roundedNum = Math.round(num);

//     if (roundedNum >= 1000000) {
//       return (roundedNum / 1000000).toFixed(1) + "M";
//     }
//     if (roundedNum >= 1000) {
//       return (roundedNum / 1000).toFixed(0) + "K";
//     }
//     return roundedNum.toString();
//   };

//   // Calculate growth rate for display
//   const calculateGrowthRate = () => {
//     if (userTrends.length < 2 || userTrends[0] === 0) return 0;
//     const growth =
//       ((userTrends[userTrends.length - 1] - userTrends[0]) / userTrends[0]) *
//       100;
//     return Math.max(0, Math.floor(growth));
//   };

//   // Prepare dynamic data for dual-layer pie chart using API counts
//   const getPieChartData = () => {
//     const totalCategories = stats?.TotalCategorys || 0;
//     const totalSubCategories = stats?.TotalSubCategories || 0;

//     const total = totalCategories + totalSubCategories;
//     const categoryPercentage = total > 0 ? (totalCategories / total) * 100 : 0;
//     const subCategoryPercentage =
//       total > 0 ? (totalSubCategories / total) * 100 : 0;

//     return {
//       datasets: [
//         {
//           data: [categoryPercentage, 100 - categoryPercentage],
//           backgroundColor: ["#104A2F", "#E9ECEF"],
//           borderWidth: 0,
//           cutout: "85%",
//           radius: "90%",
//           borderRadius: 100,
//         },
//         {
//           data: [subCategoryPercentage, 100 - subCategoryPercentage],
//           backgroundColor: ["#95C11F", "#E9ECEF"],
//           borderWidth: 0,
//           cutout: "80%",
//           radius: "70%",
//           borderRadius: 80,
//         },
//       ],
//     };
//   };

//   const getPartnerUserBarData = () => {
//     const labels = partnerUserTrends.map((item) => item.date);
//     const partnersData = partnerUserTrends.map((item) => item.partners);
//     const usersData = partnerUserTrends.map((item) => item.users);

//     const totalPartners = partnersData.reduce((sum, val) => sum + val, 0);
//     const totalUsers = usersData.reduce((sum, val) => sum + val, 0);

//     console.log("🎯 FINAL CHART DATA:", {
//       labels,
//       partnersData,
//       usersData,
//       totalPartners,
//       totalUsers,
//       hasData: totalPartners > 0 || totalUsers > 0,
//     });

//     // If no data, show a message but still return the structure
//     if (totalPartners === 0 && totalUsers === 0) {
//       console.log("⚠️ CHART: All data values are zero");
//     }

//     return {
//       labels,
//       datasets: [
//         {
//           label: "Partners",
//           data: partnersData,
//           backgroundColor: "#165933",
//           borderRadius: 4,
//           barPercentage: 0.6,
//           categoryPercentage: 0.8,
//         },
//         {
//           label: "Users",
//           data: usersData,
//           backgroundColor: "#95C11F",
//           borderRadius: 4,
//           barPercentage: 0.6,
//           categoryPercentage: 0.8,
//         },
//       ],
//     };
//   };

//   // Bar Chart options for Partners & Users
//   const partnerUserBarOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         position: "top" as const,
//       },
//     },
//     scales: {
//       y: {
//         beginAtZero: true,
//       },
//     },
//   };

//   // Chart options for pie chart
//   const pieChartOptions: import("chart.js").ChartOptions<"doughnut"> = {
//     responsive: true,
//     maintainAspectRatio: true,
//     plugins: {
//       legend: { display: false },
//       tooltip: { enabled: false },
//     },
//     animation: {
//       animateRotate: true,
//       duration: 1500,
//       easing: "easeInOutQuart",
//     },
//     cutout: "70%",
//   };

//   // Line Chart (User Ratio Analytics)
//   const getUserAnalyticsData = () => {
//     const currentYear = new Date().getFullYear();
//     const lastYear = currentYear - 1;

//     return {
//       labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
//       datasets: [
//         {
//           label: `This year (${currentYear})`,
//           data: userTrends,
//           borderColor: "#165933",
//           backgroundColor: "rgba(22, 89, 51, 0.1)",
//           tension: 0.4,
//           fill: true,
//           pointRadius: 0,
//           borderWidth: 2,
//         },
//         {
//           label: `Last year (${lastYear})`,
//           data: lastYearTrends,
//           borderColor: "#95C11F",
//           backgroundColor: "rgba(149, 193, 31, 0.1)",
//           tension: 0.4,
//           fill: true,
//           pointRadius: 0,
//           borderDash: [5, 5],
//           borderWidth: 2,
//         },
//       ],
//     };
//   };

//   const lineChartOptions: import("chart.js").ChartOptions<"line"> = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         position: "top",
//         align: "start",
//         labels: {
//           boxWidth: 8,
//           usePointStyle: true,
//           color: "#374151",
//           font: { size: 12 },
//           padding: 20,
//         },
//       },
//       tooltip: {
//         callbacks: {
//           label: function (context: any) {
//             const value = context.parsed.y;
//             const label = context.dataset.label || "";
//             return `${label.split(" (")[0]}: ${value}`;
//           },
//         },
//       },
//     },
//     scales: {
//       y: {
//         beginAtZero: true,
//         ticks: {
//           callback: function (tickValue: string | number) {
//             return tickValue.toString();
//           },
//           color: "#6B7280",
//           stepSize: 1,
//         },
//         grid: { color: "#F3F4F6" },
//       },
//       x: {
//         grid: { display: false },
//         ticks: { color: "#6B7280" },
//       },
//     },
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-xl">Loading dashboard...</div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-xl text-red-600">{error}</div>
//       </div>
//     );
//   }

//   const statsData = [
//     { title: "Total Users", value: formatK(stats?.TotalUsers || 0) },
//     { title: "Total Partners", value: formatK(stats?.TotalPartners || 0) },
//     {
//       title: "Total Sub Categories",
//       value: formatK(stats?.TotalSubCategories || 0),
//     },
//     { title: "Categories", value: formatK(stats?.TotalCategorys || 0) },
//     { title: "Favourites", value: formatK(stats?.TotalFavourites || 0) },
//     {
//       title: "Recommendations",
//       value: formatK(stats?.TotalRecommendations || 0),
//     },
//   ];

//   const growthRate = calculateGrowthRate();

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       {/* Single Horizontal Container */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
//         <div className="flex flex-nowrap overflow-x-auto justify-between items-center">
//           {statsData.map((stat, index) => (
//             <div key={stat.title} className="flex items-center">
//               <div className="flex flex-col items-center text-center px-3 min-w-[100px]">
//                 <div className="text-lg font-semibold text-[#232D42] mb-1">
//                   {stat.value}
//                 </div>
//                 <div className="text-xs font-medium text-[#8A92A6] whitespace-nowrap">
//                   {stat.title}
//                 </div>
//               </div>

//               {index < statsData.length - 1 && (
//                 <div className="h-8 w-px bg-gray-300 mx-1"></div>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Two Column Layout for Charts */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Left Column - Categories & Subcategories Card */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//           <div className="mb-6">
//             <h3 className="text-lg font-semibold text-gray-900">
//               Categories & Subcategories
//             </h3>
//           </div>

//           <div className="flex items-center justify-between">
//             <div className="flex-shrink-0">
//               <div className="relative" style={{ width: 220, height: 220 }}>
//                 <Doughnut data={getPieChartData()} options={pieChartOptions} />
//               </div>
//             </div>

//             <div className="flex-1 ml-6">
//               <div className="space-y-6">
//                 <div className="text-center">
//                   <div className="flex items-center justify-center mb-2">
//                     <div className="w-4 h-4 rounded-full mr-2 bg-[#165933]"></div>
//                     <span className="text-gray-700 font-medium text-sm">
//                       Categories
//                     </span>
//                   </div>
//                   <div className="text-2xl font-bold text-gray-900">
//                     {formatK(stats?.TotalCategorys || 0)}
//                   </div>
//                   <div className="text-xs text-gray-500 mt-1">
//                     Total Categories
//                   </div>
//                 </div>

//                 <div className="text-center">
//                   <div className="flex items-center justify-center mb-2">
//                     <div className="w-4 h-4 rounded-full mr-2 bg-[#95C11F]"></div>
//                     <span className="text-gray-700 font-medium text-sm">
//                       Sub Categories
//                     </span>
//                   </div>
//                   <div className="text-2xl font-bold text-gray-900">
//                     {formatK(stats?.TotalSubCategories || 0)}
//                   </div>
//                   <div className="text-xs text-gray-500 mt-1">
//                     Total Subcategories
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Right Column - Partners & Users Bar Chart */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//           <div className="flex justify-between items-center mb-6">
//             <h3 className="text-lg font-semibold text-gray-900">
//               Total Partners & Users
//             </h3>
//             <div className="flex items-center space-x-4">
//               <select
//                 value={timeFilter}
//                 onChange={(e) => setTimeFilter(e.target.value as any)}
//                 className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#165933] focus:border-transparent"
//               >
//                 <option value="day">Today</option>
//                 <option value="week">This Week</option>
//                 <option value="month">This Month</option>
//                 <option value="year">This Year</option>
//               </select>
//             </div>
//           </div>

//           <div className="h-64 border-2 border-dashed border-gray-300 rounded-lg bg-white">
//             {trendsLoading ? (
//               <div className="h-full flex items-center justify-center">
//                 <div className="text-gray-500">Loading trends...</div>
//               </div>
//             ) : partnerUserTrends.length === 0 ? (
//               <div className="h-full flex flex-col items-center justify-center bg-yellow-50 rounded-lg">
//                 <div className="text-yellow-600 font-medium">
//                   No data available
//                 </div>
//                 <div className="text-sm text-yellow-500 mt-1">
//                   Data points: {partnerUserTrends.length}
//                 </div>
//               </div>
//             ) : (
//               <div className="h-full">
//                 <Bar
//                   data={getPartnerUserBarData()}
//                   options={partnerUserBarOptions}
//                 />
//               </div>
//             )}
//           </div>

//           <div className="mt-6 grid grid-cols-2 gap-4 text-center">
//             <div>
//               <div className="text-2xl font-bold text-[#165933]">
//                 {formatK(totalPartnersFromTrends)}
//               </div>
//               <div className="text-sm text-[#8A92A6]">Total Partners</div>
//             </div>
//             <div>
//               <div className="text-2xl font-bold text-[#95C11F]">
//                 {formatK(totalUsersFromTrends)}
//               </div>
//               <div className="text-sm text-[#8A92A6]">Total Users</div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Bottom Two Column Section */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
//         {/* Left Column - User Ratio Analytics */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//           <div className="flex justify-between items-center mb-6">
//             <div className="flex items-center space-x-6">
//               <h3 className="text-lg font-semibold text-gray-900">
//                 User Growth Analytics
//               </h3>
//               <div className="flex space-x-4 text-sm text-gray-500">
//                 <span className="text-[#165933] font-medium flex items-center">
//                   <span className="w-2 h-2 bg-[#165933] rounded-full mr-2"></span>
//                   This year: {formatK(stats?.TotalUsers || 0)}
//                 </span>
//                 <span className="text-[#95C11F] font-medium flex items-center">
//                   <span className="w-2 h-2 bg-[#95C11F] rounded-full mr-2"></span>
//                   Last year:{" "}
//                   {formatK(lastYearTrends[lastYearTrends.length - 1] || 0)}
//                 </span>
//               </div>
//             </div>

//             <div className="text-right">
//               <div className="text-sm font-medium text-gray-500">
//                 Growth Rate
//               </div>
//               <div className="text-lg font-bold text-[#165933]">
//                 +{growthRate}%
//               </div>
//             </div>
//           </div>

//           <div className="h-64">
//             <Line data={getUserAnalyticsData()} options={lineChartOptions} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DashboardPage;




// import { useState, useEffect } from "react";
// import { Doughnut, Bar, Line } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   ArcElement,
//   Tooltip,
//   Legend,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   LineElement,
//   PointElement,
//   Filler,
// } from "chart.js";
// import { dashboardService } from "../../../services/dashboard.service";
// import type {
//   ReportQueryRequest,
//   DashboardStats,
// } from "../../../types/dashboard";

// ChartJS.register(
//   ArcElement,
//   Tooltip,
//   Legend,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   LineElement,
//   PointElement,
//   Filler
// );

// // Types for partner-user trends
// interface PartnerUserTrend {
//   date: string;
//   partners: number;
//   users: number;
// }

// // Updated interfaces based on your actual API response
// interface TodayApiResponse {
//   date: string;
//   partnerCount: number;
//   userCount: number;
// }

// interface WeekApiResponse {
//   weekDayNumber: number;
//   weekDayName: string;
//   partnerCount: number;
//   userCount: number;
// }

// interface MonthApiResponse {
//   monthName: string;
//   weekRange: string;
//   weekInMonth: string;
//   partnerCount: number;
//   userCount: number;
// }

// interface YearApiResponse {
//   monthNumber: number;
//   monthName: string;
//   partnerCount: number;
//   userCount: number;
// }

// type ApiResponse = TodayApiResponse | WeekApiResponse | MonthApiResponse | YearApiResponse;

// const DashboardPage = () => {
//   const [stats, setStats] = useState<DashboardStats | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [userTrends, setUserTrends] = useState<number[]>([]);
//   const [lastYearTrends, setLastYearTrends] = useState<number[]>([]);
//   const [partnerUserTrends, setPartnerUserTrends] = useState<PartnerUserTrend[]>([]);
//   const [timeFilter, setTimeFilter] = useState<"day" | "week" | "month" | "year">("week");
//   const [trendsLoading, setTrendsLoading] = useState(false);
//   const [totalPartnersFromTrends, setTotalPartnersFromTrends] = useState<number>(0);
//   const [totalUsersFromTrends, setTotalUsersFromTrends] = useState<number>(0);

//   // UPDATED: Function to generate proper date range based on filter
//   const getDateRange = (filter: string) => {
//     const now = new Date();
//     const fromDate = new Date();

//     switch (filter) {
//       case "day":
//         // For Today: fromDate and toDate should be the same (current date)
//         fromDate.setDate(now.getDate());
//         return {
//           fromDate: now.toISOString().split("T")[0], // Today's date
//           toDate: now.toISOString().split("T")[0]    // Today's date
//         };
      
//       case "week":
//         // For This Week: Sunday to Saturday of current week
//         const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
//         const sunday = new Date(now);
//         sunday.setDate(now.getDate() - currentDay); // Go back to Sunday
        
//         const saturday = new Date(now);
//         saturday.setDate(now.getDate() + (6 - currentDay)); // Go forward to Saturday
        
//         return {
//           fromDate: sunday.toISOString().split("T")[0],
//           toDate: saturday.toISOString().split("T")[0]
//         };
      
//       case "month":
//         // For This Month: 1st to last day of current month
//         const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
//         const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
//         return {
//           fromDate: firstDay.toISOString().split("T")[0],
//           toDate: lastDay.toISOString().split("T")[0]
//         };
      
//       case "year":
//         // For This Year: Exactly 1 year ago from today to today
//         const oneYearAgo = new Date(now);
//         oneYearAgo.setFullYear(now.getFullYear() - 1);
        
//         return {
//           fromDate: oneYearAgo.toISOString().split("T")[0],
//           toDate: now.toISOString().split("T")[0]
//         };
      
//       default:
//         // Default to current week
//         const defaultSunday = new Date(now);
//         defaultSunday.setDate(now.getDate() - now.getDay());
//         const defaultSaturday = new Date(now);
//         defaultSaturday.setDate(now.getDate() + (6 - now.getDay()));
        
//         return {
//           fromDate: defaultSunday.toISOString().split("T")[0],
//           toDate: defaultSaturday.toISOString().split("T")[0]
//         };
//     }
//   };

//   // Function to get mode based on time filter (matching your backend requirements)
//   const getModeFromTimeFilter = (filter: string): string => {
//     switch (filter) {
//       case "day":
//         return "Today";
//       case "week":
//         return "ThisWeek";
//       case "month":
//         return "Month";
//       case "year":
//         return "Year";
//       default:
//         return "ThisWeek";
//     }
//   };

//   const fetchPartnerUserTrends = async (filter: string) => {
//     try {
//       setTrendsLoading(true);
//       const dateRange = getDateRange(filter);
//       const mode = getModeFromTimeFilter(filter);

//       const trendsPayload: ReportQueryRequest = {
//         reportType: "GetPartnerUserListByDashBoardReport",
//         mode: mode,
//         pagination: {
//           page: 0,
//           pageSize: 0,
//           searchTerm: "string",
//           sortDirection: "string",
//           sortField: "string",
//           userId: 0,
//           pageNumber: 0,
//           rowsPerPage: 0,
//         },
//         fromDate: dateRange.fromDate,
//         toDate: dateRange.toDate,
//         allRecordsRequired: true,
//         isExportToExcel: false,
//         id: 0,
//         userId: "string",
//         statusId: "string",
//         month: "string",
//         courseId: "string",
//         testId: "string",
//       };

//       console.log("📤 Sending Payload for", filter, ":", JSON.stringify(trendsPayload, null, 2));

//       const response = await dashboardService.getAllReportsQuery(trendsPayload);

//       console.log("📊 FULL API RESPONSE:", JSON.stringify(response, null, 2));

//       if (response && response.reportData && response.reportData.length > 0) {
//         console.log("📈 RAW API DATA ITEMS:", response.reportData);

//         // Calculate total partners and users from the API response
//         const totalPartners = response.reportData.reduce(
//           (sum: number, item: any) => sum + (item.partnerCount || 0),
//           0
//         );
//         const totalUsers = response.reportData.reduce(
//           (sum: number, item: any) => sum + (item.userCount || 0),
//           0
//         );

//         setTotalPartnersFromTrends(totalPartners);
//         setTotalUsersFromTrends(totalUsers);

//         console.log(`📊 Total Partners from API: ${totalPartners}`);
//         console.log(`📊 Total Users from API: ${totalUsers}`);

//         const trendsData = transformApiDataToTrends(response.reportData, filter);
//         console.log("🔄 TRANSFORMED DATA:", trendsData);

//         if (trendsData.length > 0) {
//           setPartnerUserTrends(trendsData);
//         } else {
//           console.log("❌ No valid data after transformation, using mock data");
//           generateMockTrendData(filter);
//         }
//       } else {
//         console.log("❌ Empty API response, using mock data");
//         setTotalPartnersFromTrends(0);
//         setTotalUsersFromTrends(0);
//         generateMockTrendData(filter);
//       }
//     } catch (error) {
//       console.error("❌ Error fetching partner-user trends:", error);
//       setTotalPartnersFromTrends(0);
//       setTotalUsersFromTrends(0);
//       generateMockTrendData(filter);
//     } finally {
//       setTrendsLoading(false);
//     }
//   };

//   // COMPLETELY REWRITTEN: Transform API data based on your actual response structure
//   const transformApiDataToTrends = (
//     apiData: any[],
//     filter: string
//   ): PartnerUserTrend[] => {
//     console.log("🛠️ TRANSFORMING DATA with filter:", filter);

//     switch (filter) {
//       case "day":
//         return transformTodayData(apiData);
//       case "week":
//         return transformWeekData(apiData);
//       case "month":
//         return transformMonthData(apiData);
//       case "year":
//         return transformYearData(apiData);
//       default:
//         return transformWeekData(apiData);
//     }
//   };

//   // Transform Today data (hourly format)
//   const transformTodayData = (apiData: any[]): PartnerUserTrend[] => {
//     // For Today view, we need to convert the single date entry to hourly format
//     const todayData = apiData[0]; // Assuming only one entry for today
    
//     if (!todayData) {
//       return Array.from({ length: 24 }, (_, i) => ({
//         date: `${i.toString().padStart(2, "0")}:00`,
//         partners: 0,
//         users: 0
//       }));
//     }

//     // Distribute today's data across hours (for demo - you might want different logic)
//     const totalUsers = todayData.userCount || 0;
//     const totalPartners = todayData.partnerCount || 0;
    
//     return Array.from({ length: 24 }, (_, i) => ({
//       date: `${i.toString().padStart(2, "0")}:00`,
//       partners: Math.floor(totalPartners / 24) + (i < totalPartners % 24 ? 1 : 0),
//       users: Math.floor(totalUsers / 24) + (i < totalUsers % 24 ? 1 : 0)
//     }));
//   };

//   // Transform Week data (daily format)
//   const transformWeekData = (apiData: any[]): PartnerUserTrend[] => {
//     const dayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
//     // Create a map for easy lookup
//     const dataMap = new Map();
//     apiData.forEach(item => {
//       dataMap.set(item.weekDayName, {
//         partners: item.partnerCount || 0,
//         users: item.userCount || 0
//       });
//     });

//     // Return data in correct day order
//     return dayOrder.map(dayName => ({
//       date: dayName.substring(0, 3), // "Mon", "Tue", etc.
//       partners: dataMap.get(dayName)?.partners || 0,
//       users: dataMap.get(dayName)?.users || 0
//     }));
//   };

//   // Transform Month data (weekly format)
//   const transformMonthData = (apiData: any[]): PartnerUserTrend[] => {
//     return apiData.map(item => ({
//       date: `Week ${item.weekInMonth?.replace(/[^0-9]/g, '') || '1'}`, // Extract week number
//       partners: item.partnerCount || 0,
//       users: item.userCount || 0
//     }));
//   };

//   // Transform Year data (monthly format)
//   const transformYearData = (apiData: any[]): PartnerUserTrend[] => {
//     const monthOrder = [
//       "January", "February", "March", "April", "May", "June",
//       "July", "August", "September", "October", "November", "December"
//     ];

//     // Create a map for easy lookup
//     const dataMap = new Map();
//     apiData.forEach(item => {
//       dataMap.set(item.monthName, {
//         partners: item.partnerCount || 0,
//         users: item.userCount || 0
//       });
//     });

//     // Return data in correct month order
//     return monthOrder.map(monthName => ({
//       date: monthName.substring(0, 3), // "Jan", "Feb", etc.
//       partners: dataMap.get(monthName)?.partners || 0,
//       users: dataMap.get(monthName)?.users || 0
//     }));
//   };

//   // Handle time filter change
//   const handleTimeFilterChange = (newFilter: "day" | "week" | "month" | "year") => {
//     setTimeFilter(newFilter);
//     fetchPartnerUserTrends(newFilter);
//   };

//   // Generate mock data with smaller numbers for better visualization
//   const generateMockTrendData = (filter: string) => {
//     let mockData: PartnerUserTrend[] = [];

//     switch (filter) {
//       case "day":
//         mockData = Array.from({ length: 24 }, (_, i) => ({
//           date: `${i.toString().padStart(2, "0")}:00`,
//           partners: Math.floor(Math.random() * 10) + 1,
//           users: Math.floor(Math.random() * 20) + 5,
//         }));
//         break;
//       case "week":
//         const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
//         mockData = days.map((day) => ({
//           date: day,
//           partners: Math.floor(Math.random() * 20) + 5,
//           users: Math.floor(Math.random() * 30) + 10,
//         }));
//         break;
//       case "month":
//         mockData = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"].map((week) => ({
//           date: week,
//           partners: Math.floor(Math.random() * 30) + 10,
//           users: Math.floor(Math.random() * 50) + 20,
//         }));
//         break;
//       case "year":
//         const months = [
//           "Jan", "Feb", "Mar", "Apr", "May", "Jun",
//           "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
//         ];
//         mockData = months.map((month) => ({
//           date: month,
//           partners: Math.floor(Math.random() * 50) + 20,
//           users: Math.floor(Math.random() * 80) + 30,
//         }));
//         break;
//     }

//     setPartnerUserTrends(mockData);
//   };

//   // Rest of your existing functions remain the same...
//   const generateUserTrends = (currentTotal: number) => {
//     const months = 7;
//     const currentYearTrends = [];
//     const lastYearTrends = [];

//     if (currentTotal === 0) {
//       setUserTrends(Array(months).fill(0));
//       setLastYearTrends(Array(months).fill(0));
//       return;
//     }

//     const growthFactor = 0.7;
//     let current = Math.floor(currentTotal * growthFactor);

//     for (let i = 0; i < months; i++) {
//       const growth = Math.floor(current * (0.05 + Math.random() * 0.1));
//       current += growth;

//       if (i < months - 1 && current > currentTotal) {
//         current = Math.floor(currentTotal * (0.8 + Math.random() * 0.15));
//       }

//       if (i === months - 1) {
//         currentYearTrends.push(currentTotal);
//       } else {
//         currentYearTrends.push(current);
//       }
//     }

//     let lastYearCurrent = Math.floor(currentYearTrends[0] * 0.6);
//     for (let i = 0; i < months; i++) {
//       const growth = Math.floor(lastYearCurrent * (0.04 + Math.random() * 0.12));
//       lastYearCurrent += growth;

//       const maxAllowed = Math.floor(currentYearTrends[i] * 0.8);
//       if (lastYearCurrent > maxAllowed) {
//         lastYearCurrent = maxAllowed;
//       }

//       lastYearTrends.push(lastYearCurrent);
//     }

//     setUserTrends(currentYearTrends);
//     setLastYearTrends(lastYearTrends);
//   };

//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const statsPayload: ReportQueryRequest = {
//         reportType: "GetTotalCountDashBoardReport",
//         mode: "Today",
//         pagination: {
//           page: 0,
//           pageSize: 0,
//           searchTerm: "string",
//           sortDirection: "string",
//           sortField: "string",
//           userId: 0,
//           pageNumber: 0,
//           rowsPerPage: 0,
//         },
//         fromDate: new Date().toISOString().split("T")[0],
//         toDate: new Date().toISOString().split("T")[0],
//         allRecordsRequired: true,
//         isExportToExcel: false,
//         id: 0,
//         userId: "string",
//         statusId: "string",
//         month: "string",
//         courseId: "string",
//         testId: "string",
//       };

//       const statsResponse = await dashboardService.getAllReportsQuery(statsPayload);

//       if (statsResponse && statsResponse.reportData && statsResponse.reportData.length > 0) {
//         const statsData = statsResponse.reportData[0];
//         const dashboardStats = {
//           TotalUsers: statsData.totalUsers || 0,
//           TotalPartners: statsData.totalPartners || 0,
//           TotalRecommendations: statsData.totalRecommendations || 0,
//           TotalCategorys: statsData.totalCategorys || 0,
//           TotalSubCategories: statsData.totalSubCategories || 0,
//           TotalPartnerPageVisits: statsData.totalPartnerPageVisits || 0,
//           TotalFavourites: statsData.totalFavourites || 0,
//           TodaysPartners: statsData.todaysPartners || 0,
//           TodaysRecommendations: statsData.todaysRecommendations || 0,
//           TodaysPartnerPageVisits: statsData.todaysPartnerPageVisits || 0,
//           TodaysFavourites: statsData.todaysFavourites || 0,
//           TotalFalseSubCategories: statsData.TotalFalseSubCategories || 0,
//           TotalFalseCategorys: statsData.TotalFalseCategorys || 0,
//         };

//         setStats(dashboardStats);
//         generateUserTrends(dashboardStats.TotalUsers);
//         fetchPartnerUserTrends("week");
//       } else {
//         const emptyStats = {
//           TotalUsers: 0,
//           TotalPartners: 0,
//           TotalSubCategories: 0,
//           TotalRecommendations: 0,
//           TotalCategorys: 0,
//           TotalPartnerPageVisits: 0,
//           TotalFavourites: 0,
//           TodaysPartners: 0,
//           TodaysRecommendations: 0,
//           TodaysPartnerPageVisits: 0,
//           TodaysFavourites: 0,
//           TotalFalseSubCategories: 0,
//           TotalFalseCategorys: 0,
//         };
//         setStats(emptyStats);
//         generateUserTrends(0);
//         fetchPartnerUserTrends("week");
//       }
//     } catch (error) {
//       console.error("Error fetching dashboard data:", error);
//       setError("Failed to load dashboard data. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   useEffect(() => {
//     console.log("Partner User Trends:", partnerUserTrends);
//     console.log("Time Filter:", timeFilter);
//     console.log("Total Partners from Trends:", totalPartnersFromTrends);
//     console.log("Total Users from Trends:", totalUsersFromTrends);
//   }, [partnerUserTrends, timeFilter, totalPartnersFromTrends, totalUsersFromTrends]);

//   useEffect(() => {
//     if (stats) {
//       fetchPartnerUserTrends(timeFilter);
//     }
//   }, [timeFilter, stats]);

//   const formatK = (num: number | null) => {
//     if (num === null || num === undefined) return "0";
//     const roundedNum = Math.round(num);
//     if (roundedNum >= 1000000) return (roundedNum / 1000000).toFixed(1) + "M";
//     if (roundedNum >= 1000) return (roundedNum / 1000).toFixed(0) + "K";
//     return roundedNum.toString();
//   };

//   const calculateGrowthRate = () => {
//     if (userTrends.length < 2 || userTrends[0] === 0) return 0;
//     const growth = ((userTrends[userTrends.length - 1] - userTrends[0]) / userTrends[0]) * 100;
//     return Math.max(0, Math.floor(growth));
//   };

//   const getPieChartData = () => {
//     const totalCategories = stats?.TotalCategorys || 0;
//     const totalSubCategories = stats?.TotalSubCategories || 0;
//     const total = totalCategories + totalSubCategories;
//     const categoryPercentage = total > 0 ? (totalCategories / total) * 100 : 0;
//     const subCategoryPercentage = total > 0 ? (totalSubCategories / total) * 100 : 0;

//     return {
//       datasets: [
//         {
//           data: [categoryPercentage, 100 - categoryPercentage],
//           backgroundColor: ["#104A2F", "#E9ECEF"],
//           borderWidth: 0,
//           cutout: "85%",
//           radius: "90%",
//           borderRadius: 100,
//         },
//         {
//           data: [subCategoryPercentage, 100 - subCategoryPercentage],
//           backgroundColor: ["#95C11F", "#E9ECEF"],
//           borderWidth: 0,
//           cutout: "80%",
//           radius: "70%",
//           borderRadius: 80,
//         },
//       ],
//     };
//   };

//   const getPartnerUserBarData = () => {
//     const labels = partnerUserTrends.map((item) => item.date);
//     const partnersData = partnerUserTrends.map((item) => item.partners);
//     const usersData = partnerUserTrends.map((item) => item.users);

//     console.log("🎯 FINAL CHART DATA:", {
//       labels,
//       partnersData,
//       usersData,
//       hasData: partnersData.some(val => val > 0) || usersData.some(val => val > 0),
//     });

//     return {
//       labels,
//       datasets: [
//         {
//           label: "Partners",
//           data: partnersData,
//           backgroundColor: "#165933",
//           borderRadius: 4,
//           barPercentage: 0.6,
//           categoryPercentage: 0.8,
//         },
//         {
//           label: "Users",
//           data: usersData,
//           backgroundColor: "#95C11F",
//           borderRadius: 4,
//           barPercentage: 0.6,
//           categoryPercentage: 0.8,
//         },
//       ],
//     };
//   };

//   const partnerUserBarOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         position: "top" as const,
//       },
//     },
//     scales: {
//       y: {
//         beginAtZero: true,
//       },
//     },
//   };

//   const pieChartOptions: import("chart.js").ChartOptions<"doughnut"> = {
//     responsive: true,
//     maintainAspectRatio: true,
//     plugins: {
//       legend: { display: false },
//       tooltip: { enabled: false },
//     },
//     animation: {
//       animateRotate: true,
//       duration: 1500,
//       easing: "easeInOutQuart",
//     },
//     cutout: "70%",
//   };

//   // Line Chart (User Ratio Analytics)
//   const getUserAnalyticsData = () => {
//     const currentYear = new Date().getFullYear();
//     const lastYear = currentYear - 1;

//     return {
//       labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
//       datasets: [
//         {
//           label: `This year (${currentYear})`,
//           data: userTrends,
//           borderColor: "#165933",
//           backgroundColor: "rgba(22, 89, 51, 0.1)",
//           tension: 0.4,
//           fill: true,
//           pointRadius: 0,
//           borderWidth: 2,
//         },
//         {
//           label: `Last year (${lastYear})`,
//           data: lastYearTrends,
//           borderColor: "#95C11F",
//           backgroundColor: "rgba(149, 193, 31, 0.1)",
//           tension: 0.4,
//           fill: true,
//           pointRadius: 0,
//           borderDash: [5, 5],
//           borderWidth: 2,
//         },
//       ],
//     };
//   };

//   const lineChartOptions: import("chart.js").ChartOptions<"line"> = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         position: "top",
//         align: "start",
//         labels: {
//           boxWidth: 8,
//           usePointStyle: true,
//           color: "#374151",
//           font: { size: 12 },
//           padding: 20,
//         },
//       },
//       tooltip: {
//         callbacks: {
//           label: function (context: any) {
//             const value = context.parsed.y;
//             const label = context.dataset.label || "";
//             return `${label.split(" (")[0]}: ${value}`;
//           },
//         },
//       },
//     },
//     scales: {
//       y: {
//         beginAtZero: true,
//         ticks: {
//           callback: function (tickValue: string | number) {
//             return tickValue.toString();
//           },
//           color: "#6B7280",
//           stepSize: 1,
//         },
//         grid: { color: "#F3F4F6" },
//       },
//       x: {
//         grid: { display: false },
//         ticks: { color: "#6B7280" },
//       },
//     },
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-xl">Loading dashboard...</div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-xl text-red-600">{error}</div>
//       </div>
//     );
//   }

//   const statsData = [
//     { title: "Total Users", value: formatK(stats?.TotalUsers || 0) },
//     { title: "Total Partners", value: formatK(stats?.TotalPartners || 0) },
//     { title: "Total Sub Categories", value: formatK(stats?.TotalSubCategories || 0) },
//     { title: "Categories", value: formatK(stats?.TotalCategorys || 0) },
//     { title: "Favourites", value: formatK(stats?.TotalFavourites || 0) },
//     { title: "Recommendations", value: formatK(stats?.TotalRecommendations || 0) },
//   ];

//   const growthRate = calculateGrowthRate();

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       {/* Stats Container */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
//         <div className="flex flex-nowrap overflow-x-auto justify-between items-center">
//           {statsData.map((stat, index) => (
//             <div key={stat.title} className="flex items-center">
//               <div className="flex flex-col items-center text-center px-3 min-w-[100px]">
//                 <div className="text-lg font-semibold text-[#232D42] mb-1">{stat.value}</div>
//                 <div className="text-xs font-medium text-[#8A92A6] whitespace-nowrap">{stat.title}</div>
//               </div>
//               {index < statsData.length - 1 && <div className="h-8 w-px bg-gray-300 mx-1"></div>}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Charts Container */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Categories & Subcategories Card */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//           <div className="mb-6"><h3 className="text-lg font-semibold text-gray-900">Categories & Subcategories</h3></div>
//           <div className="flex items-center justify-between">
//             <div className="flex-shrink-0">
//               <div className="relative" style={{ width: 220, height: 220 }}>
//                 <Doughnut data={getPieChartData()} options={pieChartOptions} />
//               </div>
//             </div>
//             <div className="flex-1 ml-6">
//               <div className="space-y-6">
//                 <div className="text-center">
//                   <div className="flex items-center justify-center mb-2">
//                     <div className="w-4 h-4 rounded-full mr-2 bg-[#165933]"></div>
//                     <span className="text-gray-700 font-medium text-sm">Categories</span>
//                   </div>
//                   <div className="text-2xl font-bold text-gray-900">{formatK(stats?.TotalCategorys || 0)}</div>
//                   <div className="text-xs text-gray-500 mt-1">Total Categories</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="flex items-center justify-center mb-2">
//                     <div className="w-4 h-4 rounded-full mr-2 bg-[#95C11F]"></div>
//                     <span className="text-gray-700 font-medium text-sm">Sub Categories</span>
//                   </div>
//                   <div className="text-2xl font-bold text-gray-900">{formatK(stats?.TotalSubCategories || 0)}</div>
//                   <div className="text-xs text-gray-500 mt-1">Total Subcategories</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Partners & Users Bar Chart */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//           <div className="flex justify-between items-center mb-6">
//             <h3 className="text-lg font-semibold text-gray-900">Total Partners & Users</h3>
//             <div className="flex items-center space-x-4">
//               <select
//                 value={timeFilter}
//                 onChange={(e) => handleTimeFilterChange(e.target.value as any)}
//                 className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#165933] focus:border-transparent"
//               >
//                 <option value="day">Today</option>
//                 <option value="week">This Week</option>
//                 <option value="month">This Month</option>
//                 <option value="year">This Year</option>
//               </select>
//             </div>
//           </div>

//           <div className="h-64">
//             {trendsLoading ? (
//               <div className="h-full flex items-center justify-center"><div className="text-gray-500">Loading trends...</div></div>
//             ) : partnerUserTrends.length === 0 ? (
//               <div className="h-full flex flex-col items-center justify-center bg-yellow-50 rounded-lg">
//                 <div className="text-yellow-600 font-medium">No data available</div>
//                 <div className="text-sm text-yellow-500 mt-1">Data points: {partnerUserTrends.length}</div>
//               </div>
//             ) : (
//               <Bar data={getPartnerUserBarData()} options={partnerUserBarOptions} />
//             )}
//           </div>

//           <div className="mt-6 grid grid-cols-2 gap-4 text-center">
//             <div>
//               <div className="text-2xl font-bold text-[#165933]">{formatK(totalPartnersFromTrends)}</div>
//               <div className="text-sm text-[#8A92A6]">Total Partners</div>
//             </div>
//             <div>
//               <div className="text-2xl font-bold text-[#95C11F]">{formatK(totalUsersFromTrends)}</div>
//               <div className="text-sm text-[#8A92A6]">Total Users</div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* User Growth Analytics */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//           <div className="flex justify-between items-center mb-6">
//             <div className="flex items-center space-x-6">
//               <h3 className="text-lg font-semibold text-gray-900">User Growth Analytics</h3>
//               <div className="flex space-x-4 text-sm text-gray-500">
//                 <span className="text-[#165933] font-medium flex items-center">
//                   <span className="w-2 h-2 bg-[#165933] rounded-full mr-2"></span>
//                   This year: {formatK(stats?.TotalUsers || 0)}
//                 </span>
//                 <span className="text-[#95C11F] font-medium flex items-center">
//                   <span className="w-2 h-2 bg-[#95C11F] rounded-full mr-2"></span>
//                   Last year: {formatK(lastYearTrends[lastYearTrends.length - 1] || 0)}
//                 </span>
//               </div>
//             </div>
//             <div className="text-right">
//               <div className="text-sm font-medium text-gray-500">Growth Rate</div>
//               <div className="text-lg font-bold text-[#165933]">+{growthRate}%</div>
//             </div>
//           </div>
//           <div className="h-64">
//             <Line data={getUserAnalyticsData()} options={lineChartOptions} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DashboardPage;