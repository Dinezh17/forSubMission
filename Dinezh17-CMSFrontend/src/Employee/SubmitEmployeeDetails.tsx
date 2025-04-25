import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../interceptor/api";
import StatsBar from "../Myscores/InvidualStatsComponent";
import { toast, ToastContainer } from "react-toastify";

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

const EmployeeEvaluationHod: React.FC = () => {
  const { employeeNumber } = useParams<{ employeeNumber: string }>();
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [functionalCompetencies, setFunctionalCompetencies] = useState<
    CompetencyDisplay[]
  >([]);
  const [behavioralCompetencies, setBehavioralCompetencies] = useState<
    CompetencyDisplay[]
  >([]);
  const [editingScores, setEditingScores] = useState(false);
  const [tempScores, setTempScores] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!employeeNumber) return;

      setLoading(true);
      try {
        const response = await api.get(`/employee-details/${employeeNumber}`);
        setEmployee(response.data.employee);
        setFunctionalCompetencies(response.data.functional_competencies);
        setBehavioralCompetencies(response.data.behavioral_competencies);

        // Initialize temp scores with current scores
        const scoresObj: { [key: string]: string } = {};
        [
          ...response.data.functional_competencies,
          ...response.data.behavioral_competencies,
        ].forEach((comp: CompetencyDisplay) => {
          scoresObj[comp.competency_code] = comp.actual_score.toString();
        });

        setTempScores(scoresObj);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [employeeNumber]);

  const handleBack = () => {
    navigate("/employee-eval-hod");
  };

  const handleScoreChange = (code: string, value: string) => {
    // Allow empty string or numbers 0-4
    if (value === "" || (["0", "1", "2", "3", "4"].includes(value))) {
      setTempScores((prev) => ({
        ...prev,
        [code]: value,
      }));
    }
  };

  const submitEvaluation = async () => {
    if (!employee) return;

    // Check if any values are empty strings
    const hasEmptyScores = Object.values(tempScores).some(score => score === "");
    if (hasEmptyScores) {
      toast.error("Please enter a score (0-4) for all competencies");
      return;
    }

    try {
      const payload = {
        scores: Object.entries(tempScores).map(([code, score]) => ({
          competency_code: code,
          actual_score: parseInt(score),
        })),
      };

      const response = await api.post(
        `/evaluations/${employeeNumber}`,
        payload
      );
      if (response) {
        window.location.reload();
      }
      toast.success("Employee scores updated");
      
    } catch (error) {
      console.error("Error submitting evaluation:", error);
      toast.error("Failed to submit evaluation. Please try again.");
    }
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
        <table className="w-full border-collapse border border-gray-300 text-sm rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 text-left border border-gray-300 text-gray-600 font-semibold">Code</th>
              <th className="p-3 text-left border border-gray-300 text-gray-600 font-semibold">Name</th>
              <th className="p-3 text-left border border-gray-300 text-gray-600 font-semibold">Description</th>
              <th className="p-3 text-left border border-gray-300 text-gray-600 font-semibold">Required</th>
              <th className="p-3 text-left border border-gray-300 text-gray-600 font-semibold">Actual</th>
              <th className="p-3 text-left border border-gray-300 text-gray-600 font-semibold">Gap</th>
            </tr>
          </thead>
          <tbody>
            {competencies.map((comp) => (
              <tr key={comp.competency_code}>
                <td className="p-4 border border-gray-300 align-top text-base">{comp.competency_code}</td>
                <td className="p-4 border border-gray-300 align-top text-base">{comp.competency_name}</td>
                <td className="p-4 border border-gray-300 align-top text-base">{comp.competency_description}</td>
                <td className="p-4 border border-gray-300 align-top text-base">{comp.required_score}</td>
                <td className="p-4 border border-gray-300 align-top text-base">
                  {editingScores ? (
                    <input
                      type="text"
                      value={tempScores[comp.competency_code] || ""}
                      onChange={(e) =>
                        handleScoreChange(comp.competency_code, e.target.value)
                      }
                      className="w-16 p-2 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
                    />
                  ) : (
                    comp.actual_score
                  )}
                </td>
                <td className={`p-4 border border-gray-300 align-top text-base font-bold ${
                  comp.gap <= 0 ? "text-green-600" : "text-red-600"
                }`}>
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
      <div className="max-w-7xl mx-auto my-5 p-6 font-sans text-black bg-gray-50 rounded-xl shadow-sm">
        <div className="flex justify-center items-center h-72">
          <div className="text-lg text-gray-600">Loading employee details...</div>
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
      <ToastContainer position="top-right" />
      
      <div className="flex items-center justify-between mb-7 gap-4">
        
        <h2 className="text-2xl font-semibold text-blue-900 m-0">Employee Evaluation</h2>
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
              <span className="text-sm text-gray-500 font-medium">Employee Number:</span>
              <span>{employee.employee_number}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-500 font-medium">Name:</span>
              <span>{employee.employee_name}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-500 font-medium">Job Name:</span>
              <span>{employee.job_name}</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-500 font-medium">Job Code:</span>
              <span>{employee.job_code}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-500 font-medium">Reporting To:</span>
              <span>{employee.reporting_employee_name || "N/A"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-500 font-medium">Role:</span>
              <span>
                {employee.role} ({employee.role_code})
              </span>
            </div>
          </div>
        </div>

        <div className="mb-7 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
            Evaluation Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-500  font-medium">Status:</span>
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
              <span className="text-sm text-gray-500 font-medium">Sent to Evaluation By:</span>
              <span>{employee.sent_to_evaluation_by || "N/A"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-500 font-medium">Evaluated By:</span>
              <span>{employee.evaluation_by || "N/A"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-500 font-medium">Last Evaluated:</span>
              <span>{formatDate(employee.last_evaluated_date)}</span>
            </div>
          </div>
          {employeeNumber && (
            <div className="mt-8 mb-8 w-full">
              <StatsBar empNumber={employeeNumber} />
            </div>
          )}
        </div>

        {renderCompetencyTable(functionalCompetencies, "Functional")}
        {renderCompetencyTable(behavioralCompetencies, "Behavioral")}

        <div className="flex justify-end gap-3 mt-5">
          {!editingScores ? (
            <button
              className={`px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 ${
                employee.evaluation_status === null ||
                employee.evaluation_status === undefined
                  ? "bg-yellow-50 text-yellow-800 border border-yellow-200"
                  : employee.evaluation_status === "True"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
              }`}
              onClick={() => setEditingScores(true)}
              disabled={
                employee.evaluation_status === "True" ||
                employee.evaluation_status === null
              }
            >
              {employee.evaluation_status === null
                ? "Not up for evaluation"
                : employee.evaluation_status === "True"
                ? "Already Evaluated"
                : "Evaluate"}
            </button>
          ) : (
            <>
              <button 
                className="px-5 py-2.5 bg-green-600 text-white border-none rounded-lg text-sm font-medium cursor-pointer hover:bg-green-700 transition-colors"
                onClick={submitEvaluation}
              >
                Submit Evaluation
              </button>
              <button
                className="px-5 py-2.5 bg-red-600 text-white border-none rounded-lg text-sm font-medium cursor-pointer hover:bg-red-700 transition-colors"
                onClick={() => setEditingScores(false)}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeEvaluationHod;