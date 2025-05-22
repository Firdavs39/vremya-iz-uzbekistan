
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";

// Define user roles
export type UserRole = "admin" | "employee";

// Define user type
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  hourlyRate?: number;
}

// Mock users for demonstration
const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "Админ Администраторов",
    email: "admin@example.com",
    role: "admin",
  },
  {
    id: "2",
    name: "Иван Сотрудников",
    email: "employee@example.com",
    role: "employee",
    hourlyRate: 500,
  },
];

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved auth data in localStorage
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, remember: boolean) => {
    setLoading(true);
    
    // Simulate API call with timeout
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Find user by email (mock authentication)
    const foundUser = MOCK_USERS.find((u) => u.email === email);
    
    if (!foundUser) {
      setLoading(false);
      throw new Error("Invalid credentials");
    }
    
    // In real app, verify password here
    // For demo, we're just checking if the email exists
    
    // Save user to state
    setUser(foundUser);
    
    // Save to localStorage if remember me is checked
    if (remember) {
      localStorage.setItem("user", JSON.stringify(foundUser));
    }
    
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const isAdmin = () => {
    return user?.role === "admin";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
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
