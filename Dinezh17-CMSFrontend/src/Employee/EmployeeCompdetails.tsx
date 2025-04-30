import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  role_category: string;
  evaluation_status?: string;
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

const EmployeeDetails: React.FC = () => {
  const { employeeNumber } = useParams<{ employeeNumber: string }>();
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
      if (!employeeNumber) return;

      setLoading(true);
      try {
        const response = await api.get(`/employee-details/${employeeNumber}`);
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
  }, [employeeNumber]);

  const handleBack = () => {
    navigate("/employee-eval");
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not evaluated";
    return new Date(dateString).toLocaleDateString();
  };

  const renderCompetencyTable = (
    competencies: CompetencyDisplay[],
    title: string
  ) => (
    <div className="py-4 mb-7">
      <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
        {title} Competencies
      </h3>
      <div className="overflow-x-auto border border-gray-300 rounded-xl">
        <table className="w-full table-fixed border-collapse border border-gray-300 text-sm rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-gray-50">
              <th className="w-1/10 p-3 text-left border border-gray-300 text-gray-600 font-semibold">
                Classification
              </th>
              <th className="w-1/5 p-3 text-left border border-gray-300 text-gray-600 font-semibold">
                Competency
              </th>
              <th className="w-1/12 p-3 text-left border border-gray-300 text-gray-600 font-semibold">
              Competency Code
              </th>
              <th className="w-1/14 p-3 text-left border border-gray-300 text-gray-600 font-semibold">
                RPL
              </th>
              <th className="w-1/14 p-3 text-left border border-gray-300 text-gray-600 font-semibold">
                APL
              </th>
              <th className="w-1/14 p-3 text-left border border-gray-300 text-gray-600 font-semibold">
                Gap
              </th>
            </tr>
          </thead>
          <tbody>
            {competencies.map((comp) => (
              <tr key={comp.competency_code}>
                <td className="w-1/6 p-4 border border-gray-300 align-top text-base">
                  {comp.competency_description}
                </td>
                <td className="w-1/5 p-4 border border-gray-300 align-top text-base">
                  {comp.competency_name}
                </td>
                <td className="w-1/6 p-4 border border-gray-300 align-top text-base">
                  {comp.competency_code}
                </td>
                <td className="w-1/12 p-4 border border-gray-300 align-top text-base">
                  {comp.required_score}
                </td>
                <td className="w-1/12 p-4 border border-gray-300 align-top text-base">
                  {comp.actual_score}
                </td>
                <td
                  className={`w-1/12 p-4 border border-gray-300 align-top text-base font-bold ${
                    comp.gap <= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {employee?.evaluation_status === "True" ? comp.gap : "-"}
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
      <div className="max-w-7xl mx-auto my-5 p-6 font-sans text-black bg-gray-50 rounded-xl shadow-sm">
        <div className="flex justify-center items-center h-72">
          <div className="text-lg text-gray-600">
            Loading employee details...
          </div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="max-w-7xl mx-auto my-5 p-6 font-sans text-black bg-gray-50 rounded-xl shadow-sm">
        <div className="text-center py-10">
          <h3>Employee not found</h3>
          <button
            className="mt-4 px-4 py-2 bg-gray-100 text-gray-600 border-none rounded-lg text-sm font-semibold cursor-pointer transition duration-200 flex items-center gap-1.5 shadow-sm hover:bg-gray-200"
            onClick={handleBack}
          >
            Back to Employee List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-8xl mx-auto mt-20 mb-5 p-6 font-sans text-black bg-gray-50 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-7 gap-4">
        <h2 className="text-2xl font-semibold text-blue-900 m-0">
          Employee Details
        </h2>
        <button
          className="px-4 py-2 bg-gray-100 text-gray-600 border-none rounded-lg text-sm font-semibold cursor-pointer transition duration-200 flex items-center gap-1.5 shadow-sm hover:bg-gray-200"
          onClick={handleBack}
        >
          &larr; Back to List
        </button>
      </div>

      <div className="bg-white rounded-xl overflow-hidden shadow-sm p-6">
        <div className="mb-7 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-500 font-medium">
                Employee Number:
              </span>
              <span>{employee.employee_number}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-500 font-medium">
                Employee Name:
              </span>
              <span>{employee.employee_name}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-500 font-medium">
                Department:
              </span>
              <span>{employee.department}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-500 font-medium">
                Role Code:
              </span>
              <span>{employee.role_code}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-500 font-medium">
                Role Name:
              </span>
              <span>{employee.role}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-500 font-medium">
                Role Category:
              </span>
              <span>{employee.role_category}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-500 font-medium">
                Job Code:
              </span>
              <span>{employee.job_code}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-500 font-medium">
                Job Name:
              </span>
              <span>{employee.job_name}</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-500 font-medium">
                Reporting Manager:
              </span>
              <span>{employee.reporting_employee_name || "N/A"}</span>
            </div>
          </div>
        </div>

        <div className="mb-7 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
            Evaluation Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-500  font-medium">
                Status:
              </span>
              <span
                className={`${
                  employee.evaluation_status === null
                    ? " text-yellow-800 "
                    : employee.evaluation_status === "True"
                    ? " text-green-800  "
                    : " text-red-800  "
                }font-semibold`}
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
              <span>{employee.sent_to_evaluation_by || "N/A"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-500 font-medium">
                Evaluated By:
              </span>
              <span>{employee.evaluation_by || "N/A"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-500 font-medium">
                Last Evaluated:
              </span>
              <span>{formatDate(employee.last_evaluated_date)}</span>
            </div>
          </div>
        </div>

        {renderCompetencyTable(functionalCompetencies, "Functional")}
        {renderCompetencyTable(behavioralCompetencies, "Behavioral")}
      </div>
    </div>
  );
};

export default EmployeeDetails;
