import React, { useEffect, useState, useContext } from "react";
import api, { configureApi } from "../interceptor/api";
import { AuthContext } from "../auth/AuthContext";

interface EmployeeCompetency {
  employeeNumber: string;
  employeeName: string;
  competencyCode: string;
  competencyName: string;
  competencyDescription: string;
  requiredScore: string;
  actualScore: string;
  gap: string;
}

const EmployeeCompetencyTable: React.FC = () => {
  const [data, setData] = useState<EmployeeCompetency[]>([]);
  const { logout } = useContext(AuthContext)!;
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    configureApi(logout);
  }, [logout]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const competenciesResponse = await api.get(
          "/employee-competencies/details"
        );

        setData(competenciesResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [logout]);

  if (loading) {
    return (
      <div className="px-4 py-3 text-left text-sm font-medium text-gray-700 border border-gray-300">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto mt-20 px-4 py-8">
      <h2 className="text-2xl font-semibold mb-6">Employee Competencies Report</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden shadow-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border border-gray-300">
                S/no
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border border-gray-300">
                Employee Number
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border border-gray-300">
                Employee Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border border-gray-300">
                Classification
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border border-gray-300">
                Competency{" "}
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border border-gray-300">
                Competency Code
              </th>

              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border border-gray-300">
                RPL
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border border-gray-300">
                APL
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border border-gray-300">
                Gap
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => {
              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border border-gray-300">
                    {index + 1}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {row.employeeNumber}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {row.employeeName}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {row.competencyDescription}
                  </td>

                  <td className="px-4 py-2 border border-gray-300">
                    {row.competencyName}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {row.competencyCode}
                  </td>

                  <td className="px-4 py-2 text-center border border-gray-300">
                    {row.requiredScore}
                  </td>
                  <td className="px-4 py-2 text-center border border-gray-300">
                    {row.actualScore}
                  </td>
                  <td
                    className={`px-4 py-2 text-center border border-gray-300 font-semibold ${
                      row.gap > "0" && row.gap != "-"
                        ? "bg-red-100 text-red-700"
                        : ""
                    }`}
                  >
                    {row.gap}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeCompetencyTable;
