import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api, { configureApi } from "../interceptor/api";
import { AuthContext } from "../auth/AuthContext";

interface Employee {
  employee_number: string;
  employee_name: string;
  job_code: string;
  job_name: string;
  reporting_employee_name: string;
  department: string;
  role: string;
  role_code: string;
  evaluation_status: string;
  sent_to_evaluation_by?: string;
  evaluation_by?: string;
  last_evaluated_date?: string;
}

interface CompetencyDisplay {
  competency_code: string;
  competency_name: string;
  competency_description: string;
  competency_required_score: number;
  required_score: number;
  actual_score: number;
  gap: number;
}

const Myscores: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [functionalCompetencies, setFunctionalCompetencies] = useState<
    CompetencyDisplay[]
  >([]);
  const [behavioralCompetencies, setBehavioralCompetencies] = useState<
    CompetencyDisplay[]
  >([]);
  const { logout } = useContext(AuthContext)!;
  const navigate = useNavigate();

  useEffect(() => {
    configureApi(logout);
  }, [logout]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/myscores/employee-details/`);
        setEmployee(response.data.employee);
        setFunctionalCompetencies(response.data.functional_competencies);
        setBehavioralCompetencies(response.data.behavioral_competencies);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not evaluated";
    return new Date(dateString).toLocaleDateString();
  };

  const renderCompetencyTable = (
    competencies: CompetencyDisplay[],
    title: string
  ) => (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        {title} Competencies
      </h3>
      <div className="overflow-x-auto rounded-sm">
        <table className="min-w-full bg-white border border-gray-200 text-sm">
          <thead className="bg-gray-100 text-gray-700 font-semibold rounded-2xl">
            <tr>
              <th className="text-left p-3 border-gray-200">Code</th>
              <th className="text-left p-3 border-gray-200">Name</th>
              <th className="text-left p-3 border-gray-200">Description</th>
              <th className="text-left p-3 border-gray-200">Required</th>
              <th className="text-left p-3 border-gray-200">Actual</th>
              <th className="text-left p-3 border-gray-200">Gap</th>
            </tr>
          </thead>
          <tbody>
            {competencies.map((comp) => (
              <tr key={comp.competency_code} className="hover:bg-gray-50">
                <td className="text-left p-3 border-gray-200">
                  {comp.competency_code}
                </td>
                <td className="text-left p-3 border-gray-200">
                  {comp.competency_name}
                </td>
                <td className="text-left p-3 border-gray-200">
                  {comp.competency_description}
                </td>
                <td className="text-left p-3 border-gray-200">
                  {comp.required_score}
                </td>
                <td className="text-left p-3 border-gray-200">
                  {comp.actual_score}
                </td>
                <td
                  className={`text-left p-3 border-gray-200 font-semibold ${
                    comp.gap <= 0 ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {comp.gap}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-lg">Loading employee details...</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="mt-20 text-center p-10">
        <h3 className="text-lg font-semibold">Employee not found</h3>
        <button
          className="mt-10 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded shadow text-sm font-semibold"
          onClick={() => navigate("/")}
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-10 py-10 mt-20">
      <div className="flex items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-blue-900">Employee Details</h2>{" "}
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded shadow text-sm font-semibold"
        >
          ← Back to Home
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow space-y-10">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-500 font-medium">
                Employee Number:
              </span>
              <span className="text-base text-gray-800">
                {employee.employee_number}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-500 font-medium">Name:</span>
              <span className="text-base text-gray-800">
                {employee.employee_name}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-500 font-medium">
                Job Name:
              </span>
              <span className="text-base text-gray-800">
                {employee.job_name}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-500 font-medium">
                Job Code:
              </span>
              <span className="text-base text-gray-800">
                {employee.job_code}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-500 font-medium">
                Reporting To:
              </span>
              <span className="text-base text-gray-800">
                {employee.reporting_employee_name || "N/A"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-500 font-medium">Role:</span>
              <span className="text-base text-gray-800">{`${employee.role} (${employee.role_code})`}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Evaluation Status
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-500 font-medium">Status:</span>
              <span
                className={`text-base ${
                  employee.evaluation_status === null
                    ? "text-yellow-500"
                    : employee.evaluation_status === "True"
                    ? "text-green-500"
                    : "text-red-500"
                } font-semibold`}
              >
                {employee.evaluation_status === null
                  ? "Not yet evaluated"
                  : employee.evaluation_status === "True"
                  ? "Evaluated"
                  : "Pending"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-500 font-medium">
                Sent to Evaluation By:
              </span>
              <span className="text-base text-gray-800">
                {employee.sent_to_evaluation_by || "N/A"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-500 font-medium">
                Evaluated By:
              </span>
              <span className="text-base text-gray-800">
                {employee.evaluation_by || "N/A"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-500 font-medium">
                Last Evaluated:
              </span>
              <span className="text-base text-gray-800">
                {formatDate(employee.last_evaluated_date)}
              </span>
            </div>
          </div>

         
        </div>

        {renderCompetencyTable(functionalCompetencies, "Functional")}
        {renderCompetencyTable(behavioralCompetencies, "Behavioral")}
      </div>
    </div>
  );
};

export default Myscores;
