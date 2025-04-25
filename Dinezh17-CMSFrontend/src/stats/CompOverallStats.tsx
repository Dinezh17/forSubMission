import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import api from "../interceptor/api";
import { useNavigate } from "react-router-dom";


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


interface CompetencyPerformance {
  rank: number;
  competency_code: string;
  competency_name: string;
  description: string;
  average_required_score: number;
  average_score: number;
  fulfillment_rate: number;
  total_evaluations: number;
  employees_meeting_required: number;
  performance_gap: number;
}

const OverallCompetencyDashboard: React.FC = () => {
  
  const [competencyData, setCompetencyData] = useState<CompetencyPerformance[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate overall statistics
  const calculateOverallStats = (data: CompetencyPerformance[]) => {
    if (!data.length) return { avgScore: 0, avgFulfillment: 0, avgGap: 0 };

    const avgScore =
      data.reduce((sum, item) => sum + item.average_score, 0) / data.length;
    const avgFulfillment =
      data.reduce((sum, item) => sum + item.fulfillment_rate, 0) / data.length;
    const avgGap =
      data.reduce((sum, item) => sum + item.performance_gap, 0) / data.length;

    return {
      avgScore: avgScore.toFixed(2),
      avgFulfillment: avgFulfillment.toFixed(2),
      avgGap: avgGap.toFixed(2),
    };
  };

  // Fetch competency performance data
  useEffect(() => {
    const fetchCompetencyData = async () => {
      setLoading(true);
      try {
        const response = await api.get("/stats/overall-competency-performance");
   
        
          setCompetencyData(response.data);
        
        
      } catch (err) {
        setError("Failed to fetch competency performance data");
        console.error("Error fetching competency data:", err);
        // Ensure competencyData is an empty array when there's an error
        setCompetencyData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompetencyData();
  }, []);

  // Only prepare chart data if competencyData is a valid array with items
  const prepareChartData = () => {
    if (!Array.isArray(competencyData) || competencyData.length === 0) {
      return {
        scoreChartData: { labels: [], datasets: [] },
        fulfillmentChartData: { labels: [], datasets: [] },
      };
    }

    // Prepare chart data for competency scores
    const scoreChartData = {
      labels: competencyData.map((comp) => comp.competency_code),
      datasets: [
        {
          label: "Average Score",
          data: competencyData.map((comp) => comp.average_score),
          backgroundColor: "rgba(54, 162, 235, 0.7)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
        {
          label: "Average Required Score",
          data: competencyData.map((comp) => comp.average_required_score),
          backgroundColor: "rgba(255, 99, 132, 0.7)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
      ],
    };

    // Prepare chart data for fulfillment rates
    const fulfillmentChartData = {
      labels: competencyData.map((comp) => comp.competency_code),
      datasets: [
        {
          label: "Fulfillment Rate (%)",
          data: competencyData.map((comp) => comp.fulfillment_rate),
          backgroundColor: "rgba(75, 192, 192, 0.7)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };

    return { scoreChartData, fulfillmentChartData };
  };

  // Get chart data
  const { scoreChartData, fulfillmentChartData } = prepareChartData();

  // Chart options
  const scoreChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Overall Competency Scores",
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 4,
        title: {
          display: true,
          text: "Score",
        },
      },
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  const fulfillmentChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Competency Fulfillment Rates",
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: "Fulfillment Rate (%)",
        },
      },
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  // Get overall statistics - ensure we're passing an array
  const overallStats = calculateOverallStats(
    Array.isArray(competencyData) ? competencyData : []
  );
  const navigate = useNavigate();
  return (
    <div className="font-sans max-w-[1500px] mx-auto p-5">
      <div className="pt-20 flex justify-center gap-4">
        <button
         className="bg-blue-600 text-white w-48 px-6 py-2 rounded-xl hover:bg-blue-700 transition"
          onClick={() => navigate("/employee-stats-overall")}
        >
          Overall
        </button>
        <button
         className="bg-blue-600 text-white w-48 px-6 py-2 rounded-xl hover:bg-blue-700 transition"
          onClick={() => navigate("/employee-stats-departmentwise")}
        >
          Department
        </button>
        <button
          className="bg-blue-600 text-white w-48 px-6 py-2 rounded-xl hover:bg-blue-700 transition"
          onClick={() => {
            navigate("/employee-stats-TLwise");
          }}
        >
          Team Lead wise          </button>
      </div>

      <h1 className="text-center text-3xl font-bold mt-8 mb-6">
        Overall Competency Performance
      </h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20">
          <p>Loading competency data...</p>
        </div>
      ) : Array.isArray(competencyData) && competencyData.length > 0 ? (
        <>
          {/* Overall Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            <div className="bg-gray-100 p-5 rounded-2xl text-center shadow-sm">
              <h3 className="font-semibold text-lg">Average Score</h3>
              <p className="text-2xl font-bold">{overallStats.avgScore}</p>
            </div>
            <div className="bg-gray-100 p-5 rounded-2xl text-center shadow-sm">
              <h3 className="font-semibold text-lg">
                Average Fulfillment Rate
              </h3>
              <p className="text-2xl font-bold">
                {overallStats.avgFulfillment}%
              </p>
            </div>
            <div className="bg-gray-100 p-5 rounded-2xl text-center shadow-sm">
              <h3 className="font-semibold text-lg">Average Performance Gap</h3>
              <p className="text-2xl font-bold">{overallStats.avgGap}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="pl-24 w-full h-[600px] overflow-x-auto">
            <Bar data={scoreChartData} options={scoreChartOptions} />
          </div>
          <div className="pl-24 w-full h-[600px] overflow-x-auto">
            <Bar
              data={fulfillmentChartData}
              options={fulfillmentChartOptions}
            />
          </div>

          {/* Top Performing */}
          <div className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">
              Top Performing Competencies
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
              {competencyData.slice(0, 3).map((comp) => (
                <div
                  key={comp.competency_code}
                  className="bg-blue-50 p-5 rounded-xl border-l-4 border-blue-500 pl-10"
                >
                  <h3 className="text-xl font-bold">{comp.competency_name}</h3>
                  <p>
                    <strong>Rank:</strong> {comp.rank}
                  </p>
                  <p>
                    <strong>Code:</strong> {comp.competency_code}
                  </p>
                  <p>
                    <strong>Score:</strong> {comp.average_score}/
                    {comp.average_required_score}
                  </p>
                  <p>
                    <strong>Fulfillment:</strong> {comp.fulfillment_rate}%
                  </p>
                  <p>
                    <strong>Gap:</strong>{" "}
                    <span
                      className={
                        comp.performance_gap >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {comp.performance_gap}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Needs Improvement */}
          <div className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">
              Areas Needing Improvement
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...competencyData]
                .reverse()
                .slice(0, 3)
                .map((comp) => (
                  <div
                    key={comp.competency_code}
                    className="bg-red-50 p-5 rounded-xl border-l-4 border-red-500 pl-10"
                  >
                    <h3 className="text-xl font-bold">
                      {comp.competency_name}
                    </h3>
                    <p>
                      <strong>Rank:</strong> {comp.rank}
                    </p>
                    <p>
                      <strong>Code:</strong> {comp.competency_code}
                    </p>
                    <p>
                      <strong>Score:</strong> {comp.average_score}/
                      {comp.average_required_score}
                    </p>
                    <p>
                      <strong>Fulfillment:</strong> {comp.fulfillment_rate}%
                    </p>
                    <p>
                      <strong>Gap:</strong>{" "}
                      <span className="text-red-600">
                        {comp.performance_gap}
                      </span>
                    </p>
                  </div>
                ))}
            </div>
          </div>

          {/* All Competencies */}
          <div className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">All Competencies</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-600 rounded-xl overflow-hidden">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="p-4 text-lg border border-gray-300">Rank</th>
                    <th className="p-4 text-lg border border-gray-300">Code</th>
                    <th className="p-4 text-lg border border-gray-300">
                      Competency
                    </th>
                    <th className="p-4 text-lg border border-gray-300">
                      Avg Required
                    </th>
                    <th className="p-4 text-lg border border-gray-300">
                      Average
                    </th>
                    <th className="p-4 text-lg border border-gray-300">Gap</th>
                    <th className="p-4 text-lg border border-gray-300">
                      Fulfillment
                    </th>
                    <th className="p-4 text-lg border border-gray-300">
                      Employees
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {competencyData.map((comp) => (
                    <tr
                      key={comp.competency_code}
                      // className="hover:bg-gray-200"
                    >
                      <td className="p-4 border border-gray-200 text-lg">
                        {comp.rank}
                      </td>
                      <td className="p-4 border border-gray-200 text-lg">
                        {comp.competency_code}
                      </td>
                      <td className="p-4 border border-gray-200 text-lg">
                        {comp.competency_name}
                      </td>
                      <td className="p-4 border border-gray-200 text-lg">
                        {comp.average_required_score}
                      </td>
                      <td className="p-4 border border-gray-200 text-lg">
                        {comp.average_score}
                      </td>
                      <td
                        className={`p-4 border border-gray-200 text-lg font-medium ${
                          comp.performance_gap <= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {comp.performance_gap}
                      </td>
                      <td className="p-4 border border-gray-200 text-lg">
                        {comp.fulfillment_rate}%
                      </td>
                      <td className="p-4 border border-gray-200 text-lg">
                        {comp.employees_meeting_required}/
                        {comp.total_evaluations}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-20">
          <p>No competency data available.</p>
        </div>
      )}
    </div>
  );
};

export default OverallCompetencyDashboard;
