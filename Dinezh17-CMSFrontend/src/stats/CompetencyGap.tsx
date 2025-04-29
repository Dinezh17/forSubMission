import React, { useState, useEffect, useContext } from "react";
import api, { configureApi } from "../interceptor/api";
import { AuthContext } from "../auth/AuthContext";
import Select from "react-select";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface CompetencyGap {
  competencyCode: string;
  competencyName: string;
  gap1: number;
  gap2: number;
  gap3: number;
  gap4: number;
  totalGapEmployees: number;
}

interface EmployeeGap {
  employeeNumber: string;
  employeeName: string;
  requiredScore: number;
  actualScore: string;
  gap: string;
  employee_name?: string;
}

const CompetencyGapTable: React.FC = () => {
  const [competencyGaps, setCompetencyGaps] = useState<CompetencyGap[]>([]);
  const [employeeGaps, setEmployeeGaps] = useState<EmployeeGap[]>([]);
  const [selectedCompetency, setSelectedCompetency] = useState<string | null>(
    null
  );
  const [CompetencyName, setSelectedCompetencyName] = useState<string | null>(
    null
  );
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useContext(AuthContext)!;

  useEffect(() => {
    configureApi(logout);
  }, [logout]);

  const options = [
    { value: "", label: "-- Show All --" },
    ...competencyGaps.map((item) => ({
      value: item.competencyCode,
      label: `${item.competencyCode} - ${item.competencyName}`,
    })),
  ];

  const handleChange = (selectedOption: any) => {
    setSelectedCode(selectedOption?.value || null);
  };
  // Fetch competency gap data and employee data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch competency gaps
        const competencyResponse = await api.get(
          "/fetch-all-competency-score-data"
        );
        setCompetencyGaps(competencyResponse.data);

        setError(null);
      } catch (err) {
        setError("Failed to fetch initial data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to fetch employee details for a specific competency and merge with employee names
  const fetchEmployeeDetails = async (
    competencyCode: string,
    competencyName: string
  ) => {
    try {
      setLoading(true);

      const response = await api.get(
        `/score-emp-details/by-competency/${competencyCode}`
      );

      setEmployeeGaps(response.data);
      setSelectedCompetency(competencyCode);
      setSelectedCompetencyName(competencyName);
      setShowDetails(true);
      setError(null);
    } catch (err) {
      setError(
        `Failed to fetch employee details for competency ${competencyCode}`
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Close details modal
  const closeDetails = () => {
    setShowDetails(false);
  };
  const transformDataForChart = () => {
    const data = competencyGaps.map((item) => ({
      name: item.competencyCode,
      "Gap Level 1": item.gap1,
      "Gap Level 2": item.gap2,
      "Gap Level 3": item.gap3,
      "Gap Level 4": item.gap4,
      fullName: item.competencyName,
    }));

    if (selectedCode) {
      return data.filter((item) => item.name === selectedCode);
    }
    return data;
  };

  const chartData = transformDataForChart();

  if (loading && competencyGaps.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>Loading...</div>
    );
  }

  if (error && competencyGaps.length === 0) {
    return (
      <div style={{ color: "red", textAlign: "center", padding: "20px" }}>
        {error}
      </div>
    );
  }

  return (
    <div className=" rounded-xl font-sans pt-10 mb-10 mt-15 mx-10">
    

      {/* Bar Chart for Competency Gaps */}
      <div className="mb-10 border border-gray-100 rounded-xl p-4 shadow-sm bg-white">
        <h2 className="text-xl font-medium mb-4">
          Competency Gap Distribution
        </h2>
        <div className="mb-4 flex items-center gap-4">
          <label
            htmlFor="competency-select"
            className="font-medium text-gray-700"
          >
            Select Competency Code:
          </label>
          <div className="w-[500px]">
            <Select
              id="competency-select"
              options={options}
              value={
                options.find((opt) => opt.value === selectedCode) || options[0]
              }
              onChange={handleChange}
              className="react-select-container "
              classNamePrefix="react-select"
              placeholder="Select a Competency"
              isClearable
            />
          </div>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
          >
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={70}
              tick={{ fontSize: 12 }}
            />

            <YAxis allowDecimals={false} />

            <Tooltip
              formatter={(value, name) => [value, name]}
              labelFormatter={(label) => {
                const item = chartData.find((item) => item.name === label);
                return `${label}: ${item?.fullName ?? ""}`;
              }}
            />

            <Legend />

            <Bar dataKey="Gap Level 1" fill="#4ade80" />
            <Bar dataKey="Gap Level 2" fill="#facc15" />
            <Bar dataKey="Gap Level 3" fill="#f87171" />
            <Bar dataKey="Gap Level 4" fill="#f43f5e" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Main Competency Gap Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
        <table
          className="w-full border-separate rounded-xl"
          style={{ borderSpacing: "0" }}
        >
          <thead>
            <tr className="bg-gray-100 ">
              <th className="px-4 py-2 text-left border border-gray-100">
                Competency Code
              </th>
              <th className="px-4 py-2 text-left border border-gray-100">
                Competency Name
              </th>
              <th className="px-4 py-2 text-center border border-gray-100">
                Gap Level 1
              </th>
              <th className="px-4 py-2 text-center border border-gray-100">
                Gap Level 2
              </th>
              <th className="px-4 py-2 text-center border border-gray-100">
                Gap Level 3
              </th>
              <th className="px-4 py-2 text-center border border-gray-100">
                Gap Level 4
              </th>
              <th className="px-4 py-2 text-center border border-gray-100">
                Total
              </th>
              <th className="px-4 py-2 text-center border border-gray-100">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {competencyGaps.map((gap) => (
              <tr key={gap.competencyCode} className="border-b border-gray-100">
                <td className="px-4 py-2 border border-gray-100">
                  {gap.competencyCode}
                </td>
                <td className="px-4 py-2 border border-gray-100">
                  {gap.competencyName}
                </td>
                <td
                  className={`px-4 py-2 text-center border border-gray-100 ${
                    gap.gap1 > 0 ? "bg-green-50" : ""
                  }`}
                >
                  {gap.gap1}
                </td>
                <td
                  className={`px-4 py-2 text-center border border-gray-100 ${
                    gap.gap2 > 0 ? "bg-yellow-50" : ""
                  }`}
                >
                  {gap.gap2}
                </td>
                <td
                  className={`px-4 py-2 text-center border border-gray-100 ${
                    gap.gap3 > 0 ? "bg-red-50" : ""
                  }`}
                >
                  {gap.gap3}
                </td>
                <td
                  className={`px-4 py-2 text-center border border-gray-100 ${
                    gap.gap3 > 0 ? "bg-red-50" : ""
                  }`}
                >
                  {gap.gap4}
                </td>
                <td className="px-4 py-2 text-center font-semibold bg-sky-100 border border-gray-100">
                  {gap.totalGapEmployees}
                </td>
                <td className="px-4 py-2 text-center border border-gray-100">
                  <button
                    onClick={() =>
                      fetchEmployeeDetails(
                        gap.competencyCode,
                        gap.competencyName
                      )
                    }
                    className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Employee Details Modal */}
      {showDetails && (
        <div
          className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-50"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div className="bg-white rounded-lg p-6 w-11/12 max-w-7xl max-h-4/5 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-semibold">
                  Employee Gaps for Competency: {selectedCompetency}
                </h2>
                <p className="text-xl pt-3">{CompetencyName}</p>
              </div>
              <button
                onClick={closeDetails}
                className="bg-gray-100 border-none rounded-md py-2 px-4 cursor-pointer hover:bg-gray-100 transition"
              >
                Close
              </button>
            </div>

            {loading ? (
              <div className="text-center py-6">
                Loading employee details...
              </div>
            ) : (
              <table className="w-full table-auto rounded-2xl border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left border border-gray-100">
                      Employee Number
                    </th>
                    <th className="px-4 py-2 text-left border border-gray-100">
                      Employee Name
                    </th>
                    <th className="px-4 py-2 text-left border border-gray-100">
                      Required Score
                    </th>
                    <th className="px-4 py-2 text-left border border-gray-100">
                      Actual Score
                    </th>
                    <th className="px-4 py-2 text-left border border-gray-100">
                      Gap
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {employeeGaps?.map((employee, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 border border-gray-100">
                        {employee.employeeNumber}
                      </td>
                      <td className="px-4 py-2 border border-gray-100">
                        {employee.employeeName || "N/A"}
                      </td>
                      <td className="px-4 py-2 border border-gray-100">
                        {employee.requiredScore}
                      </td>
                      <td className="px-4 py-2 border border-gray-100">
                        {employee.actualScore}
                      </td>
                      <td
                        className={`px-4 py-2 border border-gray-100 font-semibold ${
                          employee.gap <= "0" && employee.gap!="-" ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {employee.gap}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {employeeGaps?.length === 0 && !loading && (
              <div className="text-center py-6">
                No employee gaps found for this competency
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetencyGapTable;
