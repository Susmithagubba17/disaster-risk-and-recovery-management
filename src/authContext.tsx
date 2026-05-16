import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "./types";
import { io, Socket } from "socket.io-client";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  socket: Socket | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("vanguard_token");
    const storedUser = localStorage.getItem("vanguard_user");
    
    if (token && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      const newSocket = io(window.location.origin, {
        auth: { token }
      });
      setSocket(newSocket);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Login failed");
    }
    
    const { token, user: userData } = await res.json();
    localStorage.setItem("vanguard_token", token);
    localStorage.setItem("vanguard_user", JSON.stringify(userData));
    setUser(userData);
    
    const newSocket = io(window.location.origin, {
      auth: { token }
    });
    setSocket(newSocket);
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, role }),
    });
    
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Registration failed");
    }
    
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem("vanguard_token");
    localStorage.removeItem("vanguard_user");
    setUser(null);
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, socket, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
