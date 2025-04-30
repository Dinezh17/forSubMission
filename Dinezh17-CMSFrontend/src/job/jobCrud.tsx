import React, { useState, useEffect } from "react";
import api from "../interceptor/api";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

interface Role {
  role_code: string;
  role_name: string;
}

interface JobSummary {
  department_name: string;
  role_code: string;
  role_name: string;
  role_category: string;
  job_name: string;
  LastCode: string;
  count: number;
}

interface JobFormData {
  role_code: string;
  job_name: string;
  prefix: string;
  start: string;
  count: string;
}

interface FormErrors {
  count: string;
  prefix: string;
  start: string;
}
interface JobCode {
  job_code: string;
  job_name: string;
  job_status: boolean;
}

const JobManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [jobSummaries, setJobSummaries] = useState<JobSummary[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();
  const [currentJob, setCurrentJob] = useState<JobSummary | null>(null);
  const [formData, setFormData] = useState<JobFormData>({
    role_code: "",
    job_name: "",
    prefix: "",
    start: "1",
    count: "1",
  });
  const [errors, setErrors] = useState<FormErrors>({
    count: "",
    prefix: "",
    start: "",
  });
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [jobCodes, setJobCodes] = useState<JobCode[]>([]);
  useEffect(() => {
    fetchRoles();
    fetchJobs();
  }, []);

  const fetchRoles = async () => {
    const res = await api.get("/roles");
    setRoles(res.data);
  };
  const ViewCodes = async (job: JobSummary) => {
    try {
      const response = await api.get(
        `/jobs/by-role/${job.role_code}/${job.job_name}`
      );
      setJobCodes(response.data);
      setCurrentJob(job);
      setViewModalOpen(true);
    } catch (err: any) {
      toast.error("Failed to fetch job codes: " + err?.response?.data?.detail);
    }
  };
  const fetchJobs = async () => {
    const res = await api.get("/jobs-summary");
    setJobSummaries(res.data.jobs_by_name);
  };

  const validateCount = (value: string) => {
    const numValue = Number(value);
    if (isNaN(numValue)) {
      return "Count must be a number";
    }
    if (numValue === 0) {
      return "Count cannot be zero";
    }
    if (numValue < 0) {
      return "Count cannot be negative";
    }
    return "";
  };

  const validateStart = (value: string) => {
    const numValue = Number(value);
    if (isNaN(numValue)) {
      return "Start must be a number";
    }
    if (numValue === 0) {
      return "Start cannot be zero";
    }
    if (numValue < 0) {
      return "Start cannot be negative";
    }
    return "";
  };

  const validatePrefix = (value: string) => {
    if (/\d/.test(value)) {
      return "Prefix cannot contain numbers";
    }
    return "";
  };

  const hasEmptyFields = () => {
    return (
      !formData.role_code.trim() ||
      !formData.job_name.trim() ||
      !formData.prefix.trim() ||
      !formData.start.trim() ||
      !formData.count.trim()
    );
  };

  const handleSubmit = async () => {
    if (hasEmptyFields()) {
      toast.warn("All fields are required!");
      return;
    }

    // Validate all fields before submitting
    const countError = validateCount(formData.count);
    const startError = validateStart(formData.start);
    const prefixError = validatePrefix(formData.prefix);

    if (countError || startError || prefixError) {
      setErrors({
        count: countError,
        start: startError,
        prefix: prefixError,
      });
      return;
    }

    try {
      if (editMode && currentJob) {
        // Update/Add jobs
        await api.post("/jobs", {
          ...formData,
          start: parseInt(formData.start),
          count: parseInt(formData.count),
        });
        toast.info("Jobs added successfully");
      } else {
        // Create new jobs
        await api.post("/jobs", {
          ...formData,
          start: parseInt(formData.start),
          count: parseInt(formData.count),
        });
        toast.success("Jobs created successfully");
      }
      fetchJobs();
      closeModal();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to process jobs.");
    }
  };

  const handleDeleteJobs = async () => {
    if (!currentJob) return;

    if (!formData.count.trim()) {
      setErrors((prev) => ({
        ...prev,
        count: "Count is required",
      }));
      return;
    }

    const countError = validateCount(formData.count);
    if (countError) {
      setErrors((prev) => ({
        ...prev,
        count: countError,
      }));
      return;
    }

    const countNum = parseInt(formData.count);
    if (countNum > currentJob.count) {
      setErrors((prev) => ({
        ...prev,
        count: `Cannot remove more than ${currentJob.count} jobs`,
      }));
      return;
    }
    if (window.confirm("Confirm deletion")) {
      try {
        await api.delete("/jobs", {
          data: {
            job_name: currentJob.job_name,
            role_code: currentJob.role_code,
            count: countNum,
          },
        });
        toast.warn("Jobs removed successfully");
        fetchJobs();
        closeDeleteModal();
      } catch (err: any) {
        toast.error("Failed " + err?.response?.data?.detail);
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "count") {
      // Only allow numeric input
      if (value === "" || /^\d*$/.test(value)) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
        setErrors((prev) => ({
          ...prev,
          count: validateCount(value),
        }));
      }
    } else if (name === "start") {
      // Only allow numeric input
      if (value === "" || /^\d*$/.test(value)) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
        setErrors((prev) => ({
          ...prev,
          start: validateStart(value),
        }));
      }
    } else if (name === "prefix") {
      // Validate prefix - prevent numeric input
      const prefixError = validatePrefix(value);
      setErrors((prev) => ({
        ...prev,
        prefix: prefixError,
      }));

      // Update the prefix even while of error to show the validation message
      if (/^[^\d]*$/.test(value)) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else {
      // other fields
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const openAddModal = () => {
    setEditMode(false);
    setCurrentJob(null);
    setFormData({
      role_code: "",
      job_name: "",
      prefix: "",
      start: "1",
      count: "1",
    });
    setErrors({ count: "", prefix: "", start: "" });
    setModalOpen(true);
  };

  const openEditModal = (job: JobSummary) => {
    setEditMode(true);
    setCurrentJob(job);

    const letters = job.LastCode.replace(/[0-9]/g, "");
    const numbers = parseInt(job.LastCode.replace(/[^\d]/g, "")) + 1;

    setFormData({
      role_code: job.role_code,
      job_name: job.job_name,
      prefix: letters,
      start: numbers.toString(),
      count: "1",
    });
    setErrors({ count: "", prefix: "", start: "" });
    setModalOpen(true);
  };

  const openDeleteModal = (job: JobSummary) => {
    setCurrentJob(job);
    setFormData({
      role_code: job.role_code,
      job_name: job.job_name,
      prefix: "",
      start: "",
      count: "1",
    });
    setErrors({ count: "", prefix: "", start: "" });
    setDeleteModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditMode(false);
    setCurrentJob(null);
    setErrors({ count: "", prefix: "", start: "" });
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setCurrentJob(null);
    setErrors({ count: "", prefix: "", start: "" });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 mt-20">
      <ToastContainer position="top-right" />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Job Management</h2>
        <button
          onClick={openAddModal}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700 transition-all"
        >
          + Add Jobs
        </button>
      </div>
      <div className="overflow-x-auto shadow rounded border border-gray-200">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border-b font-medium border-gray-300 text-left">
                Department
              </th>

              <th className="p-3 border-b font-medium border-gray-300 text-left">
                Role Code
              </th>

              <th className="p-3 border-b font-medium border-gray-300 text-left">
                Role Name
              </th>

              <th className="p-3 border-b font-medium border-gray-300 text-left">
                Role Category
              </th>
              <th className="p-3 border-b font-medium border-gray-300 text-left">
                Job Name
              </th>

              <th className="p-3 border-b border-gray-300 font-medium text-left">
                Count
              </th>
              <th className="p-3 border-b border-gray-300 font-medium text-left">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {jobSummaries.map((job) => (
              <tr key={job.job_name} className="hover:bg-blue-100">
                <td className="p-3 border-b border-gray-100">
                  {job.department_name}
                </td>

                <td className="p-3 border-b border-gray-100">
                  {job.role_code}
                </td>
                <td className="p-3 border-b border-gray-100">
                  {job.role_name}
                </td>
                <td className="p-3 border-b border-gray-100">
                  {job.role_category}
                </td>
                <td className="p-3 border-b border-gray-100">{job.job_name}</td>
                <td className="p-3 border-b border-gray-100">{job.count}</td>
                <td className="p-3 border-b border-gray-100">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(job)}
                      className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-400 transition-all"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => openDeleteModal(job)}
                      className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-400 transition-all"
                    >
                      Remove
                    </button>
                    <button
                      className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm"
                      onClick={() => ViewCodes(job)}
                    >
                      View Jobs Codes
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
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
          <div className="bg-white p-6 rounded-lg w-full max-w-md modal-container">
            <h3 className="text-xl mb-4 text-gray-800">
              {editMode ? `Add Jobs: ${currentJob?.job_name}` : "Add Jobs"}
            </h3>

            {!editMode ? (
              <>
                <label className="block">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  name="role_code"
                  value={formData.role_code}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded mb-4"
                >
                  <option value="">Select Role</option>
                  {roles.map((role) => (
                    <option key={role.role_code} value={role.role_code}>
                      {role.role_name}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <div className="mb-4">
                <label className="block">
                  Role Name<span className="text-red-500">*</span>
                </label>
                <span className="text-gray-600">
                  {
                    roles.find((r) => r.role_code === formData.role_code)
                      ?.role_name
                  }
                </span>
              </div>
            )}

            <label className="block">
              Job Name<span className="text-red-500">*</span>
            </label>
            <input
              name="job_name"
              value={formData.job_name}
              onChange={handleChange}
              className={`w-full p-2 border border-gray-300 rounded mb-4  ${
                editMode ? "bg-gray-100" : ""
              }`}
              readOnly={editMode}
            />

            <label className="block">
              Job Code <span className="text-red-500">*</span>
            </label>
            <input
              name="prefix"
              value={formData.prefix}
              onChange={handleChange}
              className={`w-full p-2 border border-gray-300 rounded mb-4  ${
                editMode ? "bg-gray-100" : ""
              }`}
              placeholder="Prefix (Alphabets only)"
              readOnly={editMode}
            />
            {errors.prefix && (
              <div className="text-red-500 text-sm mb-4">{errors.prefix}</div>
            )}

            <label className="block">
              Starting Number <span className="text-red-500">*</span>
            </label>
            <input
              name="start"
              value={formData.start}
              onChange={!editMode ? handleChange : undefined}
              className={`w-full p-2 border border-gray-300 rounded mb-4 ${
                editMode ? "bg-gray-100" : ""
              }`}
              placeholder="Starting Number"
              readOnly={editMode}
            />
            {errors.start && (
              <div className="text-red-500 text-sm mb-4">{errors.start}</div>
            )}

            <label className="block">
              Count <span className="text-red-500">*</span>
            </label>
            <input
              name="count"
              placeholder="Count"
              value={formData.count}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            {errors.count && (
              <div className="text-red-500 text-sm mb-4">{errors.count}</div>
            )}
            {editMode && currentJob && (
              <div className="text-sm text-gray-500 mb-4">
                Current job count: {currentJob.count}
              </div>
            )}

            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white py-2 px-4 rounded transition-all hover:bg-blue-700"
                disabled={!!errors.count || !!errors.prefix || !!errors.start}
              >
                {editMode ? "Add Jobs" : "Create Jobs"}
              </button>
              <button
                onClick={closeModal}
                className="py-2 px-4 rounded bg-gray-300 hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalOpen && (
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
          <div className="bg-white p-6 rounded-lg w-full max-w-md modal-container">
            <h3 className="text-xl mb-4 text-gray-800">
              Remove Jobs: {currentJob?.job_name}
            </h3>

            <div className="mb-4">
              <label className="block">Role Name:</label>
              <span className="text-gray-600">{currentJob?.role_name}</span>
            </div>

            <div className="mb-4">
              <label className="block">Job Name:</label>
              <span className="text-gray-600">{currentJob?.job_name}</span>
            </div>

            <div className="mb-4">
              <label className="block">Current Job Count:</label>
              <span className="text-gray-600">{currentJob?.count}</span>
            </div>

            <label className="block">Count to Remove</label>
            <input
              name="count"
              placeholder="Count"
              value={formData.count}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            {errors.count && (
              <div className="text-red-500 text-sm mb-4">{errors.count}</div>
            )}

            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={handleDeleteJobs}
                className="bg-red-600 text-white py-2 px-4 rounded transition-all hover:bg-red-700"
                disabled={!!errors.count}
              >
                Remove Jobs
              </button>
              <button
                onClick={closeDeleteModal}
                className="py-2 px-4 rounded bg-gray-300 hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Job Codes Modal */}
      {viewModalOpen && (
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
          <div className="bg-white p-6 rounded-lg w-1/3  mt-20 mb-20 modal-container">
            <div className="mb-4">
              <label className="block">Role Name:</label>
              <span className="text-gray-600">{currentJob?.role_name}</span>
            </div>
            <div className="mb-4">
              <label className="block">Job Name:</label>
              <span className="text-gray-600">{currentJob?.job_name}</span>
            </div>
            <div className="mb-4">
              <label className="block">Total Job Codes:</label>
              <span className="text-gray-600">{jobCodes.length}</span>
            </div>

            <div className="max-h-66 overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="p-3 border-b font-medium border-gray-300 text-left">
                      Job Code
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {jobCodes.map((job) => (
                    <tr key={job.job_code} className="hover:bg-gray-50">
                      <td className="p-3 border-b border-gray-100">
                        {job.job_code}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setViewModalOpen(false)}
                className="py-2 px-4 rounded bg-gray-300 hover:bg-gray-200 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobManagement;
