import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "./AuthContext";

import { toast, ToastContainer } from "react-toastify";


const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext)!;
  const [loading, setLoading] = useState(false);

  const onFinish = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const values = {
      employee_number: formData.get("employee_number") as string,
      password: formData.get("password") as string,
    };

    try {
      const response = await axios.post("http://127.0.0.1:8000/login/", values);

      const userData = {
        token: response.data.access_token,
        refresh: response.data.refresh_token,
        username: response.data.user,
        role: response.data.role,
      };

      login(userData);
      toast.success("Login Successful!"); 
      setTimeout(() => {
        navigate("/");
        
      }, 1000);
    } catch (error: any) {
      toast.error("Login Failed! " + (error?.response?.data?.detail || "error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <> <ToastContainer position="top-right" />
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      
      <div className="w-full max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Login</h2>
        <form onSubmit={onFinish} className="flex flex-col space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee Number</label>
            <input
              type="text"
              name="employee_number"
              required
              placeholder="Enter your employee number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              placeholder="Enter your password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition duration-200 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="text-center mt-4">
          <span className="text-sm text-gray-600">Change Credentials </span>
          <button
            onClick={() => navigate("/register")}
            className="text-sm text-blue-600 hover:underline focus:outline-none"
          >
            Click here 
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default LoginPage;
