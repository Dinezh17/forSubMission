import React, { useState, useEffect } from "react";
import api from "../interceptor/api";
import { toast, ToastContainer } from "react-toastify";
// tested
interface BusinessDivision {
  id: number;
  name: string;
}

const BusinessDivisionManagement: React.FC = () => {
  const [divisions, setDivisions] = useState<BusinessDivision[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<string>("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchDivisions = async () => {
    try {
      const response = await api.get("/business-divisions");
      setDivisions(response.data);
    } catch (error: any) {
      toast.error("Error fetching business divisions");
      console.error("Error fetching divisions:", error);
    }
  };

  useEffect(() => {
    fetchDivisions();
  }, []);

  const handleSubmit = async () => {
    if (!formData.trim()) {
      toast.warn("Division name is required!");
      return;
    }

    const data = { name: formData };

    try {
      if (editingId) {
        await api.put(`/business-divisions/${editingId}`, data);
        toast.info("Business Division updated successfully");
      } else {
        await api.post("/business-divisions", data);
        toast.success("Business Division added successfully");
      }

      fetchDivisions();
      closeModal();
    } catch (error: any) {
      toast.error("Failed " + error?.response?.data?.detail);
      console.error("Error saving division:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Delete this business division?")) {
      try {
        await api.delete(`/business-divisions/${id}`);
        toast.warn("Business Division deleted successfully");
        fetchDivisions();
      } catch (error: any) {
        toast.error("Failed " + error?.response?.data?.detail);
        console.error("Error deleting division:", error);
      }
    }
  };

  const openModal = (division?: BusinessDivision) => {
    if (division) {
      setEditingId(division.id);
      setFormData(division.name);
    } else {
      setEditingId(null);
      setFormData("");
    }
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(e.target.value);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 mt-20">
      <ToastContainer position="top-right" />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Business Division Management</h2>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
          onClick={() => openModal()}
        >
          + Add Division
        </button>
      </div>
      <div className="overflow-x-auto shadow rounded border border-gray-200">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border-b font-medium border-gray-200 text-left">ID</th>
              <th className="p-3 border-b font-medium border-gray-200 text-left">Division Name</th>
              <th className="p-3 border-b font-medium border-gray-200 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {divisions.map((div) => (
              <tr key={div.id} className="hover:bg-blue-100">
                <td className="p-3 border-t border-gray-100">{div.id}</td>
                <td className="p-3 border-t border-gray-100">{div.name}</td>
                <td className="p-3 border-t border-gray-100 space-x-2">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                    onClick={() => openModal(div)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                    onClick={() => handleDelete(div.id)}
                  >
                    Delete
                  </button>
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
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? "Edit Business Division" : "Add Business Division"}
            </h3>
            {editingId && (
              <input
                type="text"
                name="division_id"
                placeholder="Division ID"
                value={editingId}
                className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-md bg-gray-100"
                readOnly
              />
            )}
            <input
              type="text"
              name="name"
              placeholder="Division name"
              value={formData}
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

export default BusinessDivisionManagement;
