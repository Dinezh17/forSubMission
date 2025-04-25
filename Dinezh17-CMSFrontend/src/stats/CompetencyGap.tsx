import React, { useState, useEffect, useContext } from "react";
import api, { configureApi } from "../interceptor/api";
import { AuthContext } from "../auth/AuthContext";

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
  actualScore: number;
  gap: number;
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

  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useContext(AuthContext)!;

  useEffect(() => {
    configureApi(logout);
  }, [logout]);

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
    <div className=" rounded-xl font-sans pt-10 mx-10 ">
      <h1 className="text-2xl font-semibold mb-6 mt-18">
        Competency Gap Analysis
      </h1>

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
                  {employeeGaps.map((employee, index) => (
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
                      <td className={`px-4 py-2 border border-gray-100 font-semibold ${
                  employee.gap <= 0 ? "text-green-500" : "text-red-500"
                }`} >
                        {employee.gap}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {employeeGaps.length === 0 && !loading && (
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
