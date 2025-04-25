import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import api from "../interceptor/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useNavigate } from "react-router-dom";


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


interface Competency {
  competency_code: string;
  competency_name: string;
  description: string;
  average_required_score: number;
  average_score: number;
  fulfillment_rate: number;
  employees_evaluated: number;
  employees_meeting_required: number;
  rank: number;
}

interface managerData {
  manager_name: string;
  overall_average_score: number;
  overall_fulfillment_rate: number;
  competencies: Competency[];
}

interface Manager {
  employee_number: string;
  employee_name: string;
}

const ManagerPerformanceDashboard: React.FC = () => {
  // State for departments list and selected department
  const [manager, setManager] = useState<Manager[]>([]);
  const [selectedManager, setSelectedManager] = useState<string | null>(null);
  const [competencies, setcompetencies] = useState<Competency[]>([]);

  const [managerData, setmanagerData] = useState<managerData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  // Fetch departments list on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get("/managers/");
        setManager(response.data);
        console.log(response.data);
        // Set first department as default selection if available
        if (response.data.length > 0) {
          setSelectedManager(response.data[0].employee_number);
        }
      } catch (err) {
        setError("Failed to fetch departments");
        console.error("Error fetching departments:", err);
      }
    };

    fetchDepartments();
  }, []);

  // Fetch department performance data when selected department changes
  useEffect(() => {
    if (!selectedManager) return;

    const fetchDepartmentData = async () => {
      setLoading(true);
      try {
        const response = await api.get(
          `/stats/manager-wise-performance/${selectedManager}`
        );
        // API returns data in format { department_code: { data } }

        const data = response.data[selectedManager];
        setmanagerData(data);
        setcompetencies(data.competencies);
        setError(null);
      } catch (err) {
        setError("Failed to fetch manager performance data");
        console.error("Error fetching manager data:", err);
        setmanagerData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartmentData();
  }, [selectedManager]);

  // Handle department selection change
  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedManager(e.target.value);
    console.log(parseInt(e.target.value));
  };

  // Prepare chart data
  const chartData = managerData
    ? {
        labels: managerData.competencies.map((comp) => comp.competency_code),
        datasets: [
          {
            label: "Average Score",
            data: managerData.competencies.map((comp) => comp.average_score),
            backgroundColor: "rgba(54, 162, 235, 0.7)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
          {
            label: "Average Required Score",
            data: managerData.competencies.map(
              (comp) => comp.average_required_score
            ),
            backgroundColor: "rgba(255, 99, 132, 0.7)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: managerData
          ? `${managerData.manager_name} Team-wise Competency Scores`
          : "Team-wise Competency Scores",
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

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "1500px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      <div
        style={{
          padding: "10px",
          marginTop: "70px",
          display: "flex",
          justifyContent: "center",
          gap: "16px",
        }}
      >
        <button
         className="bg-blue-600 text-white w-48 px-6 py-2 rounded-xl hover:bg-blue-700 transition"
          onClick={() => {
            navigate("/employee-stats-overall");
          }}
        >
          Overall
        </button>
        <button
         className="bg-blue-600 text-white w-48 px-6 py-2 rounded-xl hover:bg-blue-700 transition"
          onClick={() => {
            navigate("/employee-stats-departmentwise");
          }}
        >
          DepartMent
        </button>
        <button
         className="bg-blue-600 text-white w-48 px-6 py-2 rounded-xl hover:bg-blue-700 transition"
          onClick={() => {
            navigate("/employee-stats-TLwise");
          }}
        >
          {" "}
          Team Lead wise
        </button>
      </div>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
        Team-Wise Performance Dashboard
      </h1>

      <div style={{ marginBottom: "30px" }}>
        <label
          htmlFor="department-select"
          style={{ marginRight: "10px", fontWeight: "bold" }}
        >
          Select TeamLead:
        </label>
        <select
          id="department-select"
          onChange={handleDepartmentChange}
          value={selectedManager?selectedManager:''}
          style={{
            padding: "8px 12px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "16px",
            minWidth: "200px",
          }}
        >
          {" "}
          <option value="" disabled selected>
            Select TeamLead
          </option>
          {manager.map((m) => (
            <option key={m.employee_number} value={m.employee_number}>
              {m.employee_name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: "#ffebee",
            color: "#c62828",
            padding: "10px",
            borderRadius: "5px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p>Loading department data...</p>
        </div>
      ) : managerData ? (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginBottom: "30px",
            }}
          >
            <div
              style={{
                backgroundColor: "#f5f5f5",
                padding: "15px",
                borderRadius: "5px",
              }}
            >
              <h3>Overall Average Score</h3>
              <p style={{ fontSize: "24px", fontWeight: "bold" }}>
                {managerData.overall_average_score.toFixed(2)}
              </p>
            </div>
            <div
              style={{
                backgroundColor: "#f5f5f5",
                padding: "15px",
                borderRadius: "5px",
              }}
            >
              <h3>Overall Fulfillment Rate</h3>
              <p style={{ fontSize: "24px", fontWeight: "bold" }}>
                {managerData.overall_fulfillment_rate.toFixed(2)}%
              </p>
            </div>
          </div>

          {chartData && (
            <div
              style={{
                width: "1100px",
                marginBottom: "30px",
              }}
            >
              <Bar data={chartData} options={chartOptions} />
            </div>
          )}

          <div style={{ marginBottom: "30px" }}>
            {managerData.competencies.length > 0 ? (
              <div>
                <h2>Top Performing Competencies</h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(400px, 1fr))",
                    gap: "15px",
                  }}
                >
                  {managerData.competencies.slice(0, 3).map((comp) => (
                    <div
                      key={comp.competency_code}
                      style={{
                        backgroundColor: "#e6f7ff",
                        padding: "15px",
                        borderRadius: "5px",
                        borderLeft: "4px solid #1890ff",
                      }}
                    >
                      <h3 style={{ marginTop: 0 }}>{comp.competency_name}</h3>
                      <p>
                        <strong>Rank:</strong> {comp.rank}
                      </p>
                      <p>
                        <strong>Score:</strong> {comp.average_score.toFixed(2)}/
                        {comp.average_required_score}
                      </p>
                      <p>
                        <strong>Fulfillment:</strong> {comp.fulfillment_rate}%
                      </p>
                    </div>
                  ))}
                </div>
                <h2>Least Performing Competencies</h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(400px, 1fr))",
                    gap: "15px",
                  }}
                >
                  {[...competencies]
                    .reverse()
                    .slice(0, 3)
                    .map((comp) => (
                      <div
                        key={comp.competency_code}
                        style={{
                          backgroundColor: " rgb(247, 202, 202)",
                          padding: "15px",
                          borderRadius: "5px",
                          borderLeft: "4px solid rgb(255, 24, 24)",
                        }}
                      >
                        <h3 style={{ marginTop: 0 }}>{comp.competency_name}</h3>
                        <p>
                          <strong>Rank:</strong> {comp.rank}
                        </p>
                        <p>
                          <strong>Score:</strong>{" "}
                          {comp.average_score.toFixed(2)}/
                          {comp.average_required_score}
                        </p>
                        <p>
                          <strong>Fulfillment:</strong> {comp.fulfillment_rate}%
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <p>No competency data available for this department.</p>
            )}
          </div>

          <div>
            <h2>All Competencies</h2>
            {managerData.competencies.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "#f0f0f0",
                        textAlign: "left",
                      }}
                    >
                      <th
                        style={{
                          padding: "20px",
                          border: "1px solid #ddd",
                          fontSize: "20px",
                        }}
                      >
                        Rank
                      </th>
                      <th
                        style={{
                          padding: "20px",
                          border: "1px solid #ddd",
                          fontSize: "20px",
                        }}
                      >
                        Code
                      </th>
                      <th
                        style={{
                          padding: "20px",
                          border: "1px solid #ddd",
                          fontSize: "20px",
                        }}
                      >
                        Competency
                      </th>
                      <th
                        style={{
                          padding: "20px",
                          border: "1px solid #ddd",
                          fontSize: "20px",
                        }}
                      >
                        Score
                      </th>
                      <th
                        style={{
                          padding: "20px",
                          border: "1px solid #ddd",
                          fontSize: "20px",
                        }}
                      >
                        Fulfillment
                      </th>
                      <th
                        style={{
                          padding: "20px",
                          border: "1px solid #ddd",
                          fontSize: "20px",
                        }}
                      >
                        Employees
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {managerData.competencies.map((comp) => (
                      <tr
                        key={comp.competency_code}
                        style={{
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        <td
                          style={{
                            padding: "20px",
                            border: "1px solid #ddd",
                            fontSize: "20px",
                          }}
                        >
                          {comp.rank}
                        </td>
                        <td
                          style={{
                            padding: "20px",
                            border: "1px solid #ddd",
                            fontSize: "20px",
                          }}
                        >
                          {comp.competency_code}
                        </td>
                        <td
                          style={{
                            padding: "20px",
                            border: "1px solid #ddd",
                            fontSize: "20px",
                          }}
                        >
                          {comp.competency_name}
                        </td>
                        <td
                          style={{
                            padding: "20px",
                            border: "1px solid #ddd",
                            fontSize: "20px",
                          }}
                        >
                          {comp.average_score.toFixed(2)}/
                          {comp.average_required_score}
                        </td>
                        <td
                          style={{
                            padding: "20px",
                            border: "1px solid #ddd",
                            fontSize: "20px",
                          }}
                        >
                          {comp.fulfillment_rate}%
                        </td>
                        <td
                          style={{
                            padding: "20px",
                            border: "1px solid #ddd",
                            fontSize: "20px",
                          }}
                        >
                          {comp.employees_meeting_required}/
                          {comp.employees_evaluated}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No competency data available for this department.</p>
            )}
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p>Please select a department to view performance data.</p>
        </div>
      )}
    </div>
  );
};

export default ManagerPerformanceDashboard;
