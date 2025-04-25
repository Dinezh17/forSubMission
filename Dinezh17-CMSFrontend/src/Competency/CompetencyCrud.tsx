import React, { useState, useEffect, useContext } from "react";
import api, { configureApi } from "../interceptor/api";
import { AuthContext } from "../auth/AuthContext";
import { toast, ToastContainer } from "react-toastify";

interface Competency {
  competency_code: string;
  competency_name: string;
  competency_description?: string;
}
interface CreateCompetency {
  competency_code: string;
  competency_name: string;
  competency_description: string;
}

const CompetencyManagement: React.FC = () => {
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateCompetency>({
    competency_code: "",
    competency_name: "",
    competency_description: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const { logout } = useContext(AuthContext)!;

  const fetchCompetencies = async () => {
    try {
      const response = await api.get("/competency");
      setCompetencies(response.data);
    } catch (error: any) {
      console.error("Error fetching competencies:", error);
    }
  };
  useEffect(() => {
    configureApi(logout);
  }, [logout]);

  useEffect(() => {
    fetchCompetencies();
  }, [logout]);

  const handleSubmit = async () => {
    if (
      !formData.competency_code.trim() ||
      !formData.competency_name.trim() ||
      !formData.competency_description.trim()
    ) {
      toast.error("Code, name and score are required!");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/competency/${editingId}`, formData);
        toast.info("Competency updated successfully")

        fetchCompetencies();
      } else {
        await api.post("/competency", formData);
        fetchCompetencies();
        toast.success("Competency created successfully")

      }
      closeModal();
    } catch (error: any) {
      toast.error("Failed " + "  " + error?.response?.data?.detail || "error");

      console.error("Error saving competency:", error);
    }
  };

  const handleDelete = async (code: string) => {
    if (window.confirm("Delete this competency?")) {
      try {
        await api.delete(`/competency/${code}`);
        toast.warn("Competency deleted successfully")
        fetchCompetencies();
      } catch (error: any) {
        toast.error("Failed " + "  " + error?.response?.data?.detail || "error");

        console.error("Error deleting competency:", error);
      }
    }
  };

  const openModal = (competency?: Competency) => {
    if (competency) {
      setEditingId(competency.competency_code);
      setFormData({
        competency_code: competency.competency_code,
        competency_name: competency.competency_name,
        competency_description: competency.competency_description || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        competency_code: "",
        competency_name: "",
        competency_description: "",
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 mt-20">
      <ToastContainer position="top-right" />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Competency Management</h2>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
          onClick={() => openModal()}
        >
          + Add Competency
        </button>
      </div>
      <div className="overflow-x-auto shadow rounded border border-gray-200">
        <table className="w-full border border-gray-200 rounded-md shadow-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border-b border-gray-200 font-medium text-left">Code</th>
              <th className="p-3 border-b border-gray-200 text-left font-medium">Name</th>
              <th className="p-3 border-b border-gray-200 text-left font-medium">Type</th>
              <th className="p-3 border-b border-gray-200 text-left font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {competencies.map((competency) => (
              <tr
                key={competency.competency_code}
                className="hover:bg-blue-100"
              >
                <td className="p-3 border-t border-gray-100 whitespace-nowrap">
                  {competency.competency_code}
                </td>
                <td className="p-3 border-t border-gray-100 max-w-xs break-words">
                  {competency.competency_name}
                </td>
                <td className="p-3 border-t border-gray-100">
                  {competency.competency_description || "-"}
                </td>
                <td className="p-3 border-t border-gray-100 space-x-2">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                    onClick={() => openModal(competency)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                    onClick={() => handleDelete(competency.competency_code)}
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
            backgroundColor: "rgba(0, 0, 0, 0.2)", // Black with 20% opacity
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? "Edit Competency" : "Add Competency"}
            </h3>
            <input
              type="text"
              name="competency_code"
              placeholder="Competency code"
              value={formData.competency_code}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 mb-3 border border-gray-300 rounded-md ${
                editingId ? "bg-gray-100" : ""
              }`}
              readOnly={!!editingId}
            />
            <input
              type="text"
              name="competency_name"
              placeholder="Competency name"
              value={formData.competency_name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-md"
            />
            <select
              name="competency_description"
              value={formData.competency_description}
              onChange={handleInputChange}
              className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-md"
            >
              <option value="">Select Type</option>
              <option value="Functional">Functional</option>
              <option value="Behavioral">Behavioral</option>
            </select>
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

export default CompetencyManagement;
