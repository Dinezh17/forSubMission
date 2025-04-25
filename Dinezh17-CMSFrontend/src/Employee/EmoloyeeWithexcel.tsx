import React, { useState } from "react";
import api from "../interceptor/api";

interface EmployeeData {
  employee_number: string;
  employee_name: string;
  status: string;
  failure_reason: string | null;
}

interface ExcelUploadResponse {
  status: string;
  summary: {
    total: number;
    processed: number;
    failed: number;
  };
  processed_employees: EmployeeData[];
}

const ExcelUploadDisplay: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadData, setUploadData] = useState<ExcelUploadResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setIsLoading(true);
    setUploadData(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post<ExcelUploadResponse>(
        "/employees/upload-employee-data/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUploadData(response.data);
    } catch (err) {
      setError("Failed to upload file. Please try again.");
      console.error("Upload error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 mt-20">
      <h2 className="text-2xl font-semibold mb-10">Employee Excel Upload</h2>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <input
            type="file"
            id="excel-file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            disabled={isLoading}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={!file || isLoading}
          className={`w-full py-3 rounded-lg text-white font-semibold transition-colors duration-300 ${
            isLoading || !file
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {isLoading ? "Uploading..." : "Upload Excel"}
        </button>
      </form>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg border border-red-300 mb-6">
          {error}
        </div>
      )}

      {uploadData && (
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-gray-100 p-6 border-b border-gray-300">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Upload Summary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <span className="font-semibold text-gray-700">
                  Total Records:
                </span>
                <span>{uploadData.summary.total}</span>
              </div>
              <div>
                <span className="font-semibold text-green-600">Processed:</span>
                <span>{uploadData.summary.processed}</span>
              </div>
              <div>
                <span className="font-semibold text-red-600">Failed:</span>
                <span>{uploadData.summary.failed}</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Employee Data
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-800 text-white">
                    <th className="px-4 py-2">Employee #</th>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadData.processed_employees.map((employee, index) => (
                    <tr key={index} className="border-b hover:bg-gray-100">
                      <td className="px-4 py-2">{employee.employee_number}</td>
                      <td className="px-4 py-2">{employee.employee_name}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`font-semibold ${
                            employee.status.toLowerCase() === "created" ||
                            employee.status.toLowerCase() === "updated"
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {employee.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {employee.failure_reason || "None"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelUploadDisplay;
