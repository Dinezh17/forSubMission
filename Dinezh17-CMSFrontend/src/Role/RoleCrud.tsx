import React, { useState, useEffect } from "react";
import api from "../interceptor/api";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

interface Role {
  id: number;
  role_code: string;
  role_name: string;
  role_category: string;
  assigned_comp_count:number;
  department_name: string;
}

interface RoleCrud {
  role_code: string;
  role_name: string;
  role_category: string;
}

interface Department {
  id: number;
  name: string;
}

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<RoleCrud>({
    role_code: "",
    role_name: "",
    role_category: "",
  });
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingDepartment, setEditingDpt] = useState<string | null>(null);

  const navigate = useNavigate();

  const fetchRoles = async () => {
    try {
      const response = await api.get("/roles");
      setRoles(response.data);
    } catch (error: any) {
      toast.warn("Failed " + error?.response?.data?.detail);
      console.error("Error fetching roles:", error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get("/departments");
      setDepartments(response.data);
    } catch (error: any) {
      toast.error("Error fetching departments");
      console.error("Error fetching departments:", error);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchDepartments();
  }, []);

  const handleSubmit = async () => {
    if (!formData.role_code.trim() || !formData.role_category.trim() || !formData.role_name.trim()) {
      toast.warn("All fields are required!");
      return;
    }
  
    if (!selectedDepartment && !editingId) {
      toast.warn("Please select a department");
      return;
    }
  
    try {
      if (editingId) {
        await api.put(`/roles/${editingId}`, formData);
        toast.info("Role updated successfully");
      } else {
        // Single request with department assignment
        const requestData = {
          ...formData,
          department_id: selectedDepartment
        };
        await api.post("/roles", requestData);
        toast.success("Role created and assigned successfully");
      }
      fetchRoles();
      closeModal();
    } catch (error: any) {
      toast.error("Failed: " + (error?.response?.data?.detail || error.message));
      console.error("Error saving role:", error);
    }
  };



  

  const handleDelete = async (id: number) => {
    if (window.confirm("Delete this role?")) {
      try {
        await api.delete(`/roles/${id}`);
        fetchRoles();
        toast.warn("Role deleted successfully");
      } catch (error: any) {
        toast.error("Failed " + error?.response?.data?.detail);
        console.error("Error deleting role:", error);
      }
    }
  };

  const handleManageCompetencies = (role: Role) => {
    navigate(`/role-competencies/${role.id}`);
  };

  const openModal = (role?: Role) => {
    if (role) {
      setEditingId(role.id);
      setEditingDpt(role.department_name)
      setFormData({
        role_code: role.role_code,
        role_name: role.role_name,
        role_category: role.role_category,
      });
    } else {
      setEditingId(null);
      setFormData({ role_code: "", role_name: "", role_category: "" });
      setSelectedDepartment(null);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDepartment(Number(e.target.value));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 mt-20">
      <ToastContainer position="top-right" />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Role Management</h2>
        <button
          className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded"
          onClick={() => openModal()}
        >
          + Add Role
        </button>
      </div>

      <div className="overflow-x-auto shadow rounded border border-gray-200">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="p-3 font-medium">Role Code</th>
              <th className="p-3 font-medium">Role Name</th>
              <th className="p-3 font-medium">Role Category</th>
              <th className="p-3 font-medium">Department</th>
              <th className="p-3 font-medium">Assigned Competencies</th>

              <th className="p-3 font-medium whitespace-nowrap text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr
                key={role.id}
                className="hover:bg-blue-100 border-b border-gray-200"
              >
               
                <td className="p-3 border-b border-gray-200">
                  {role.role_code}
                </td>
                <td className="p-3 border-b border-gray-200">
                  {role.role_name}
                </td>
                <td className="p-3 border-b border-gray-200">
                  {role.role_category}
                </td>
                <td className="p-3 border-b border-gray-200">
                  {role.department_name}
                </td>
                <td className="p-3 border-b border-gray-200">
                  {role.assigned_comp_count} Assigned  
                </td>
                <td className="p-3 border-b border-gray-200">
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      onClick={() => openModal(role)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                      onClick={() => handleDelete(role.id)}
                    >
                      Delete
                    </button>
                    <button
                      className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm"
                      onClick={() => handleManageCompetencies(role)}
                    >
                      Manage
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
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
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">
              {editingId ? "Edit Role" : "Add Role"}
            </h3>

            {editingId && (<>
                 <label className="block text-sm font-small mb-1">
                 Department <span className="text-red-500">*</span>
               </label>
             <input
                type="text"
                name="role_id"
                value={editingDepartment?editingDepartment:""}
                readOnly
                className="w-full p-2 mb-3 border border-gray-300 rounded cursor-not-allowed bg-gray-100"
              />
              </>
            )}
             {!editingId && (<>
              <label className="block text-sm font-small mb-1">
                  Select Department <span className="text-red-500">*</span>
               </label>
              <select
                value={selectedDepartment || ""}
                onChange={handleDepartmentChange}
                className="w-full p-2 mb-3 border border-gray-300 rounded"
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              </>
            )}
            <label className="block text-sm font-small mb-1">
            Role Code <span className="text-red-500">*</span>
               </label>
            <input
              type="text"
              name="role_code"
            
              value={formData.role_code}
              onChange={handleInputChange}
              className={`w-full p-2 mb-3 border border-gray-300 rounded ${editingId ? 'bg-gray-100 cursor-not-allowed' : 'bg-white text-black'}`}
              disabled={!!editingId}
            />
            <label className="block text-sm font-small mb-1">
            Role Name <span className="text-red-500">*</span>
               </label>
            <input
              type="text"
              name="role_name"
              value={formData.role_name}
              onChange={handleInputChange}
              className="w-full p-2 mb-3 border border-gray-300 rounded"
            />
             <label className="block text-sm font-small mb-1">
            Role Category <span className="text-red-500">*</span>
               </label>
            <input
              type="text"
              name="role_category"
              value={formData.role_category}
              onChange={handleInputChange}
              className="w-full p-2 mb-3 border border-gray-300 rounded"
            />

           

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Save
              </button>
              <button
                onClick={closeModal}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;