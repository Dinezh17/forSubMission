import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./auth/AuthContext";

const Navbar: React.FC = () => {
  const { user, logout } = useContext(AuthContext)!;
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const theme = {
    primary: "#FFFFFF", // White
    secondary: "#F8F9FA", // Light gray
    accent: "#3F51B5", // Indigo blue
    text: "#212529", // Dark gray for text
    lightText: "#6C757D", // Gray for secondary text
    border: "#E0E0E0", // Light border color
  };

  const navbarStyle: React.CSSProperties = {
    backgroundColor: theme.primary,
    color: theme.text,
    padding: "19px",
    position: "fixed",
    width: "100%",
    top: 0,
    left: 0,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxSizing: "border-box",
    borderBottom: `1px solid ${theme.border}`,
  };

  const menuButtonStyle: React.CSSProperties = {
    background: "none",
    border: "none",
    color: theme.text,
    fontSize: "19px",
    cursor: "pointer",
    marginRight: "10px",
    padding: "5px",
    borderRadius: "4px",
    transition: "background-color 0.2s",
  };

  const sidebarStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: menuOpen ? "0" : "-300px",
    width: "300px",
    height: "100vh",
    backgroundColor: theme.primary,
    paddingTop: "30px",
    transition: "left 0.3s ease-in-out",
    boxShadow: menuOpen ? "2px 0 5px rgba(0, 0, 0, 0.1)" : "none",
    zIndex: 1100,
    borderRight: `1px solid ${theme.border}`,
  };

  const sidebarLinkStyle: React.CSSProperties = {
    display: "block",
    padding: "7px 10px",
    color: theme.text,
    textDecoration: "none",
    fontSize: "16px",
    transition: "background-color 0.2s",
    borderBottom: `1px solid ${theme.border}`,
  };

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0, 0, 0, 0.3)",
    display: menuOpen ? "block" : "none",
    zIndex: 1099,
  };

  const rightSideContainerStyle: React.CSSProperties = {
    display: "flex",
    gap: "15px",
    alignItems: "center",
    flexShrink: 0,
    marginLeft: "15px",
  };

  const authButtonStyle: React.CSSProperties = {
    backgroundColor: theme.accent,
    color: "#FFFFFF",
    border: "none",
    padding: "8px 16px",
    cursor: "pointer",
    borderRadius: "4px",
    fontSize: "14px",
    fontWeight: "500",
    whiteSpace: "nowrap",
    transition: "background-color 0.2s",
    textDecoration: "none",
  };

  const userInfoStyle: React.CSSProperties = {
    flex: 1,
    textAlign: "right",
    fontSize: "24px",
    fontWeight: 400,
    color: theme.lightText,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    padding: "0 15px",
  };

  return (
    <>
      {/* Navbar */}
      <nav style={navbarStyle}>
        <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          {/* Sidebar Toggle Button */}
          {user && (
            <button
              style={menuButtonStyle}
              onClick={() => setMenuOpen(!menuOpen)}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = theme.secondary)
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              ☰
            </button>
          )}
          <Link
            to="/"
            style={{
              color: theme.accent,
              textDecoration: "none",
              fontSize: "18px",
              fontWeight: "600",
              whiteSpace: "nowrap",
            }}
          >
            Competency Management
          </Link>
        </div>

        {/* Centered User Info */}
        {user && (
          <div style={userInfoStyle}>
            <span>
              {user.username} | {user.role}
            </span>
          </div>
        )}

        {/* Right-side Auth Links or Logout */}
        <div style={rightSideContainerStyle}>
          {!user ? (
            <>
              <Link
                to="/login"
                style={authButtonStyle}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#303F9F")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = theme.accent)
                }
              >
                Login
              </Link>
              <Link
                to="/register"
                style={{
                  ...authButtonStyle,
                  backgroundColor: "transparent",
                  color: theme.accent,
                  border: `1px solid ${theme.accent}`,
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = theme.secondary;
                  e.currentTarget.style.color = theme.accent;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = theme.accent;
                }}
              >
                ChangeCredentials
              </Link>
            </>
          ) : (
            <button
              style={{
                ...authButtonStyle,
                backgroundColor: "transparent",
                color: theme.accent,
                border: `1px solid ${theme.accent}`,
              }}
              onClick={() => {
                logout();
                navigate("/");
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = theme.secondary;
                e.currentTarget.style.color = theme.accent;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = theme.accent;
              }}
            >
              Logout
            </button>
          )}
        </div>
      </nav>

      {/* Sidebar */}
      {user && (
        <div style={sidebarStyle}>
          <Link
            to="/"
            style={sidebarLinkStyle}
            onClick={() => setMenuOpen(false)}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = theme.secondary)
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            Home
          </Link>

          {/* ADMIN MENU */}

          {user.role === "ADMIN" && (
            <>
              {/* <Link
                to="/busineessDivision-crud" 
                style={sidebarLinkStyle}
                onClick={() => setMenuOpen(false)}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = theme.secondary)
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
              Business Management
              </Link> */}
              <Link
                to="/department-crud"
                style={sidebarLinkStyle}
                onClick={() => setMenuOpen(false)}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = theme.secondary)
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Department Management
              </Link>
              <Link
                to="/role-crud"
                style={sidebarLinkStyle}
                onClick={() => setMenuOpen(false)}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = theme.secondary)
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Role Management
              </Link>

              <Link
                to="/job-crud"
                style={sidebarLinkStyle}
                onClick={() => setMenuOpen(false)}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = theme.secondary)
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Job Management
              </Link>
              <Link
                to="/competency-crud"
                style={sidebarLinkStyle}
                onClick={() => setMenuOpen(false)}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = theme.secondary)
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Competency Management (library)
              </Link>
              {/* <Link 
                to="/role-competencies" 
                style={sidebarLinkStyle} 
                onClick={() => setMenuOpen(false)}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme.secondary}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                Role Competency Assignment
              </Link> */}
              <Link
                to="/employee-crud"
                style={sidebarLinkStyle}
                onClick={() => setMenuOpen(false)}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = theme.secondary)
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Employee Management
              </Link>
              <Link
                to="/employee-excel"
                style={sidebarLinkStyle}
                onClick={() => setMenuOpen(false)}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = theme.secondary)
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Employee Excel Upload
              </Link>
              <Link
                to="/employee-eval"
                style={sidebarLinkStyle}
                onClick={() => setMenuOpen(false)}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = theme.secondary)
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Employee Evaluation List
              </Link>
              <Link
                to="/employee-competencies-table"
                style={sidebarLinkStyle}
                onClick={() => setMenuOpen(false)}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = theme.secondary)
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Employee Competency Report
              </Link>

              <Link
                to="/competency-gap-table"
                style={sidebarLinkStyle}
                onClick={() => setMenuOpen(false)}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = theme.secondary)
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Competency Gap Analysis
              </Link>

              {/* <Link
                to="/employee-stats-overall"
                style={sidebarLinkStyle}
                onClick={() => setMenuOpen(false)}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = theme.secondary)
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Competency DashBoard
              </Link> */}
              <Link
                to="/employee-eval-hod"
                style={sidebarLinkStyle}
                onClick={() => setMenuOpen(false)}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = theme.secondary)
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Evaluate Employees
              </Link>
            </>
          )}

          {/* HR MENU */}
          {user.role === "HR" && (
            <>
              <Link
                to="/competency-crud"
                style={sidebarLinkStyle}
                onClick={() => setMenuOpen(false)}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = theme.secondary)
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Competency Management (library)
              </Link>
              <Link
                to="/department-crud"
                style={sidebarLinkStyle}
                onClick={() => setMenuOpen(false)}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = theme.secondary)
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Department Management
              </Link>
              <Link
                to="/role-crud"
                style={sidebarLinkStyle}
                onClick={() => setMenuOpen(false)}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = theme.secondary)
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Role Management
              </Link>
              <Link
                to="/job-crud"
                style={sidebarLinkStyle}
                onClick={() => setMenuOpen(false)}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = theme.secondary)
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Job Management
              </Link>

              {/* <Link 
                to="/role-competencies" 
                style={sidebarLinkStyle} 
                onClick={() => setMenuOpen(false)}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme.secondary}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                Role Competency Assignment
              </Link> */}
              <Link
                to="/employee-crud"
                style={sidebarLinkStyle}
                onClick={() => setMenuOpen(false)}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = theme.secondary)
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Employee Management
              </Link>
              <Link
                to="/employee-excel"
                style={sidebarLinkStyle}
                onClick={() => setMenuOpen(false)}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = theme.secondary)
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Employee Excel Upload
              </Link>
              <Link
                to="/employee-eval"
                style={sidebarLinkStyle}
                onClick={() => setMenuOpen(false)}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = theme.secondary)
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Employee Evaluation List
              </Link>
              <Link
                to="/employee-competencies-table"
                style={sidebarLinkStyle}
                onClick={() => setMenuOpen(false)}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = theme.secondary)
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Employee Competency Report
              </Link>
              <Link
                to="/competency-gap-table"
                style={sidebarLinkStyle}
                onClick={() => setMenuOpen(false)}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = theme.secondary)
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Competency Gap Analysis
              </Link>
              {/* <Link
                to="/employee-stats-overall"
                style={sidebarLinkStyle}
                onClick={() => setMenuOpen(false)}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = theme.secondary)
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Competency DashBoard
              </Link> */}
            </>
          )}

          {/* HOD MENU */}
          {user.role === "Manager" && (
            <>
              <Link
                to="/employee-eval-hod"
                style={sidebarLinkStyle}
                onClick={() => setMenuOpen(false)}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = theme.secondary)
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Evaluate Employees
              </Link>
            </>
          )}

          <>
            <Link
              to="/my-competency-stats"
              style={sidebarLinkStyle}
              onClick={() => setMenuOpen(false)}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = theme.secondary)
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              My Scores
            </Link>
          </>

   
        </div>
      )}

      {/* Overlay (Closes Sidebar when clicking outside) */}
      <div style={overlayStyle} onClick={() => setMenuOpen(false)}></div>
    </>
  );
};

export default Navbar;
