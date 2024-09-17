import React, { useEffect, useState } from "react";
import { List, Typography } from "antd";
import {
  TeamOutlined,
  ShopOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import axiosInstance from "../../axiosConfig";
import Preloader from "../components/Preloader";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const { Title: AntdTitle } = Typography;

const Home: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [totalCompanies, setTotalCompanies] = useState<number>(0);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [countryChartData, setCountrySetData] = useState<any[]>([]);
  const [productChartData, setProductChartData] = useState<any[]>([]);

  const fetchProductData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/product/chart-data");
      setProductChartData(response.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCountryData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/company/chart-data");
      setCountrySetData(response.data);
    } catch (error) {
      console.error("Failed to fetch countries:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/company");
      setCompanies(response.data?.companies || []);
      setTotalCompanies(response.data?.totalCompanies || 0);
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/product");
      setProducts(response.data?.products || []);
      setTotalProducts(response.data?.totalProducts || 0);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchProducts();
    fetchCountryData();
    fetchProductData();
  }, []);

  // Bar chart data
  const chartData = {
    labels: countryChartData.map((data: any) => data.country),
    datasets: [
      {
        label: "Counts",
        data: countryChartData.map((data: any) => data.count),
        backgroundColor: [
          "#387BBF",
          "#5566B0",
          "#774CA1",
          "#B844A5",
          "#EE3EAA",
        ],
        borderColor: ["#387BBF", "#5566B0", "#774CA1", "#B844A5", "#EE3EAA"],
        borderWidth: 1,
      },
    ],
  };

  // Bar chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Overview of Companies by Country",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  // Pie chart data
  const pieChartData = {
    labels: productChartData?.map((data: any) => data.category),
    datasets: [
      {
        data: productChartData?.map((data: any) => data.amount),
        backgroundColor: [
          "#3c8dbc",
          "#5ea54a",
          "#5566B0",
          "#774CA1",
          "#B844A5",
          "#f39c12",
          "#d81b60",
          "#00c0ef",
          "#387BBF",
          "#EE3EAA",
        ],
        hoverBackgroundColor: [
          "#3c8dbc",
          "#5ea54a",
          "#387BBF",
          "#5566B0",
          "#774CA1",
          "#f39c12",
          "#d81b60",
          "#00c0ef",
          "#B844A5",
          "#EE3EAA",
        ],
      },
    ],
  };

  // Pie chart options
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 1.5,
    plugins: {
      legend: {
        position: "right",
      },
      title: {
        display: true,
        text: "Distribution of Companies and Products",
      },
    },
  };

  return (
    <div className="container mx-auto dark:bg-gray-900">
      {loading ? (
        <Preloader />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Last Added Companies */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <AntdTitle level={4} className="dark:text-gray-200">
                Last Added Companies
              </AntdTitle>
              <List
                dataSource={companies.slice(0, 3)}
                renderItem={(company) => (
                  <List.Item className="border-b py-2 last:border-none dark:border-gray-700">
                    <Typography.Text className="text-sm dark:text-gray-300">
                      {company.name}
                    </Typography.Text>
                  </List.Item>
                )}
              />
            </div>

            {/* Last Added Products */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <AntdTitle level={4} className="dark:text-gray-200">
                Last Added Products
              </AntdTitle>
              <List
                dataSource={products.slice(0, 3)} // Display last 3 products
                renderItem={(product) => (
                  <List.Item className="border-b py-2 last:border-none dark:border-gray-700">
                    <Typography.Text className="text-sm dark:text-gray-300">
                      {product.name}
                    </Typography.Text>
                  </List.Item>
                )}
              />
            </div>

            {/* Total Companies */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 flex lg:flex-row md:flex-col flex-row items-center gap-2 justify-between">
              <div>
                <TeamOutlined className="text-blue-500 lg:text-4xl md:text-3xl text-4xl" />
              </div>
              <div className="lg:text-right md:text-center text-right ">
                <AntdTitle
                  level={4}
                  className="m-0 text-text-2 md:text-3xl sm:text-xl break-words dark:text-gray-200"
                >
                  Total Companies
                </AntdTitle>
                <p className="text-2xl font-semibold text-text-3 dark:text-gray-300">
                  {totalCompanies}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 flex lg:flex-row md:flex-col flex-row items-center gap-2 justify-between">
              <div>
                <ShopOutlined className="text-green-500 lg:text-4xl md:text-3xl text-4xl" />
              </div>
              <div className="lg:text-right md:text-center text-right ">
                <AntdTitle
                  level={4}
                  className="m-0 text-text-2 md:text-3xl sm:text-xl break-words dark:text-gray-200"
                >
                  Total Products
                </AntdTitle>
                <p className="text-2xl font-semibold text-text-3 dark:text-gray-300">
                  {totalProducts}
                </p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {/* Bar Chart */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <AntdTitle level={4} className="dark:text-gray-200">
                Companies Overview by Country
              </AntdTitle>
              {countryChartData.length === 0 ? (
                <div className="flex items-center justify-center h-full flex-col p-10">
                  <InboxOutlined className="text-gray-400 dark:text-gray-500 text-6xl" />
                  <p className="text-gray-400 dark:text-gray-500">
                    No data available
                  </p>
                </div>
              ) : (
                <Bar data={chartData} options={chartOptions} />
              )}
            </div>

            {/* Pie Chart */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <AntdTitle level={4} className="dark:text-gray-200">
                Distribution of Companies and Products
              </AntdTitle>
              {productChartData.length === 0 ? (
                <div className="flex items-center justify-center h-full flex-col p-10">
                  <InboxOutlined className="text-gray-400 dark:text-gray-500 text-6xl" />
                  <p className="text-gray-400 dark:text-gray-500">
                    No data available
                  </p>
                </div>
              ) : (
                <div style={{ height: "300px" }}>
                  <Pie data={pieChartData} options={pieChartOptions} />
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
