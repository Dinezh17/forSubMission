
import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "./AuthContext";

interface ProtectedRouteWithRoleProps {
  allowedRoles: string[];
}

const ProtectedRouteWithRole: React.FC<ProtectedRouteWithRoleProps> = ({ allowedRoles }) => {
  const {logout } = useContext(AuthContext)!;
  const userData = localStorage.getItem('userData')

  const parsedData  = userData? JSON.parse(userData):null;

  
  if (!parsedData){
    logout();
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(parsedData.role)) {
    return <Navigate to="/" replace />;
  }
 
  return <Outlet />;
};

export default ProtectedRouteWithRole;


 