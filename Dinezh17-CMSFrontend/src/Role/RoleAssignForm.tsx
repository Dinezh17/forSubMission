import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../interceptor/api";
import { toast, ToastContainer } from "react-toastify";

interface Competency {
  competency_code: string;
  competency_name: string;
  competency_description: string;
}

interface AssignedCompetency {
  competency_code: string;
  role_competency_required_score: number;
}

const RoleCompetencyAssignment: React.FC = () => {
  const { roleCode } = useParams<{ roleCode: string }>();
  const navigate = useNavigate();

  if (!roleCode) {
    return <></>;
  }

  const roleid = parseInt(roleCode);
  const [roleName, setRoleName] = useState<string>("");
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [assignedCompetencies, setAssignedCompetencies] = useState<AssignedCompetency[]>([]);
  const [selectedCompetencies, setSelectedCompetencies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [competencyScores, setCompetencyScores] = useState<{[key: string]: string}>({});
  const [activeTab, setActiveTab] = useState<"assign" | "score">("assign");
  const [isEditingScores, setIsEditingScores] = useState(false);

  const fetchAllData = async () => {
    try {
      const [compsRes, roleCompsRes, roleDetailsRes] = await Promise.all([
        api.get("/competency"),
        api.get(`/roles/${roleCode}/competencies/detailed`),
        api.get(`/getrole/${roleCode}`),
      ]);

      setCompetencies(compsRes.data);
      setAssignedCompetencies(roleCompsRes.data);

     
      if (roleDetailsRes.data?.role_name) {
        setRoleName(roleDetailsRes.data.role_name);
      } else {
        setRoleName("no name");
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [roleCode]);

  const toggleCompetency = (competency_code: string) => {
    setSelectedCompetencies(prev =>
      prev.includes(competency_code)
        ? prev.filter(c => c !== competency_code)
        : [...prev, competency_code]
    );
  };

  const selectAll = (type: "available" | "assigned") => {
    if (type === "available") {
      const availableCodes = competencies
        .filter(c => !assignedCompetencies.some(ac => ac.competency_code === c.competency_code))
        .map(c => c.competency_code);
      setSelectedCompetencies(availableCodes);
    } else {
      setSelectedCompetencies(assignedCompetencies.map(c => c.competency_code));
    }
  };

  const clearSelection = () => {
    setSelectedCompetencies([]);
  };

  const handleAssign = async () => {
    if (!roleid || selectedCompetencies.length === 0) return;
    if(window.confirm("This will also reflect on employee competencies are you sure")){
      const competenciesToAssign = selectedCompetencies.filter(
        code => !assignedCompetencies.some(ac => ac.competency_code === code)
      );

      if (competenciesToAssign.length === 0) return;

      try {
        await api.post(`/roles/${roleid}/competencies`, competenciesToAssign);
        toast.success("Competencies assigned successfully")
        
        await fetchAllData();
        setSelectedCompetencies([]);
      } catch (error:any) {

        toast.error("Error assigning competencies:", error);
        console.error("Error assigning competencies:", error);
      }
    }
  };

  const handleRemove = async () => {
    if (!roleid || selectedCompetencies.length === 0) return;
    if(window.confirm("This will also reflect on employee competencies are you sure")){
      const competenciesToRemove = selectedCompetencies.filter(code =>
        assignedCompetencies.some(ac => ac.competency_code === code)
      );

      if (competenciesToRemove.length === 0) return;

      try {
        await api.delete(`/roles/${roleid}/competencies`, {
          data: competenciesToRemove,
        });
        toast.warn("competencies removed successfully")

        await fetchAllData();
        setSelectedCompetencies([]);
      } catch (error :any) {
        
        toast.error("Error removing competencies:", error);
        console.error("Error removing competencies:", error);
      }
    }
  };

  const handleScoreChange = (competencyCode: string, value: string) => {
    // Allow empty string or numbers 1-4
    if (value === "" || (["1", "2", "3", "4"].includes(value))) {
      setCompetencyScores(prev => ({
        ...prev,
        [competencyCode]: value,
      }));
    }
  };

  const handleSaveScores = async () => {
    if (!roleid) return;
    
    // Check if any values are empty strings
    const hasEmptyScores = Object.values(competencyScores).some(score => score === "");
    if (hasEmptyScores) {
      toast.error("Please enter a score (1-4) for all competencies");
      return;
    }
    
    if(window.confirm("This will also reflect on employee competencies are you sure")){
      try {
        const payload = assignedCompetencies.map(comp => ({
          competency_code: comp.competency_code,
          role_competency_required_score: competencyScores[comp.competency_code] 
            ? parseInt(competencyScores[comp.competency_code]) 
            : comp.role_competency_required_score
        }));

        await api.put(`/roles/${roleid}/competencies/scores`, payload);
        await fetchAllData();
        toast.success("Scores updated successfully");
        setIsEditingScores(false);
      } catch (error:any) {
        toast.error("Error updating competency scores:", error);
        console.error("Error updating competency scores:", error);
      }
    }
  };

  const toggleScoreEditing = () => {
    setIsEditingScores(!isEditingScores);
    if (!isEditingScores) {
      // When enabling edit mode, initialize with current scores
      const currentScores: { [key: string]: string } = {};
      assignedCompetencies.forEach(comp => {
        currentScores[comp.competency_code] = comp.role_competency_required_score.toString();
      });
      setCompetencyScores(currentScores);
    }
  };

  const goBackToRoles = () => {
    navigate("/role-crud");
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-xl text-gray-600">Loading...</div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 font-sans mt-20">
      <ToastContainer position="top-right" />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manage Competencies for {roleName}</h2>
        <button
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
          onClick={goBackToRoles}
        >
          Back to Roles
        </button>
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        <div
          className={`px-4 py-3 font-medium cursor-pointer rounded-t-lg mr-2 transition-colors ${
            activeTab === "assign" 
              ? "bg-blue-50 border border-gray-200 border-b-white text-blue-600" 
              : "text-gray-600 hover:text-gray-800"
          }`}
          onClick={() => setActiveTab("assign")}
        >
          Assign Competencies
        </div>
        <div
          className={`px-4 py-3 font-medium cursor-pointer rounded-t-lg transition-colors ${
            activeTab === "score" 
              ? "bg-blue-50 border border-gray-200 border-b-white text-blue-600" 
              : "text-gray-600 hover:text-gray-800"
          }`}
          onClick={() => setActiveTab("score")}
        >
          Set Required Scores
        </div>
      </div>

      {activeTab === "assign" ? (
        <div className="flex flex-col gap-6">
          <div className="flex justify-end items-center sticky top-22">
           
          <div className="flex gap-3">
              <button
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCompetencies.length === 0 ||
                  selectedCompetencies.every(c =>
                    assignedCompetencies.some(ac => ac.competency_code === c)
                  )
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
                onClick={handleAssign}
                disabled={
                  selectedCompetencies.length === 0 ||
                  selectedCompetencies.every(c =>
                    assignedCompetencies.some(ac => ac.competency_code === c)
                  )
                }
              >
                Assign Selected
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCompetencies.length === 0 ||
                  selectedCompetencies.every(
                    c => !assignedCompetencies.some(ac => ac.competency_code === c)
                  )
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
                onClick={handleRemove}
                disabled={
                  selectedCompetencies.length === 0 ||
                  selectedCompetencies.every(
                    c => !assignedCompetencies.some(ac => ac.competency_code === c))
                }
              >
                Remove Selected
              </button>
           
          </div>
          </div>

          {/* Available Competencies Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-64">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-700">Available Competencies</h3>
              <div className="flex gap-3">
                <button
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    assignedCompetencies.length === competencies.length
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => selectAll("available")}
                  disabled={assignedCompetencies.length === competencies.length}
                >
                  Select All
                </button>
                <button
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    selectedCompetencies.length === 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                  onClick={clearSelection}
                  disabled={selectedCompetencies.length === 0}
                >
                  Clear Selection
                </button>
              </div>
            </div>

            {competencies.every(all =>
              assignedCompetencies.some(ac => ac.competency_code === all.competency_code)
            ) ? (
              <div className="py-8 text-center text-gray-500 italic">No available competencies</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-12 p-4 text-left font-semibold text-gray-600"></th>
                      <th className="w-32 p-4 text-left font-semibold text-gray-600">Code</th>
                      <th className="p-4 text-left font-semibold text-gray-600">Name</th>
                      <th className="p-4 text-left font-semibold text-gray-600">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {competencies
                      .filter(c => !assignedCompetencies.some(ac => ac.competency_code === c.competency_code))
                      .map(comp => (
                        <tr key={`available-${comp.competency_code}`} className="hover:bg-gray-50">
                          <td className="p-4">
                            <input
                              type="checkbox"
                              id={`avail-${comp.competency_code}`}
                              checked={selectedCompetencies.includes(comp.competency_code)}
                              onChange={() => toggleCompetency(comp.competency_code)}
                              className="w-5 h-5 rounded text-blue-500 cursor-pointer"
                            />
                          </td>
                          <td className="p-4">
                            <strong className="font-semibold text-gray-700">{comp.competency_code}</strong>
                          </td>
                          <td className="p-4">
                            <label
                              htmlFor={`avail-${comp.competency_code}`}
                              className="cursor-pointer text-gray-700"
                            >
                              {comp.competency_name}
                            </label>
                          </td>
                          <td className="p-4 text-gray-600">
                            {comp.competency_description}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
       
          {/* Assigned Competencies Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-64">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-700">Assigned Competencies</h3>
              <div className="flex gap-3">
                <button
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    assignedCompetencies.length === 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => selectAll("assigned")}
                  disabled={assignedCompetencies.length === 0}
                >
                  Select All
                </button>
                <button
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    selectedCompetencies.length === 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                  onClick={clearSelection}
                  disabled={selectedCompetencies.length === 0}
                >
                  Clear Selection
                </button>
              </div>
            </div>

            {assignedCompetencies.length === 0 ? (
              <div className="py-8 text-center text-gray-500 italic">No competencies assigned</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-12 p-4 text-left font-semibold text-gray-600"></th>
                      <th className="w-32 p-4 text-left font-semibold text-gray-600">Code</th>
                      <th className="p-4 text-left font-semibold text-gray-600">Name</th>
                      <th className="p-4 text-left font-semibold text-gray-600">Description</th>
                      <th className="w-32 p-4 text-left font-semibold text-gray-600 whitespace-nowrap">Required Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {competencies
                      .filter(c => assignedCompetencies.some(ac => ac.competency_code === c.competency_code))
                      .map(comp => {
                        const assignedComp = assignedCompetencies.find(
                          ac => ac.competency_code === comp.competency_code
                        );
                        return (
                          <tr key={`assigned-${comp.competency_code}`} className="hover:bg-gray-50">
                            <td className="p-4">
                              <input
                                type="checkbox"
                                id={`assigned-${comp.competency_code}`}
                                checked={selectedCompetencies.includes(comp.competency_code)}
                                onChange={() => toggleCompetency(comp.competency_code)}
                                className="w-5 h-5 rounded text-blue-500 cursor-pointer"
                              />
                            </td>
                            <td className="p-4">
                              <strong className="font-semibold text-gray-700">{comp.competency_code}</strong>
                            </td>
                            <td className="p-4">
                              <label
                                htmlFor={`assigned-${comp.competency_code}`}
                                className="cursor-pointer text-gray-700"
                              >
                                {comp.competency_name}
                              </label>
                            </td>
                            <td className="p-4 text-gray-600">
                              {comp.competency_description}
                            </td>
                            <td className="p-4 text-gray-700 text-center">
                              {assignedComp?.role_competency_required_score || "-"}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Set Required Scores */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-64">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-700">Set Required Scores for Competencies</h3>
              <div className="flex gap-3">
                <button
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    assignedCompetencies.length === 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : isEditingScores
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-blue-500 hover:bg-blue-200 text-white"
                  }`}
                  onClick={toggleScoreEditing}
                  disabled={assignedCompetencies.length === 0}
                >
                  {isEditingScores ? "Editing Scores" : "Edit Scores"}
                </button>
              </div>
            </div>

            {assignedCompetencies.length === 0 ? (
              <div className="py-8 text-center text-gray-500 italic">No competencies assigned</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-32 p-4 text-left font-semibold text-gray-600">Code</th>
                      <th className="p-4 text-left font-semibold text-gray-600">Name</th>
                      <th className="p-4 text-left font-semibold text-gray-600">Description</th>
                      <th className="w-40 p-4 text-left font-semibold text-gray-600">Required Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {competencies
                      .filter(c => assignedCompetencies.some(ac => ac.competency_code === c.competency_code))
                      .map(comp => {
                        const assignedComp = assignedCompetencies.find(
                          ac => ac.competency_code === comp.competency_code
                        );
                        return (
                          <tr key={`score-${comp.competency_code}`} className="hover:bg-gray-50">
                            <td className="p-4">
                              <strong className="font-semibold text-gray-700">{comp.competency_code}</strong>
                            </td>
                            <td className="p-4 text-gray-700">
                              {comp.competency_name}
                            </td>
                            <td className="p-4 text-gray-600">
                              {comp.competency_description}
                            </td>
                            <td className="p-4">
                              <input
                                type="text"
                                value={
                                  isEditingScores
                                    ? competencyScores[comp.competency_code] !== undefined
                                      ? competencyScores[comp.competency_code]
                                      : assignedComp?.role_competency_required_score.toString() || ""
                                    : assignedComp?.role_competency_required_score.toString() || ""
                                }
                                onChange={(e) =>
                                  handleScoreChange(
                                    comp.competency_code,
                                    e.target.value
                                  )
                                }
                                className="w-16 p-2 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
                                disabled={!isEditingScores}
                              />
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {isEditingScores && (
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
                onClick={handleSaveScores}
              >
                Save All Scores
              </button>
              <button
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
                onClick={() => {
                  setIsEditingScores(false);
                  // Reset to original scores
                  const originalScores: { [key: string]: string } = {};
                  assignedCompetencies.forEach(comp => {
                    originalScores[comp.competency_code] = comp.role_competency_required_score.toString();
                  });
                  setCompetencyScores(originalScores);
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RoleCompetencyAssignment;