import React, { useState, useEffect } from "react";
import api from "../interceptor/api";
import { useNavigate } from "react-router-dom";

interface Employee {
  employee_number: string;
  employee_name: string;
  job_code: string;
  job_name: string;
  reporting_to: string;
  role_id: number;
  department_id: number;
  evaluation_status?: string;
  evaluation_by?: string;
  last_evaluated_date?: string;
}

interface Department {
  id: number;
  name: string;
}

interface Role {
  id: number;
  role_code: string;
  role_name: string;
  role_category: string;
}

const EmployeeEvaluation: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loadingDetails, setLoadingDetails] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employeesRes, deptsRes, rolesRes] = await Promise.all([
          api.get<Employee[]>("/manager/employees"),
          api.get<Department[]>("/departments"),
          api.get<Role[]>("/roles"),
        ]);
        setEmployees(employeesRes.data);
        setFilteredEmployees(employeesRes.data);
        setDepartments(deptsRes.data);
        setRoles(rolesRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [employees, searchTerm, statusFilter]);

  const applyFilters = () => {
    let result = [...employees];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (emp) =>
          emp.employee_number.toLowerCase().includes(term) ||
          emp.employee_name.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== "all") {
      if (statusFilter === "evaluated") {
        result = result.filter((emp) => emp.evaluation_status === "True");
      } else if (statusFilter === "pending") {
        result = result.filter((emp) => emp.evaluation_status === "False");
      } else if (statusFilter === "null") {
        result = result.filter((emp) => emp.evaluation_status === null);
      }
    }

    setFilteredEmployees(result);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const viewEmployeeDetails = (employeeNumber: string) => {
    setLoadingDetails(true);
    navigate(`/employee-eval-hod/${employeeNumber}`);
  };

  return (
    <div className="mt-20 p-5 mx-10  bg-white rounded-lg shadow-lg ">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Employee Evaluation
      </h2>

      <div className="flex gap-4 mb-4 flex-wrap bg-white p-4 rounded-lg shadow-sm">
        <input
          type="text"
          placeholder="Search by name or number"
          value={searchTerm}
          onChange={handleSearch}
          className="p-3 border border-gray-300 rounded-lg w-full min-w-[240px] text-sm focus:outline-none"
        />

        <select
          value={statusFilter}
          onChange={handleStatusFilter}
          className="px-4 py-2 border border-gray-300 rounded-md w-1/3"
        >
          <option value="all">All Statuses</option>
          <option value="evaluated">Evaluated</option>
          <option value="pending">Pending</option>
          <option value="null">Yet to evaluate</option>
        </select>
      </div>

      <div className="overflow-hidden bg-white rounded-lg shadow-sm">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                Employee Number
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                Employee Name
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                Department
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                Role Code
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                Role Name
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                Role Category
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                Job Code
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                Job Name
              </th>
             
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                Status
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => {
                const deptName =
                  departments.find((d) => d.id === employee.department_id)
                    ?.name || "N/A";
                const role = roles.find((r) => r.id === employee.role_id);

             
                return (
                  <tr
                    key={employee.employee_number}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="p-4 text-sm text-gray-700">
                      {employee.employee_number}
                    </td>
                    <td className="p-4 text-sm text-gray-700">
                      {employee.employee_name}
                    </td>
                    <td className="p-4 text-sm text-gray-700">{deptName}</td>
                    <td className="p-4 text-sm text-gray-700">
                      {role?.role_code}
                    </td>
                    <td className="p-4 text-sm text-gray-700">
                      {role?.role_name}
                    </td>
                    <td className="p-4 text-sm text-gray-700">
                      {role?.role_category}
                    </td>
                    <td className="p-4 text-sm text-gray-700">
                      {employee.job_code}
                    </td>
                    <td className="p-4 text-sm text-gray-700">
                      {employee.job_name}
                    </td>
                  

                    <td className="p-4 text-sm text-gray-700">
                      <span
                        className={`inline-block px-4 py-2 rounded-full text-xs font-semibold ${
                          employee.evaluation_status === null ||
                          employee.evaluation_status === undefined
                            ? "bg-yellow-100 text-yellow-800"
                            : employee.evaluation_status === "True"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {employee.evaluation_status === null ||
                        employee.evaluation_status === undefined
                          ? "Not Evaluated"
                          : employee.evaluation_status === "True"
                          ? "Evaluated"
                          : "Pending"}
                      </span>
                    </td>

                    <td className="p-4">
                      <button
                        className="px-4 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none disabled:bg-gray-300"
                        onClick={() =>
                          viewEmployeeDetails(employee.employee_number)
                        }
                        disabled={loadingDetails}
                      >
                        {loadingDetails ? "..." : "Evaluate"}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={9}
                  className="p-4 text-center text-gray-500 text-sm"
                >
                  No employees match the current filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeEvaluation;
