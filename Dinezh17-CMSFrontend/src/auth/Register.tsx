import React, { useState } from "react";
import api from "../interceptor/api";

import { toast, ToastContainer } from "react-toastify";


const ChangeCredentials: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const formData = {
      employee_number: data.get("employee_number") as string,
      old_password: data.get("old_password") as string,
      new_password: data.get("new_password") as string || undefined,
      new_email: data.get("new_email") as string || undefined,
    };

    setLoading(true);
    try {
      const response = await api.post("/reset-password-or-email/", formData);
      toast.success(response.data.message || "Update successful");
    } catch (error: any) {
      toast.error("Update failed: " + (error?.response?.data?.detail || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
     <ToastContainer position="top-right" />
      <div className="w-full max-w-md p-6 bg-white shadow-md rounded-xl">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Change Email / Password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee Number</label>
            <input
              type="text"
              name="employee_number"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Old Password</label>
            <input
              type="password"
              name="old_password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Email</label>
            <input
              type="email"
              name="new_email"
              placeholder="Leave blank if not changing"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              name="new_password"
              placeholder="Leave blank if not changing"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition duration-200 font-medium disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangeCredentials;
