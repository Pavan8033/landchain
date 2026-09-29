import { Request, Response, NextFunction } from "express";
import { admin, isUsingRealFirebase, memoryStore } from "../config/firebase";
import { UserRole } from "../types";

export interface AuthenticatedUser {
  uid: string;
  email: string;
  role: UserRole;
  walletAddress?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const isProduction = process.env.NODE_ENV === "production";
    // Demo auth is strictly disabled in production. In development, it is allowed when real Firebase credentials are not present or when ENABLE_DEMO_AUTH is explicitly set to "true".
    const isDemoAuthEnabled = !isProduction && (process.env.ENABLE_DEMO_AUTH === "true" || !isUsingRealFirebase);

    // Development / Testing Demo Header bypass
    if (isDemoAuthEnabled) {
      const demoRoleHeader = req.headers["x-demo-role"] as string | undefined;
      const demoUidHeader = req.headers["x-demo-uid"] as string | undefined;

      if (demoRoleHeader) {
        const validRoles: UserRole[] = ["seller", "buyer", "government", "agent", "public"];
        if (validRoles.includes(demoRoleHeader as UserRole)) {
          const uid = demoUidHeader || `${demoRoleHeader}-demo-uid`;
          const profile = isUsingRealFirebase
            ? null
            : memoryStore.getDoc("users", uid);
          const defaultEmail = demoUidHeader ? `${demoUidHeader}@landchain.demo` : `${demoRoleHeader}@landchain.demo`;
          req.user = {
            uid,
            email: profile?.email || defaultEmail,
            role: (demoRoleHeader as UserRole),
            walletAddress: profile?.walletAddress || req.headers["x-demo-wallet"] as string | undefined,
          };
          return next();
        }
      }
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Authentication required. Missing or malformed Bearer token.",
        code: "AUTH_REQUIRED",
      });
    }

    const token = authHeader.split("Bearer ")[1].trim();

    // In production or when demo auth is disabled, reject demo tokens immediately
    if (token.startsWith("demo-token-") && !isDemoAuthEnabled) {
      return res.status(401).json({
        success: false,
        error: "Demo authentication is disabled in this environment. Please provide a verified Firebase ID token.",
        code: "AUTH_REQUIRED",
      });
    }

    // Check if token matches standard demo mock tokens (in development/test mode only)
    if (isDemoAuthEnabled && token.startsWith("demo-token-")) {
      const roleStr = token.replace("demo-token-", "") as UserRole;
      const demoUsers: Record<string, AuthenticatedUser> = {
        seller: {
          uid: "seller-123",
          email: "seller@landchain.demo",
          role: "seller",
          walletAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        },
        buyer: {
          uid: "buyer-456",
          email: "buyer@landchain.demo",
          role: "buyer",
          walletAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        },
        government: {
          uid: "gov-789",
          email: "authority@landchain.demo",
          role: "government",
          walletAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        },
        agent: {
          uid: "agent-101",
          email: "agent@landchain.demo",
          role: "agent",
          walletAddress: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
        },
      };

      if (demoUsers[roleStr]) {
        req.user = demoUsers[roleStr];
        return next();
      }
    }

    // Real Firebase ID Token Verification
    if (isUsingRealFirebase) {
      const decodedToken = await admin.auth().verifyIdToken(token);
      let role: UserRole = (decodedToken.role as UserRole) || "buyer";
      let walletAddress = decodedToken.walletAddress as string | undefined;

      const userDoc = await admin.firestore().collection("users").doc(decodedToken.uid).get();
      if (userDoc.exists) {
        const data = userDoc.data();
        if (data?.role) role = data.role as UserRole;
        if (data?.walletAddress) walletAddress = data.walletAddress;
      }

      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email || "",
        role,
        walletAddress,
      };
      return next();
    }

    // Development Fallback: check in-memory store by token (or user ID)
    if (isDemoAuthEnabled) {
      const user = memoryStore.getDoc("users", token);
      if (user) {
        req.user = {
          uid: user.uid,
          email: user.email,
          role: user.role,
          walletAddress: user.walletAddress,
        };
        return next();
      }
    }

    return res.status(401).json({
      success: false,
      error: "Invalid or expired authentication token.",
      code: "AUTH_REQUIRED",
    });
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      error: "Authentication failed: " + (error.message || "Unknown error"),
      code: "AUTH_REQUIRED",
    });
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Authentication required.", code: "AUTH_REQUIRED" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Role '${req.user.role}' is not authorized for this resource. Required: [${allowedRoles.join(", ")}]`,
        code: "FORBIDDEN",
      });
    }
    next();
  };
}
