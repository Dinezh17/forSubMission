// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import api from "../interceptor/api";
// import { toast, ToastContainer } from "react-toastify";
// // no need removed
// interface Role {
//   id: number;
//   role_code: string;
//   role_name: string;
//   role_category: string;
// }

// const DepartmentRoleAssignment: React.FC = () => {
//   const { deptCode } = useParams<{ deptCode: string }>();
//   const navigate = useNavigate();

//   const [departmentName, setDepartmentName] = useState<string>("");
//   const [allRoles, setAllRoles] = useState<Role[]>([]);
//   const [assignedRoles, setAssignedRoles] = useState<number[]>([]);
//   const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
//   const [loading, setLoading] = useState(true);

//   const departmentIdNumber = deptCode ? parseInt(deptCode) : null;

//   const fetchAllData = async () => {
//     if (!departmentIdNumber) {
//       navigate("/");
//       return;
//     }

//     try {
//       const [allRolesRes, assignedRolesRes, deptDetailsRes] = await Promise.all(
//         [
//           api.get<Role[]>("/roles"),
//           api.get(`/departments/${departmentIdNumber}/roles`),
//           api.get(`/department/${departmentIdNumber}`),
//         ]
//       );

//       setAllRoles(allRolesRes.data);

//       //just the role IDs
      
//       setAssignedRoles(assignedRolesRes.data);

//       if (deptDetailsRes.data?.name) {
//         setDepartmentName(deptDetailsRes.data.name);
//       } else {
//         setDepartmentName("No name");
//       }
//       console.log(assignedRolesRes.data);

//       setLoading(false);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAllData();
//   }, [departmentIdNumber, navigate]);

//   const toggleRoleSelection = (id: number) => {
//     setSelectedRoles((prev) =>
//       prev.includes(id) ? prev.filter((roleId) => roleId !== id) : [...prev, id]
//     );
//   };

//   const selectAll = (type: "available" | "assigned") => {
//     if (type === "available") {
//       const availableIds = allRoles
//         .filter((role) => !assignedRoles.includes(role.id))
//         .map((role) => role.id);
//       setSelectedRoles(availableIds);
//     } else {
//       setSelectedRoles([...assignedRoles]);
//     }
//   };

//   const clearSelection = () => {
//     setSelectedRoles([]);
//   };

  
//   const handleAssign = async () => {
//     if (!departmentIdNumber || selectedRoles.length === 0) return;

//     if (window.confirm("Confirm assignment?")) {
//       try {
//         // Filter only roles that are not already assigned
//         const rolesToAssign = selectedRoles.filter(
//           (id) => !assignedRoles.includes(id)
//         );

//         if (rolesToAssign.length === 0) return;

//         await api.post(
//           `/departments/${departmentIdNumber}/roles`,
//           rolesToAssign
//         );
//         toast.success("Roles added successfully")
//         await fetchAllData();
//         setSelectedRoles([]);
//       } catch (error:any) {
//         toast.error("Error assigning roles:", error);
//       }
//     }
//   };

//   const handleRemove = async () => {
//     if (!departmentIdNumber || selectedRoles.length === 0) return;

//     if (window.confirm("Confirm remove roles?")) {
//       try {
//         // Filter only roles that are currently assigned
//         const rolesToRemove = selectedRoles.filter((id) =>
//           assignedRoles.includes(id)
//         );

//         if (rolesToRemove.length === 0) return;

//         await api.delete(`/departments/${departmentIdNumber}/roles`, {
//           data: rolesToRemove,
//         });
//         toast.warn("Roles removed successfully")
//         await fetchAllData();
//         setSelectedRoles([]);
//       } catch (error:any) {
//         toast.error("Error removing roles:", error);
//       }
//     }
//   };

//   const goBackToDepartments = () => {
//     navigate("/department-crud");
//   };

//   if (loading)
//     return <div className="text-center font-semibold ">Loading...</div>;
//   if (!departmentIdNumber) return <div>Invalid department</div>;

//   return (
//     <div className="max-w-6xl mx-auto p-6 mt-24">
//       <ToastContainer position="top-right" />

//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-2xl font-semibold">
//           Manage Roles for {departmentName}
//         </h2>
//         <button
//           className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
//           onClick={goBackToDepartments}
//         >
//           Back to Departments
//         </button>
//       </div>
//       {/* Action Buttons */}
//       <div className="flex justify-end gap-3 mt-6 mb-6">
//         <button
//           className={`px-4 py-2 rounded text-white ${
//             selectedRoles.length === 0 ||
//             selectedRoles.every((id) => assignedRoles.includes(id))
//               ? "bg-gray-400 cursor-not-allowed"
//               : "bg-green-600 hover:bg-green-700"
//           }`}
//           onClick={handleAssign}
//           disabled={
//             selectedRoles.length === 0 ||
//             selectedRoles.every((id) => assignedRoles.includes(id))
//           }
//         >
//           Assign Selected
//         </button>
//         <button
//           className={`px-4 py-2 rounded text-white ${
//             selectedRoles.length === 0 ||
//             selectedRoles.every((id) => !assignedRoles.includes(id))
//               ? "bg-gray-400 cursor-not-allowed"
//               : "bg-red-500 hover:bg-red-600"
//           }`}
//           onClick={handleRemove}
//           disabled={
//             selectedRoles.length === 0 ||
//             selectedRoles.every((id) => !assignedRoles.includes(id))
//           }
//         >
//           Remove Selected
//         </button>
//       </div>

//       <div className="grid grid-cols-2 gap-6">
//         {/* Available Roles */}
//         <div className="border border-gray-200 rounded shadow-sm">
//           <div className="flex justify-between items-center px-4 py-3 bg-gray-100 border-b border-gray-200">
//             <h3 className="font-semibold">Available Roles</h3>
//             <div className="flex gap-2">
//               <button
//                 className="bg-gray-300 hover:bg-gray-400 text-sm px-3 py-1 rounded"
//                 onClick={() => selectAll("available")}
//                 disabled={assignedRoles.length === allRoles.length}
//               >
//                 Select All
//               </button>
//               <button
//                 className="bg-gray-300 hover:bg-gray-400 text-sm px-3 py-1 rounded"
//                 onClick={clearSelection}
//                 disabled={selectedRoles.length === 0}
//               >
//                 Clear
//               </button>
//             </div>
//           </div>
//           {allRoles.every((r) => assignedRoles.includes(r.id)) ? (
//             <p className="p-4 text-gray-500">No available roles</p>
//           ) : (
//             <table className="w-full text-sm">
//               <thead className="bg-gray-100 border-b border-gray-200">
//                 <tr>
//                   <th className="p-3 w-10 "></th>
//                   <th className="p-3 text-left">Role Code</th>
//                   <th className="p-3 text-left">Role Name</th>
//                   <th className="p-3 text-left">Role Category</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {allRoles
//                   .filter((r) => !assignedRoles.includes(r.id))
//                   .map((role) => (
//                     <tr
//                       key={`available-${role.id}`}
//                       className="hover:bg-blue-50"
//                     >
//                       <td className="p-3 text-center">
//                         <input
//                           type="checkbox"
//                           checked={selectedRoles.includes(role.id)}
//                           onChange={() => toggleRoleSelection(role.id)}
//                         />
//                       </td>
//                       <td className="p-3">{role.role_code}</td>
//                       <td className="p-3">{role.role_name}</td>
//                       <td className="p-3">{role.role_category}</td>
//                     </tr>
//                   ))}
//               </tbody>
//             </table>
//           )}
//         </div>

//         {/* Assigned Roles */}
//         <div className="border border-gray-200 rounded shadow-sm">
//           <div className="flex justify-between items-center px-4 py-3 bg-gray-100 border-b border-gray-200">
//             <h3 className="font-semibold">Assigned Roles</h3>
//             <div className="flex gap-2">
//               <button
//                 className="bg-gray-300 hover:bg-gray-400 text-sm px-3 py-1 rounded"
//                 onClick={() => selectAll("assigned")}
//                 disabled={assignedRoles.length === 0}
//               >
//                 Select All
//               </button>
//               <button
//                 className="bg-gray-300 hover:bg-gray-400 text-sm px-3 py-1 rounded"
//                 onClick={clearSelection}
//                 disabled={selectedRoles.length === 0}
//               >
//                 Clear
//               </button>
//             </div>
//           </div>
//           {assignedRoles.length === 0 ? (
//             <p className="p-4 text-gray-500">No roles assigned</p>
//           ) : (
//             <table className="w-full text-sm">
//               <thead className="bg-gray-100 border-b border-gray-200">
//                 <tr>
//                   <th className="p-3 w-10"></th>
//                   <th className="p-3 text-left">Role Code</th>
//                   <th className="p-3 text-left">Role Name</th>
//                   <th className="p-3 text-left">Role Category</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {allRoles
//                   .filter((r) => assignedRoles.includes(r.id))
//                   .map((role) => (
//                     <tr
//                       key={`assigned-${role.id}`}
//                       className="hover:bg-blue-50"
//                     >
//                       <td className="p-3 text-center">
//                         <input
//                           type="checkbox"
//                           checked={selectedRoles.includes(role.id)}
//                           onChange={() => toggleRoleSelection(role.id)}
//                         />
//                       </td>
//                       <td className="p-3">{role.role_code}</td>
//                       <td className="p-3">{role.role_name}</td>
//                       <td className="p-3">{role.role_category}</td>
//                     </tr>
//                   ))}
//               </tbody>
//             </table>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DepartmentRoleAssignment;
