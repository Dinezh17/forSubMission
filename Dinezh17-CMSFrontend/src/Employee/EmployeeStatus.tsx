import React, { useState, useEffect } from "react";
import api from "../interceptor/api";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

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
interface Manager {
  employee_number: string;
  employee_name: string;
}

const EmployeeEvaluation: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [reportingemp, setreportingSearchTerm] = useState("");

  const [departmentFilter, setDepartmentFilter] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [employeesRes, deptsRes, rolesRes, managerRes] = await Promise.all([
        api.get<Employee[]>("/employees"),
        api.get<Department[]>("/departments"),
        api.get<Role[]>("/roles"),
        api.get("/managers/"),
      ]);

      setEmployees(employeesRes.data);
      setFilteredEmployees(employeesRes.data);
      setDepartments(deptsRes.data);
      setRoles(rolesRes.data);
      setManagers(managerRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [employees, searchTerm, reportingemp, departmentFilter, statusFilter]);

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
    if (reportingemp) {
      const term = reportingemp.toLowerCase();
      result = result.filter((emp) => {
        if (!emp.reporting_to) return false;

        // Find the reporting employee
        const reportingEmp = employees.find(
          (e) => e.employee_number === emp.reporting_to
        );

        // Match on reporting employee number or name
        return (
          emp.reporting_to.toLowerCase().includes(term) ||
          (reportingEmp?.employee_name.toLowerCase().includes(term) ?? false)
        );
      });
    }

    if (departmentFilter !== 0) {
      result = result.filter((emp) => emp.department_id == departmentFilter);
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
  const emphandleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setreportingSearchTerm(e.target.value);
  };

  const handleDepartmentFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDepartmentFilter(parseInt(e.target.value));
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const toggleSelectEmployee = (employeeNumber: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeNumber)
        ? prev.filter((num) => num !== employeeNumber)
        : [...prev, employeeNumber]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map((emp) => emp.employee_number));
    }
    setSelectAll(!selectAll);
  };

  const markAsPending = async () => {
    if (selectedEmployees.length === 0) return;

    if (
      window.confirm("Are you sure to send these employees for evaluation?")
    ) {
      try {
        await api.patch("/employees/evaluation-status", {
          employee_numbers: selectedEmployees,
        });
        toast.success(" updating evaluation status success");

        setSelectedEmployees([]);
        setSelectAll(false);
        // Now fetch new data
        fetchData();
      } catch (error: any) {
        toast.error("Error updating evaluation status:", error);

        console.error("Error updating evaluation status:", error);
      }
    }
  };

  const viewEmployeeDetails = (employeeNumber: string) => {
    setLoadingDetails(true);
    navigate(`/employee-details/${employeeNumber}`);
  };

  return (
    <div className="mt-20 p-5 mx-9 bg-white rounded-lg shadow-lg ">
      <ToastContainer position="top-right" />

      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Employee Evaluation
      </h2>

      {/* First Row: Search bar and Filters */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name or number"
          value={searchTerm}
          onChange={handleSearch}
          className="px-4 py-2 border border-gray-300 rounded-md w-1/3"
        />

        <select
          value={departmentFilter}
          onChange={handleDepartmentFilter}
          className="px-4 py-2 border border-gray-300 rounded-md w-1/3"
        >
          <option value={0}>All Departments</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id.toString()}>
              {dept.name}
            </option>
          ))}
        </select>

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

      {/* Second Row: Select All, Mark as Pending Button, and Reporting Employee Search */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={toggleSelectAll}
            className="h-5 w-5"
            id="selectAll"
          />
          <label htmlFor="selectAll" className="text-gray-700">
            Select All ({filteredEmployees.length})
          </label>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700">
            {selectedEmployees.length} selected
          </span>

          <button
            className={`px-4 py-2 text-white rounded-md ${
              selectedEmployees.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
            onClick={markAsPending}
            disabled={selectedEmployees.length === 0}
          >
            Mark as Pending
          </button>
        </div>

        {/* Reporting Employee Search */}
        <div className="flex justify-end w-1/3">
          <input
            type="text"
            placeholder="Search by reporting employee"
            value={reportingemp}
            onChange={emphandleSearch}
            className="px-4 py-2 border border-gray-300 rounded-md w-full"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-separate border-spacing-0">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                #
              </th>
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
                Reporting Manager
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
                  departments.find((d) => d.id == employee.department_id)
                    ?.name || "N/A";
                const role = roles.find((r) => r.id === employee.role_id);
            
                const reportingName =
                  managers.find(
                    (d) =>
                      d.employee_number.toString() === employee.reporting_to
                  )?.employee_name || "N/A";

               
                return (
                  <tr
                    key={employee.employee_number}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(
                          employee.employee_number
                        )}
                        onChange={() =>
                          toggleSelectEmployee(employee.employee_number)
                        }
                        className="h-5 w-5"
                        id={`employee-${employee.employee_number}`}
                      />
                    </td>
                    <td className="px-4 py-2">{employee.employee_number}</td>
                    <td className="px-4 py-2">{employee.employee_name}</td>
                    <td className="px-4 py-2">{deptName}</td>
                    <td className="px-4 py-2">{role?.role_code}</td>
                    <td className="px-4 py-2">{role?.role_name}</td>

                    <td className="px-4 py-2">{role?.role_category}</td>


                    <td className="px-4 py-2">{employee.job_code}</td>

                    <td className="px-4 py-2">{employee.job_name}</td>
                    <td className="px-4 py-2">{reportingName}</td>
               
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-md whitespace-nowrap ${
                          employee.evaluation_status === null ||
                          employee.evaluation_status === undefined
                            ? "bg-yellow-200 text-yellow-800"
                            : employee.evaluation_status === "True"
                            ? "bg-green-200 text-green-800"
                            : "bg-red-200 text-red-800"
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
                    <td className="px-4 py-2">
                      <button
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        onClick={() =>
                          viewEmployeeDetails(employee.employee_number)
                        }
                        disabled={loadingDetails}
                      >
                        {loadingDetails ? "..." : "Details"}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={11}
                  className="px-4 py-6 text-center text-gray-600"
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
