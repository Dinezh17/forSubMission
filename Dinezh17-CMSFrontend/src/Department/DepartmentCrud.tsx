import React, { useState, useEffect } from "react";
import api from "../interceptor/api";

import { toast, ToastContainer } from "react-toastify";
// tested
interface Department {
  id: number;
  name: string;
  business_division_id: number;
}

interface BusinessDivision {
  id: number;
  name: string;
}

const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [businessDivisions, setBusinessDivisions] = useState<
    BusinessDivision[]
  >([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    business_division_id: 0,
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchDepartments = async () => {
    try {
      const response = await api.get("/departments");
      setDepartments(response.data);
    } catch (error: any) {
      toast.error("Error fetching departments");
      console.error("Error fetching departments:", error);
    }
  };

  const fetchBusinessDivisions = async () => {
    try {
      const response = await api.get("/business-divisions/");
      setBusinessDivisions(response.data);
    } catch (error: any) {
      toast.error("Error fetching business divisions");
      console.error("Error fetching business divisions:", error);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchBusinessDivisions();
  }, []);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.warn("Department name is required!");
      return;
    }

    if (formData.business_division_id === 0) {
      toast.warn("Business Division is required!");
      return;
    }

    const data = {
      name: formData.name.trim(),
      business_division_id: Number(formData.business_division_id),
    };

    try {
      if (editingId) {
        await api.put(`/departments/${editingId}`, data);
        toast.info("Department updated successfully");
      } else {
        await api.post("/departments", data);
        toast.success("Department added successfully");
      }

      fetchDepartments();
      closeModal();
    } catch (error: any) {
      toast.error("Failed " + error?.response?.data?.detail);
      console.error("Error saving department:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Delete this department?")) {
      try {
        await api.delete(`/departments/${id}`);
        toast.warn("Department deleted successfully");
        fetchDepartments();
      } catch (error: any) {
        toast.error("Failed " + error?.response?.data?.detail);
        console.error("Error deleting department:", error);
      }
    }
  };

  const openModal = (department?: Department) => {
    if (department) {
      setEditingId(department.id);
      setFormData({
        name: department.name,
        business_division_id: department.business_division_id,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        business_division_id: 0,
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "business_division_id" ? Number(value) : value,
    }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 mt-20">
      <ToastContainer position="top-right" />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Department Management</h2>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
          onClick={() => openModal()}
        >
          + Add Department
        </button>
      </div>
      <div className="overflow-x-auto shadow rounded border border-gray-200">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border-b font-medium border-gray-200 text-left">
                ID
              </th>
              <th className="p-3 border-b font-medium border-gray-200 text-left">
                Department Name
              </th>
              <th className="p-3 border-b font-medium border-gray-200 text-left">
                Business Division
              </th>
              <th className="p-3 border-b font-medium border-gray-200 text-left">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => {
              const division = businessDivisions.find(
                (bd) => bd.id === dept.business_division_id
              );
              return (
                <tr key={dept.id} className="hover:bg-blue-100">
                  <td className="p-3 border-t border-gray-100">{dept.id}</td>
                  <td className="p-3 border-t border-gray-100">{dept.name}</td>
                  <td className="p-3 border-t border-gray-100">
                    {division ? division.name : "Unknown"}
                  </td>
                  <td className="p-3 border-t border-gray-100 space-x-2">
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                      onClick={() => openModal(dept)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                      onClick={() => handleDelete(dept.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
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
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? "Edit Department" : "Add Department"}
            </h3>

            <label className="block text-sm font-small mb-1">
              Business Division <span className="text-red-500">*</span>
            </label>
            {editingId ? (
              <input
                type="text"
                readOnly
                className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md bg-gray-100"
                value={
                  businessDivisions.find(
                    (bd) => bd.id === formData.business_division_id
                  )?.name || "Unknown"
                }
              />
            ) : (
              <select
                name="business_division_id"
                value={formData.business_division_id}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 mb-4 border border-gray-300 rounded-md`}
                required
              >
                <option value={0}>Select Business Division</option>
                {businessDivisions.map((division) => (
                  <option key={division.id} value={division.id}>
                    {division.name}
                  </option>
                ))}
              </select>
            )}

            <label className="block text-sm font-small mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="Department name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md"
            />

            <div className="flex justify-end space-x-2">
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                onClick={handleSubmit}
              >
                Save
              </button>
              <button
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                onClick={closeModal}
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

export default DepartmentManagement;
