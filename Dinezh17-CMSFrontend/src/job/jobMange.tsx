import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../interceptor/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type Job = {
  job_code: string;
  job_name: string;
  job_status: boolean;
};

const JobCountManagement: React.FC = () => {
  const { role_code } = useParams<{ role_code: string }>();
  const { job_name } = useParams<{ job_name: string }>();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);

  const fetch = async () => {
    const response = await api.get(`/jobs/by-role/${role_code}/${job_name}`);
    setJobs(response.data);
  };
  useEffect(() => {
    fetch();
  }, [role_code]);

  const updateJobStatus = async (job_code: string, status: boolean) => {
    try {
      await api.put(`/jobs/${status ? "activate" : "deactivate"}`, [job_code]);

      fetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail);
    }
  };

  const goBack = () => {
    navigate("/job-crud");
  };

  return (
    <div className="max-w-6xl mx-auto p-6 mt-20">
      <ToastContainer />

      <div className="flex items-center justify-between ">
        
      
        <h2 className="text-2xl font-semibold mb-6">
          Jobs for Role: {role_code}
        </h2>
        <button
          className="mb-6 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
          onClick={goBack}
        >
          Back to Roles
        </button>
      </div>
      <div className="overflow-x-auto shadow rounded border border-gray-200">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border-b font-medium border-gray-200 text-left">
                Job Code
              </th>
              <th className="p-3 border-b font-medium border-gray-200 text-left">
                Job Name
              </th>
              <th className="p-3 border-b font-medium border-gray-200 text-left">
                Status
              </th>
              <th className="p-3 border-b font-medium border-gray-200 text-left">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.job_code} className="hover:bg-blue-100">
                <td className="p-3 border-t border-gray-100">{job.job_code}</td>
                <td className="p-3 border-t border-gray-100">{job.job_name}</td>
                <td className="p-3 border-t border-gray-100">
                  <span
                    className={`font-medium ${
                      job.job_status ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {job.job_status ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-3 border-t border-gray-100 space-x-2">
                  <button
                    onClick={() => updateJobStatus(job.job_code, true)}
                    className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-700"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => updateJobStatus(job.job_code, false)}
                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-700"
                  >
                    Hold
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JobCountManagement;
