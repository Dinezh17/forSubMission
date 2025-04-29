import React, { useState, useEffect } from "react";
import api from "../interceptor/api";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import Select from "react-select";


interface Employee {
  employee_number: string;
  employee_name: string;
  job_code: string;
  job_name: string;
  reporting_to: string | null;
  role_id: number;
  department_id: number;
  evaluation_status: string | null;
  evaluation_by: string | null;
  last_evaluated_date: string | null;
}

interface Manager {
  employee_number: string;
  employee_name: string;
}

interface Role {
  id: number;
  role_code: string;
  role_name: string;
  role_category: string;
}

interface Department {
  id: number;
  name: string;
}

interface JobCode {
  job_code: string;
  job_name: string;
}

interface SelectOption {
  value: string;
  label: string;
}

const EmployeeManagement: React.FC = () => {
  // State management
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false); // New loading state for modal
  const [managerOptions, setManagerOptions] = useState<SelectOption[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [departmentRoles, setDepartmentRoles] = useState<Role[]>([]);
  const [availableJobCodes, setAvailableJobCodes] = useState<JobCode[]>([]);

  const [formData, setFormData] = useState({
    employeeNumber: "",
    employeeName: "",
    jobCode: "",
    reportingTo: "",
    roleId: 0,
    departmentId: 0,
  });

  const [originalEmployee, setOriginalEmployee] = useState<Employee | null>(
    null
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const [managerRes, empRes, roleRes, deptsRes] = await Promise.all([
        api.get("/managers/"),
        api.get("/employees/"),
        api.get("/roles"),
        api.get("/departments"),
      ]);
      setManagers(managerRes.data);
      setEmployees(empRes.data);
      setRoles(roleRes.data);
      setDepartments(deptsRes.data);

      const options = managerRes.data.map((manager: Manager) => ({
        value: manager.employee_number,
        label: manager.employee_name,
      }));

      setManagerOptions(options);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchDepartmentRoles = async (departmentId: number) => {
    try {
      const response = await api.get<Role[]>(
        `/withname/departments/${departmentId}/roles`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching department roles:", error);
      return [];
    }
  };

  const fetchAvailableJobCodes = async (
    roleId: number,
    employeeNumber: string
  ) => {
    try {
      const selectedRole = roles.find((role) => role.id === roleId);
      if (selectedRole) {
        const response = await api.get<JobCode[]>(
          `/available-job-codes/${selectedRole.role_code}`,
          {
            params: {
              employee_number: employeeNumber,
            },
          }
        );
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching available job codes:", error);
      return [];
    }
  };

  const handleInputChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const newValue = name.includes("Id")
      ? value
        ? parseInt(value)
        : 0
      : value;

    // Handle department change
    if (name === "departmentId") {
      const roles = newValue
        ? await fetchDepartmentRoles(Number(newValue))
        : [];
      setDepartmentRoles(roles);
      setFormData((prev) => ({
        ...prev,
        roleId: 0,
        [name]: Number(newValue), // Reset role
        jobCode: "", // Reset job code
      }));
      setAvailableJobCodes([]); // Clear job codes
      return;
    }

    // Handle role change
    else if (name === "roleId") {
      const jobCodes = newValue
        ? await fetchAvailableJobCodes(
            Number(newValue),
            formData.employeeNumber
          )
        : [];
      setAvailableJobCodes(jobCodes);
      setFormData((prev) => ({
        ...prev,
        [name]: Number(newValue),
        jobCode: "", // Reset job code
      }));
      return;
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: newValue,
      }));
    }

    // For all other fields
  };
  const handleManagerChange = (selectedOption: SelectOption | null) => {
    setFormData((prev) => ({
      ...prev,
      reportingTo: selectedOption ? selectedOption.value : "",
    }));
  };

  const validateForm = () => {
    const requiredFields = [formData.employeeName];

    // When adding, all fields are required
    requiredFields.push(
      formData.employeeNumber,
      formData.jobCode,
      formData.roleId.toString(),
      formData.departmentId.toString()
    );

    if (requiredFields.some((field) => !field)) {
      toast.error("Please fill all required fields!");
      return false;
    }
    return true;
  };
  const navigate = useNavigate();
  const handleManageCompetencies = (employeeNumber: string) => {
    navigate(`/employee-competencies/${employeeNumber}`);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setFormLoading(true);

    try {
      if (isEditing) {
        // Prepare update data with original employee data as main data
        const employeeData = {
          employee_number: formData.employeeNumber,
          employee_name: formData.employeeName,
          job_code: formData.jobCode,
          reporting_to: formData.reportingTo || null,
          role_id: formData.roleId,
          department_id: formData.departmentId,
        };

        console.log(employeeData);
        await api.put(`/employees/${formData.employeeNumber}`, employeeData);
        toast.info("successfully updated employee");
      } else {
        // Add new employee
        const employeeData = {
          employee_number: formData.employeeNumber,
          employee_name: formData.employeeName,
          job_code: formData.jobCode,
          reporting_to: formData.reportingTo || null,
          role_id: formData.roleId,
          department_id: formData.departmentId,
        };
        await api.post("/employees", employeeData);
        toast.success("successfully created employee");
      }

      await fetchData();
      closeModal();
    } catch (error) {
      console.error(
        `Error ${isEditing ? "updating" : "adding"} employee:`,
        error
      );
      toast.error(
        `Failed to ${
          isEditing ? "update" : "add"
        } employee. Please check console for details.`
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (employeeNumber: string) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await api.delete(`/employees/${employeeNumber}`);
        toast.warn("successfully deleted employee");

        await fetchData();
      } catch (error) {
        console.error("Error deleting employee:", error);
        toast.error(
          "Failed to delete employee. They may have associated records."
        );
      }
    }
  };

  const openModal = async (employee?: Employee) => {
    if (employee) {
      setModalLoading(true);
      setModalOpen(true);

      setIsEditing(true);
      setOriginalEmployee(employee);

      setFormData({
        employeeNumber: employee.employee_number,
        employeeName: employee.employee_name,
        jobCode: employee.job_code,
        reportingTo: employee.reporting_to || "",
        roleId: employee.role_id,
        departmentId: employee.department_id,
      });

      // Fetch dependent data in parallel
      const [deptRoles, jobCodes] = await Promise.all([
        fetchDepartmentRoles(employee.department_id),
        fetchAvailableJobCodes(employee.role_id, employee.employee_number),
      ]);

      setDepartmentRoles(deptRoles);
      setAvailableJobCodes(jobCodes);
    } else {
      // Adding new employee
      setIsEditing(false);
      setOriginalEmployee(null);
      setFormData({
        employeeNumber: "",
        employeeName: "",
        jobCode: "",
        reportingTo: "",
        roleId: 0,
        departmentId: 0,
      });
      setDepartmentRoles([]);
      setAvailableJobCodes([]);
      setModalOpen(true);
    }
    setModalLoading(false);

  };

  const closeModal = () => {
    setModalOpen(false);

    setOriginalEmployee(null);
    setIsEditing(false);
  };

  const renderModal = () => {
    if (!modalOpen) return null;

    if (modalLoading) {
      return (
        <div
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
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p>Loading employee data...</p>
            </div>
          </div>
        </div>
      );
    }
    const filteredManagerOptions = managerOptions.filter(
      (option) => option.value !== originalEmployee?.employee_number
    );

    // Find the current manager option if editing
    const selectedManager = formData.reportingTo
      ? filteredManagerOptions.find(
          (option) => option.value === formData.reportingTo
        )
      : null;


      
    return (
      <div
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
        <div className="bg-white px-7 py-2 mt-10 rounded-lg w-full max-w-md">
          <h4 className="text-lg font-semibold mb-1">
            {isEditing ? "Edit Employee" : "Add Employee"}
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-small mb-1">
                Employee Number
                {!isEditing && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                name="employeeNumber"
                className={`w-full p-1 border border-gray-500 rounded ${
                  isEditing ? "bg-gray-100" : ""
                }`}
                value={formData.employeeNumber}
                onChange={handleInputChange}
                readOnly={isEditing}
                required={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-small mb-1">
                Employee Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="employeeName"
                className="w-full p-1 border border-gray-500 rounded"
                value={formData.employeeName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-small mb-1">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                name="departmentId"
                className="w-full p-1 border border-gray-500 rounded"
                value={formData.departmentId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-small mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                name="roleId"
                className="w-full p-1 border border-gray-500 rounded"
                value={formData.roleId}
                onChange={handleInputChange}
                disabled={!formData.departmentId}
                required
              >
                <option value="">Select Role</option>
                {departmentRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.role_name}
                  </option>
                ))}
              </select>
              {!formData.departmentId && (
                <p className="text-xs text-gray-500 mt-1">
                  Please select a department first
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-small mb-1">
                Job Code <span className="text-red-500">*</span>
              </label>
              <select
                name="jobCode"
                className="w-full p-1 border border-gray-500 rounded"
                value={formData.jobCode}
                onChange={handleInputChange}
                disabled={!formData.roleId}
                required
              >
                <option value="">Select Job Code</option>
                {availableJobCodes.map((job) => (
                  <option key={job.job_code} value={job.job_code}>
                    {job.job_code} - {job.job_name}
                  </option>
                ))}
              </select>
              {!formData.roleId && (
                <p className="text-xs text-gray-500 mt-1">
                  Please select a role first
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-small mb-1">
                Reporting Manager
              </label>
              <Select
                value={selectedManager}
                onChange={handleManagerChange}
                options={filteredManagerOptions}
                isClearable
                isSearchable
                placeholder="Select Reporting Manager"
                className="text-sm"
                styles={{
                  control: (provided) => ({
                    ...provided,
                    borderColor: "#6b7280",
                    minHeight: "34px",
                  }),
                  menu: (provided) => ({
                    ...provided,
                    zIndex: 9999,
                  }),
                }}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-2 mb-4">
            <button
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              onClick={closeModal}
              disabled={formLoading}
            >
              Cancel
            </button>
            <button
              className={`px-4 py-2 ${
                isEditing
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-green-600 hover:bg-green-700"
              } text-white rounded`}
              onClick={handleSubmit}
              disabled={formLoading}
            >
              {formLoading ? "Saving..." : isEditing ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading && employees.length === 0) {
    return (
      <div className="text-2xl font-semibold">Loading employee data...</div>
    );
  }

  return (
    <div className="max-w-8xl mx-auto p-6 mt-20">
      <ToastContainer position="top-right" />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Employee Management</h2>
        <button
          className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded"
          onClick={() => openModal()}
        >
          + Add Employee
        </button>
      </div>

      <div className="overflow-x-auto shadow rounded border border-gray-200">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="p-3 border-b border-gray-200 font-medium">
                Employee Number
              </th>
              <th className="p-3 font-medium border-b border-gray-200">Name</th>
              <th className="p-3 font-medium border-b border-gray-200">
                Job Code
              </th>
              <th className="p-3 font-medium border-b border-gray-200">
                Job Name
              </th>
              <th className="p-3 font-medium border-b border-gray-200">
                Reporting To
              </th>
              <th className="p-3 font-medium border-b border-gray-200">
                Department
              </th>
              <th className="p-3 font-medium border-b border-gray-200">
                Role Code
              </th>
              <th className="p-3 font-medium border-b border-gray-200">
                Role Name
              </th>

              <th className="p-3 font-medium border-b border-gray-200 text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => {
              const department = departments.find(
                (d) => d.id === employee.department_id
              );
              const role = roles.find((r) => r.id === employee.role_id);
              const manager = managers.find(
                (m) => m.employee_number === employee.reporting_to
              );
              return (
                <tr
                  key={employee.employee_number}
                  className="hover:bg-blue-100 "
                >
                  <td className="p-3 border-t border-gray-100">
                    {employee.employee_number}
                  </td>
                  <td className="p-3 border-t border-gray-100">
                    {employee.employee_name}
                  </td>
                  <td className="p-3 border-t border-gray-100">
                    {employee.job_code}
                  </td>
                  <td className="p-3 border-t border-gray-100">
                    {employee.job_name}
                  </td>
                  <td className="p-3 border-t border-gray-100">
                    {manager?.employee_name || "-"}
                  </td>
                  <td className="p-3 border-t border-gray-100">
                    {department?.name || "-"}
                  </td>
                  <td className="p-3 border-t border-gray-100">
                    {role?.role_code || "-"}
                  </td>
                  <td className="p-3 border-t border-gray-100">
                    {role?.role_name || "-"}
                  </td>
                  <td className="p-3 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2 justify-center">
                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                        onClick={() => openModal(employee)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                        onClick={() => handleDelete(employee.employee_number)}
                      >
                        Delete
                      </button>
                      <button
                        className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm"
                        onClick={() =>
                          handleManageCompetencies(employee.employee_number)
                        }
                      >
                        Manage
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {renderModal()}
    </div>
  );
};

export default EmployeeManagement;
