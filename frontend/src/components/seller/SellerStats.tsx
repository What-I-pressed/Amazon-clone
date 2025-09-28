import React, { useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { ChevronDownIcon } from "../../icons";

interface SellerStatsProps {
  totalRevenue?: number;
  avgFeedback?: number;
  reviewsCount?: number;
  totalOrders?: number;
  salesData?: {
    weekly?: { labels: string[]; data: number[] };
    monthly?: { labels: string[]; data: number[] };
    yearly?: { labels: string[]; data: number[] };
  } | null;
  showChart?: boolean;
}

type TimeFilter = "weekly" | "monthly" | "yearly";

const defaultSalesData = {
  weekly: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    data: [0, 0, 0, 0, 0, 0, 0],
  },
  monthly: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    data: Array(12).fill(0),
  },
  yearly: {
    labels: ["2020", "2021", "2022", "2023", "2024"],
    data: Array(5).fill(0),
  },
};

export const SellerStats: React.FC<SellerStatsProps> = ({
  totalRevenue = 0,
  avgFeedback = 0,
  reviewsCount = 0,
  totalOrders = 0,
  salesData,
}) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("monthly");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const resolvedSalesData = salesData ?? defaultSalesData;
  const hasSalesData = Boolean(
    salesData &&
      Object.values(salesData).some((entry) => entry && entry.data && entry.data.some((value) => value > 0))
  );

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getChartOptions = (): ApexOptions => {
    const currentData = resolvedSalesData[timeFilter];
    
    return {
      colors: ["#465fff"],
      chart: {
        fontFamily: "Outfit, sans-serif",
        type: "bar",
        height: 280,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "60%",
          borderRadius: 6,
          borderRadiusApplication: "end",
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      xaxis: {
        categories: currentData?.labels || [],
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          style: {
            fontSize: "12px",
            colors: "#6B7280",
          },
        },
      },
      yaxis: {
        title: {
          text: "Sales ($)",
          style: {
            fontSize: "12px",
            color: "#6B7280",
          },
        },
        labels: {
          style: {
            fontSize: "12px",
            colors: "#6B7280",
          },
          formatter: (value) => formatCurrency(value),
        },
      },
      grid: {
        borderColor: "#E5E7EB",
        strokeDashArray: 4,
        xaxis: {
          lines: {
            show: false,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
      fill: {
        opacity: 1,
        type: "gradient",
        gradient: {
          shade: "light",
          type: "vertical",
          shadeIntensity: 0.1,
          gradientToColors: ["#465fff"],
          inverseColors: false,
          opacityFrom: 0.8,
          opacityTo: 0.2,
        },
      },
      tooltip: {
        y: {
          formatter: (value) => formatCurrency(value),
        },
        theme: "dark",
      },
    };
  };

  const getChartSeries = () => {
    const currentData = resolvedSalesData[timeFilter];
    return [
      {
        name: "Sales",
        data: currentData?.data || [],
      },
    ];
  };

  const getFilterLabel = (filter: TimeFilter): string => {
    switch (filter) {
      case "weekly":
        return "This Week";
      case "monthly":
        return "This Month";
      case "yearly":
        return "This Year";
      default:
        return "This Month";
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  const handleFilterChange = (filter: TimeFilter) => {
    setTimeFilter(filter);
    closeDropdown();
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Sales Statistics
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track your sales performance over time
          </p>
        </div>
        
        {/* Income Display */}
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
          <p className="text-2xl font-bold text-brand-500">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
      </div>

      {/* Filter Dropdown */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          {getFilterLabel(timeFilter)} Sales
        </h3>
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {getFilterLabel(timeFilter)}
            <ChevronDownIcon className="w-4 h-4" />
          </button>

          <Dropdown
            isOpen={isDropdownOpen}
            onClose={closeDropdown}
            className="w-40 p-2 mt-1"
          >
            <DropdownItem
              onItemClick={() => handleFilterChange("weekly")}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              This Week
            </DropdownItem>
            <DropdownItem
              onItemClick={() => handleFilterChange("monthly")}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              This Month
            </DropdownItem>
            <DropdownItem
              onItemClick={() => handleFilterChange("yearly")}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              This Year
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full">
        {hasSalesData ? (
          <div className="max-w-full overflow-x-auto custom-scrollbar">
            <div className="min-w-[600px] xl:min-w-full">
              <Chart
                options={getChartOptions()}
                series={getChartSeries()}
                type="bar"
                height={280}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-40 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
            No sales trend data available yet.
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Average Rating</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {avgFeedback ? avgFeedback.toFixed(2) : "—"}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Reviews</p>
          <p className="text-lg font-semibold text-green-600 dark:text-green-400">
            {reviewsCount}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
          <p className="text-lg font-semibold text-brand-500">
            {totalOrders}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SellerStats;
