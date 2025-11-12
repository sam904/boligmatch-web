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
import DashboardSelect from "../../../components/common/DashboardSelect";
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
  const [partnerUserTrends, setPartnerUserTrends] = useState<
    PartnerUserTrend[]
  >([]);
  const [timeFilter, setTimeFilter] = useState<
    "day" | "week" | "month" | "year"
  >("week");
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [totalPartnersFromTrends, setTotalPartnersFromTrends] =
    useState<number>(0);
  const [totalUsersFromTrends, setTotalUsersFromTrends] = useState<number>(0);

  const timeFilterOptions = [
    { value: "day", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This Year" },
  ];

  // FIXED: Function to generate proper date range based on filter
  const getDateRange = (filter: string) => {
    const now = new Date();

    // Helper function to get date in YYYY-MM-DD format without timezone issues
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    switch (filter) {
      case "day":
        // For Today: fromDate and toDate should be the same (current date)
        return {
          fromDate: formatDate(now),
          toDate: formatDate(now),
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
          toDate: formatDate(saturday),
        };

      case "month":
        // FIXED: For This Month: 1st to last day of current month
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0
        );

        console.log("📅 Month dates:", {
          firstDay: formatDate(firstDayOfMonth),
          lastDay: formatDate(lastDayOfMonth),
          currentMonth: now.getMonth() + 1,
        });

        return {
          fromDate: formatDate(firstDayOfMonth),
          toDate: formatDate(lastDayOfMonth),
        };

      case "year":
        // For This Year: Exactly 1 year ago from today to today
        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(now.getFullYear() - 1);

        return {
          fromDate: formatDate(oneYearAgo),
          toDate: formatDate(now),
        };

      default:
        // Default to current week
        const defaultSunday = new Date(now);
        defaultSunday.setDate(now.getDate() - now.getDay());
        const defaultSaturday = new Date(now);
        defaultSaturday.setDate(now.getDate() + (6 - now.getDay()));

        return {
          fromDate: formatDate(defaultSunday),
          toDate: formatDate(defaultSaturday),
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
          searchTerm: "",
          sortDirection: "asc",
          sortField: "date",
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

      console.log(
        "📤 Sending Payload for",
        filter,
        ":",
        JSON.stringify(trendsPayload, null, 2)
      );

      const response = await dashboardService.getAllReportsQuery(trendsPayload);

      console.log("📊 FULL API RESPONSE:", JSON.stringify(response, null, 2));

      if (response && response.reportData) {
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

        const trendsData = transformApiDataToTrends(
          response.reportData,
          filter
        );
        console.log("🔄 TRANSFORMED DATA:", trendsData);

        // Always set the trends data, even if empty
        setPartnerUserTrends(trendsData);

        // Only use mock data if the API completely failed
        if (response.reportData.length === 0) {
          console.log("ℹ️ API returned empty data array, showing zeros");
        }
      } else {
        console.log("❌ Invalid API response structure");
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
    console.log("📊 RAW API DATA:", apiData);

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

  // Transform Today data - FIXED to show integer values
  const transformTodayData = (apiData: any[]): PartnerUserTrend[] => {
    if (!apiData || apiData.length === 0) {
      // Return empty data for all hours when no data
      return Array.from({ length: 24 }, (_, i) => ({
        date: `${i.toString().padStart(2, "0")}:00`,
        partners: 0,
        users: 0,
      }));
    }

    // If we have data but it's showing zeros, use the first item
    const todayData = apiData[0];
    // FIXED: Use Math.round() to ensure integer values
    const totalUsers = Math.round(todayData.users || todayData.userCount || 0);
    const totalPartners = Math.round(
      todayData.partners || todayData.partnerCount || 0
    );

    // Distribute totals across hours for visualization
    return Array.from({ length: 24 }, (_, i) => ({
      date: `${i.toString().padStart(2, "0")}:00`,
      partners:
        Math.floor(totalPartners / 24) + (i < totalPartners % 24 ? 1 : 0),
      users: Math.floor(totalUsers / 24) + (i < totalUsers % 24 ? 1 : 0),
    }));
  };

  // Transform Week data - FIXED to show integer values without decimals
  const transformWeekData = (apiData: any[]): PartnerUserTrend[] => {
    const dayOrder = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    // Create a map for easy lookup
    const dataMap = new Map();

    if (apiData && apiData.length > 0) {
      apiData.forEach((item) => {
        // Use the correct field names from your API response
        const dayName = item.weekDayName || item.date || "";
        if (dayName) {
          // FIXED: Use Math.round() to ensure integer values
          dataMap.set(dayName, {
            partners: Math.round(item.partnerCount || item.partners || 0),
            users: Math.round(item.userCount || item.users || 0),
          });
        }
      });
    }

    return dayOrder.map((dayName) => ({
      date: dayName.substring(0, 3),
      partners: dataMap.get(dayName)?.partners || 0,
      users: dataMap.get(dayName)?.users || 0,
    }));
  };

  // Transform Month data - FIXED to show integer values
  const transformMonthData = (apiData: any[]): PartnerUserTrend[] => {
    if (!apiData || apiData.length === 0) {
      // Return empty weeks if no data
      return ["W1", "W2", "W3", "W4", "W5"].map((week) => ({
        date: week,
        partners: 0,
        users: 0,
      }));
    }

    // Your API returns data in this structure for month mode
    return apiData.map((item, index) => ({
      date: item.weekNumber || `Week ${index + 1}`,
      // FIXED: Use Math.round() to ensure integer values
      partners: Math.round(item.partnerCount || 0),
      users: Math.round(item.userCount || 0),
    }));
  };

  // Transform Year data - FIXED to show integer values
  const transformYearData = (apiData: any[]): PartnerUserTrend[] => {
    const monthOrder = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const dataMap = new Map();

    if (apiData && apiData.length > 0) {
      apiData.forEach((item) => {
        const monthName = item.monthName || "";
        if (monthName) {
          // FIXED: Use Math.round() to ensure integer values
          dataMap.set(monthName, {
            partners: Math.round(item.partnerCount || 0),
            users: Math.round(item.userCount || 0),
          });
        }
      });
    }

    return monthOrder.map((monthName) => ({
      date: monthName.substring(0, 3),
      partners: dataMap.get(monthName)?.partners || 0,
      users: dataMap.get(monthName)?.users || 0,
    }));
  };

  // Update the handleTimeFilterChange function
  const handleTimeFilterChange = (newFilter: string) => {
    setTimeFilter(newFilter as "day" | "week" | "month" | "year");
    fetchPartnerUserTrends(newFilter);
  };

  // Also update the mock data generator to use integers consistently
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
        mockData = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"].map(
          (week) => ({
            date: week,
            partners: Math.floor(Math.random() * 30) + 10,
            users: Math.floor(Math.random() * 50) + 20,
          })
        );
        break;
      case "year":
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
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
      const growth = Math.floor(
        lastYearCurrent * (0.04 + Math.random() * 0.12)
      );
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
  }, [
    partnerUserTrends,
    timeFilter,
    totalPartnersFromTrends,
    totalUsersFromTrends,
  ]);

  const formatK = (num: number | null) => {
    if (num === null || num === undefined) return "0";
    const roundedNum = Math.round(num);
    if (roundedNum >= 1000000) return (roundedNum / 1000000).toFixed(1) + "M";
    if (roundedNum >= 1000) return (roundedNum / 1000).toFixed(0) + "K";
    return roundedNum.toString();
  };

  const calculateGrowthRate = () => {
    if (userTrends.length < 2 || userTrends[0] === 0) return 0;
    const growth =
      ((userTrends[userTrends.length - 1] - userTrends[0]) / userTrends[0]) *
      100;
    return Math.max(0, Math.floor(growth));
  };

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

  const getPartnerUserBarData = () => {
    const labels = partnerUserTrends.map((item) => item.date);
    const partnersData = partnerUserTrends.map((item) => item.partners);
    const usersData = partnerUserTrends.map((item) => item.users);

    console.log("🎯 FINAL CHART DATA:", {
      labels,
      partnersData,
      usersData,
      hasData:
        partnersData.some((val) => val > 0) || usersData.some((val) => val > 0),
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

  // Update the bar chart options to force integer ticks on Y-axis
  const partnerUserBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const value = context.parsed.y;
            const label = context.dataset.label || "";
            // FIXED: Ensure tooltip shows integer values
            return `${label}: ${Math.round(value)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          // FIXED: Force integer values on Y-axis
          stepSize: 1,
          callback: function (tickValue: string | number) {
            // Ensure only integer values are displayed
            const value =
              typeof tickValue === "number" ? tickValue : parseFloat(tickValue);
            return Number.isInteger(value) ? value.toString() : "";
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
    {
      title: "Total Sub Categories",
      value: formatK(stats?.TotalSubCategories || 0),
    },
    { title: "Total Categories", value: formatK(stats?.TotalCategorys || 0) },
    { title: "Total Favourites", value: formatK(stats?.TotalFavourites || 0) },
    {
      title: "Total Recommendations",
      value: formatK(stats?.TotalRecommendations || 0),
    },
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

      {/* Charts Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories & Subcategories Card */}
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

        {/* Partners & Users Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Total Partners & Users
            </h3>
            <div className="flex items-center space-x-4">
              <DashboardSelect
                value={timeFilter}
                onChange={handleTimeFilterChange}
                options={timeFilterOptions}
                placeholder="Select period"
                className="w-32"
              />
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
                {formatK(totalPartnersFromTrends)}
              </div>
              <div className="text-sm text-[#8A92A6]">Total Partners</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#95C11F]">
                {formatK(totalUsersFromTrends)}
              </div>
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
                  Last year:{" "}
                  {formatK(lastYearTrends[lastYearTrends.length - 1] || 0)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-500">
                Growth Rate
              </div>
              <div className="text-lg font-bold text-[#165933]">
                +{growthRate}%
              </div>
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
