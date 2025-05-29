import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { Users, MessageCircle, Package } from "lucide-react";
import { FaRupeeSign } from "react-icons/fa";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface DashboardData {
  usersCount: number;
  activeUsers: number;
  inactiveUsers: number;
  productsCount: number;
  enquiriesCount: number;
  reportsCount: number; // Not provided by APIs, set to 0
  totalRevenue: number;
  monthlyRevenue: { month: string; revenue: number }[];
  monthlyEnquiries: { month: string; enquiries: number }[];
}

interface CardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

interface DashboardProps {
  refreshTrigger?: number; // Prop to trigger re-fetch on client list changes
}

const InfoCard: React.FC<CardProps> = ({ title, value, icon }) => (
  <div className="bg-gray-50 shadow rounded-lg flex items-center justify-between p-5">
    <div>
      <h2 className="text-lg font-medium text-gray-600">{title}</h2>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
    <div className="bg-blue-900 text-white rounded-full p-3">{icon}</div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ refreshTrigger = 0 }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch client list to count active clients
        const clientResponse = await axiosInstance.get(`${API_URL}/fetchClient`);
        console.log('Dashboard /fetchClient Response:', clientResponse.data);
        const activeClientCount = clientResponse.data.data?.filter((client: any) => client.user_status === 'Active').length || 0;
        console.log('Dashboard Active Client Count:', activeClientCount);

        // Fetch dashboard metrics
        const metricsResponse = await axiosInstance.get(`${API_URL}/dashboardmetrics`);
        console.log('Dashboard Metrics Response:', metricsResponse.data);
        const metricsData = metricsResponse.data.data; // Single object in array

        // Fetch monthly revenue
        const revenueResponse = await axiosInstance.get(`${API_URL}/getMonthalyRevenue`);
        console.log('Monthly Revenue Response:', revenueResponse.data);
        const monthlyRevenue = revenueResponse.data.data.map((item: any) => ({
          month: new Date(item.revenue_month).toLocaleString('default', { month: 'long', year: 'numeric' }),
          revenue: item.total_revenue,
        }));

        // Fetch monthly enquiries
        const enquiriesResponse = await axiosInstance.get(`${API_URL}/getMonthalyEnquiry`);
        console.log('Monthly Enquiries Response:', enquiriesResponse.data);
        const monthlyEnquiries = enquiriesResponse.data.data.map((item: any) => ({
          month: new Date(item.enquiry_month).toLocaleString('default', { month: 'long', year: 'numeric' }),
          enquiries: item.total_enquiries,
        }));

        // Fetch active/inactive clients percentage
        const clientsResponse = await axiosInstance.get(`${API_URL}/getActiveInactiveClientsPer`);
        console.log('Active/Inactive Clients Response:', clientsResponse.data);
        const clientsData = clientsResponse.data.data[0]; // Single object in array

        // Combine data into DashboardData structure
        const dashboardData: DashboardData = {
          usersCount: activeClientCount, // Count only active clients
          activeUsers: clientsData.active_clients,
          inactiveUsers: clientsData.inactive_clients,
          productsCount: metricsData.total_products,
          enquiriesCount: metricsData.total_enquiries,
          reportsCount: 0, // Not provided by any API, set to 0
          totalRevenue: metricsData.total_revenue,
          monthlyRevenue,
          monthlyEnquiries,
        };

        setData(dashboardData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [API_URL, refreshTrigger]); // Re-fetch on API_URL or refreshTrigger change

  if (loading) return <p className="p-6 text-gray-600">Loading dashboard...</p>;
  if (error || !data) return <p className="p-6 text-red-500">{error || 'Failed to load data'}</p>;

  const revenueChartOptions: ApexOptions = {
    chart: { id: "monthly-revenue-chart", toolbar: { show: false } },
    xaxis: { categories: data.monthlyRevenue.map((item) => item.month) },
    dataLabels: { enabled: true },
    plotOptions: { bar: { horizontal: false, columnWidth: "50%" } },
    title: { text: "Monthly Revenue", align: "center", style: { fontSize: "18px", fontWeight: "bold" } },
  };

  const revenueChartSeries = [
    { name: "Revenue", data: data.monthlyRevenue.map((item) => item.revenue) },
  ];

  const clientDonutOptions: ApexOptions = {
    chart: { type: "donut" },
    labels: ["Active Clients", "Inactive Clients"],
    title: { text: "Client Distribution", align: "center", style: { fontSize: "18px" } },
  };

  const clientDonutSeries = [data.activeUsers, data.inactiveUsers];

  const enquiriesBarOptions: ApexOptions = {
    chart: { id: "monthly-enquiries-chart", toolbar: { show: false } },
    xaxis: { categories: data.monthlyEnquiries.map((item) => item.month) },
    dataLabels: { enabled: true },
    title: { text: "Monthly Enquiries", align: "center", style: { fontSize: "18px" } },
  };

  const enquiriesBarSeries = [
    { name: "Enquiries", data: data.monthlyEnquiries.map((item) => item.enquiries) },
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <InfoCard
          title="Total Revenue"
          value={`₹${(data.totalRevenue / 1000).toFixed(0)}K`}
          icon={<FaRupeeSign className="w-6 h-6" />}
        />
        <InfoCard
          title="Total Active Clients"
          value={data.usersCount}
          icon={<Users className="w-6 h-6" />}
        />
        <InfoCard
          title="Total Enquiry"
          value={data.enquiriesCount}
          icon={<MessageCircle className="w-6 h-6" />}
        />
        <InfoCard
          title="Total Products"
          value={data.productsCount}
          icon={<Package className="w-6 h-6" />}
        />
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <Chart options={revenueChartOptions} series={revenueChartSeries} type="bar" height={350} />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="bg-white shadow rounded-lg p-6 w-full lg:w-1/2">
          <Chart options={clientDonutOptions} series={clientDonutSeries} type="donut" height={350} />
        </div>
        <div className="bg-white shadow rounded-lg p-6 w-full lg:w-1/2">
          <Chart options={enquiriesBarOptions} series={enquiriesBarSeries} type="bar" height={350} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;