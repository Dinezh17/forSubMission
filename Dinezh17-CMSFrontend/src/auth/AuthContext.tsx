import React, { createContext, useState, useEffect } from "react";

interface userAuth{
  token: string;
  refresh:string;
  username: string; 
  role: string; 
}

interface AuthContextType {
  user:  userAuth | null;
  login: (userData: userAuth) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<userAuth | null>(null);

  // Checking localStorage 
  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      localStorage.setItem("token",parsedUser.token)
      localStorage.setItem("refresh",parsedUser.refresh)
    }
  }, []);

  // Login function
  const login = (userData: userAuth ) => {
    localStorage.setItem("userData", JSON.stringify(userData));
    setUser(userData);
    localStorage.setItem("token",userData.token)
    localStorage.setItem("refresh",userData.refresh)
  };

  // Logout function
  const logout = () => {

    localStorage.removeItem("userData");
    setUser(null);
    localStorage.removeItem("refresh")
    localStorage.removeItem("token")
    window.location.href = "/";

  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
