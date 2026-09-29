import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, UserRole } from "../types";
import { api } from "../services/api";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  role: UserRole;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<UserProfile>;
  register: (email: string, password: string, role: UserRole, displayName: string) => Promise<UserProfile>;
  logout: () => void;
  switchDemoRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Fictional academic demo user accounts
export const DEMO_PROFILES: Record<UserRole, UserProfile> = {
  seller: {
    uid: "seller-123",
    email: "seller@landchain.demo",
    displayName: "Rajesh Kumar (Seller)",
    role: "seller",
    walletAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  buyer: {
    uid: "buyer-456",
    email: "buyer@landchain.demo",
    displayName: "Ananya Sharma (Buyer)",
    role: "buyer",
    walletAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  government: {
    uid: "gov-789",
    email: "authority@landchain.demo",
    displayName: "Dr. K. S. Rao (Gov Registrar)",
    role: "government",
    walletAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  agent: {
    uid: "agent-101",
    email: "agent@landchain.demo",
    displayName: "Vikram Malhotra (Realty Agent)",
    role: "agent",
    walletAddress: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  public: {
    uid: "public-000",
    email: "citizen@public.demo",
    displayName: "General Citizen",
    role: "public",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedRole = localStorage.getItem("landchain_demo_role") as UserRole | null;
    return savedRole ? DEMO_PROFILES[savedRole] : DEMO_PROFILES.seller; // default to seller for demonstration
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // If real token exists, try fetching profile from backend
    const token = localStorage.getItem("landchain_token");
    if (token && !token.startsWith("demo-token-")) {
      setIsLoading(true);
      api
        .getProfile()
        .then((profile) => setUser(profile))
        .catch(() => {
          // fallback to demo profile
        })
        .finally(() => setIsLoading(false));
    }
  }, []);

  const login = async (email: string, _password?: string): Promise<UserProfile> => {
    setIsLoading(true);
    // 1. Check direct demo profiles
    const matchedRole = (Object.keys(DEMO_PROFILES) as UserRole[]).find(
      (r) => DEMO_PROFILES[r].email.toLowerCase() === email.toLowerCase()
    );

    let loggedInUser: UserProfile;

    if (matchedRole) {
      loggedInUser = DEMO_PROFILES[matchedRole];
      switchDemoRole(matchedRole);
    } else {
      // 2. Check locally saved registered role or infer from email
      const savedRole = localStorage.getItem(`landchain_role_${email.toLowerCase()}`) as UserRole | null;
      let inferredRole: UserRole = "seller";
      const lower = email.toLowerCase();
      if (savedRole) {
        inferredRole = savedRole;
      } else if (lower.includes("seller") || lower.includes("landlord") || lower.includes("owner")) {
        inferredRole = "seller";
      } else if (lower.includes("gov") || lower.includes("admin") || lower.includes("authority")) {
        inferredRole = "government";
      } else if (lower.includes("agent") || lower.includes("broker")) {
        inferredRole = "agent";
      } else if (lower.includes("buyer") || lower.includes("client")) {
        inferredRole = "buyer";
      }

      loggedInUser = {
        uid: `user-${Date.now().toString().slice(-4)}`,
        email,
        displayName: email.split("@")[0],
        role: inferredRole,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUser(loggedInUser);
      localStorage.setItem("landchain_token", `demo-token-${inferredRole}`);
      localStorage.setItem("landchain_demo_role", inferredRole);
      localStorage.setItem("landchain_demo_uid", loggedInUser.uid);
    }
    setIsLoading(false);
    return loggedInUser;
  };

  const register = async (email: string, _password: string, role: UserRole, displayName: string): Promise<UserProfile> => {
    setIsLoading(true);
    const newUser: UserProfile = {
      uid: `user-${Date.now().toString().slice(-4)}`,
      email,
      displayName,
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUser(newUser);
    localStorage.setItem(`landchain_role_${email.toLowerCase()}`, role);
    localStorage.setItem("landchain_token", `demo-token-${role}`);
    localStorage.setItem("landchain_demo_role", role);
    localStorage.setItem("landchain_demo_uid", newUser.uid);
    setIsLoading(false);
    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("landchain_token");
    localStorage.removeItem("landchain_demo_role");
    localStorage.removeItem("landchain_demo_wallet");
    localStorage.removeItem("landchain_demo_uid");
  };

  const switchDemoRole = (targetRole: UserRole) => {
    const profile = DEMO_PROFILES[targetRole];
    setUser(profile);
    localStorage.setItem("landchain_token", `demo-token-${targetRole}`);
    localStorage.setItem("landchain_demo_role", targetRole);
    if (profile.walletAddress) {
      localStorage.setItem("landchain_demo_wallet", profile.walletAddress);
    } else {
      localStorage.removeItem("landchain_demo_wallet");
    }
    localStorage.setItem("landchain_demo_uid", profile.uid);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null && user.role !== "public",
        role: user?.role || "public",
        isLoading,
        login,
        register,
        logout,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
