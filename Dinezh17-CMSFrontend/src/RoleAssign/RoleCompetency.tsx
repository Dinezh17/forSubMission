// // RoleCompetencyList.tsx
// import React, { useState, useEffect } from "react";
// import api from "../interceptor/api";

// import { useNavigate } from "react-router-dom";

// interface Role {
//   id: number;
//   role_code: string;
//   role_name: string;
//   role_category: string;

// }
// const RoleCompetencyList: React.FC = () => {
//   const [roles, setRoles] = useState<Role[]>([]);
//   const [loading, setLoading] = useState(true);
  
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchRoles = async () => {
//       try {
//         const response = await api.get("/roles");
//         setRoles(response.data);
//         setLoading(false);
//       } catch (error) {
//         console.error("Error fetching roles:", error);
//         setLoading(false);
//       }
//     };

//     fetchRoles();
//   }, []);

//   const handleManageCompetencies = (role: Role) => {
//     navigate(`/role-competencies/${role.id}`);
//     // window.location.href = `/role-competencies/${role.role_code}`;
   
//   };

//   const styles = {
//     container: {
//       maxWidth: '1200px',
//       margin: '20px auto',
//       padding: '20px',
//       fontFamily: 'Arial, sans-serif',
//       marginTop: '80px'
//     },
//     header: {
//       display: 'flex',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//       marginBottom: '20px'
//     },
//     table: {
//       width: '100%',
//       border: '1px solid #ddd',
//       borderCollapse: 'collapse' as const,
//       marginTop: '10px'
//     },
//     tableHeader: {
//       border: '1px solid #ddd',
//       backgroundColor: '#f5f5f5'
//     },
//     th: {
//       border: '1px solid #ddd',
//       padding: '12px',
//       borderBottom: '1px solid #ddd',
//       textAlign: 'left' as const,
//       fontWeight: 500
//     },
//     td: {
//       border: '1px solid #ddd',
//       padding: '12px',
//       borderBottom: '1px solid #eee'
//     },
//     button: {
//       padding: '8px 12px',
//       borderRadius: '4px',
//       border: 'none',
//       cursor: 'pointer',
//       marginRight: '8px'
//     },
//     loading: {
//       textAlign: 'center' as const,
//       marginTop: '50px',
//       fontSize: '18px'
//     }
//   };

//   if (loading) return <div style={styles.loading}>Loading...</div>;

//   return (
//     <div style={styles.container}>
//       <div style={styles.header}>
//         <h2>Role Competency Assignment</h2>
//       </div>

//       <table style={styles.table}>
//         <thead>
//           <tr style={styles.tableHeader}>
//             <th style={styles.th}>ID</th>
//             <th style={styles.th}>Role Code</th>
//             <th style={styles.th}>Role Name</th>
//             <th style={styles.th}>Role Category</th>

//             <th style={styles.th}>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {roles.map(role => (
//             <tr key={role.id}>
//               <td style={styles.td}>{role.id}</td>
//               <td style={styles.td}>{role.role_code}</td>
//               <td style={styles.td}>{role.role_name}</td>
//               <td style={styles.td}>{role.role_category}</td>
              
//               <td style={styles.td}>
//                 <button
//                   style={{ ...styles.button, backgroundColor: '#2196F3', color: 'white' }}
//                   onClick={() => handleManageCompetencies(role)}
//                 >
//                   Manage Competencies
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default RoleCompetencyList;