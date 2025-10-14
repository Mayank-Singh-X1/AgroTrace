import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import { Strategy as LocalStrategy } from "passport-local";
import { storage } from "../database/storage";
import { sqliteDb } from "../database/db";
import { randomUUID } from "crypto";

// Local development mode - skip Replit authentication
const isDevelopment = process.env.NODE_ENV === "development";

// Setup SQLite session store
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // In-memory session store for development
  return session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: !isDevelopment, // Only use secure in production
      maxAge: sessionTtl,
    },
  });
}

// Mock users for development - different roles
const mockUsers = {
  farmer: {
    id: "dev-farmer-1",
    email: "farmer@example.com",
    firstName: "John",
    lastName: "Farmer",
    profileImageUrl: "https://ui-avatars.com/api/?name=John+Farmer&background=16a34a&color=ffffff",
    role: "farmer",
    companyName: "Green Acres Farm",
    location: "Farmville, CA",
    verificationStatus: "verified",
  },
  distributor: {
    id: "dev-distributor-1",
    email: "distributor@example.com",
    firstName: "Sarah",
    lastName: "Distribution",
    profileImageUrl: "https://ui-avatars.com/api/?name=Sarah+Distribution&background=2563eb&color=ffffff",
    role: "distributor",
    companyName: "FastTrack Logistics",
    location: "Los Angeles, CA",
    verificationStatus: "verified",
  },
  retailer: {
    id: "dev-retailer-1",
    email: "retailer@example.com",
    firstName: "Mike",
    lastName: "Store",
    profileImageUrl: "https://ui-avatars.com/api/?name=Mike+Store&background=dc2626&color=ffffff",
    role: "retailer",
    companyName: "Fresh Market Store",
    location: "San Francisco, CA",
    verificationStatus: "verified",
  },
  inspector: {
    id: "dev-inspector-1",
    email: "inspector@example.com",
    firstName: "Emma",
    lastName: "Inspector",
    profileImageUrl: "https://ui-avatars.com/api/?name=Emma+Inspector&background=7c3aed&color=ffffff",
    role: "inspector",
    companyName: "Quality Assurance Corp",
    location: "Sacramento, CA",
    verificationStatus: "verified",
  },
  consumer: {
    id: "dev-consumer-1",
    email: "consumer@example.com",
    firstName: "Alex",
    lastName: "Consumer",
    profileImageUrl: "https://ui-avatars.com/api/?name=Alex+Consumer&background=059669&color=ffffff",
    role: "consumer",
    companyName: null,
    location: "San Jose, CA",
    verificationStatus: "verified",
  }
};

// Simple function to update user session for local development
function updateUserSession(user: any) {
  // For development, we don't need tokens
  user.expires_at = Math.floor(Date.now() / 1000) + 86400; // Expires in 24 hours
}
async function upsertUser(user: any) {
  await storage.upsertUser({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    profileImageUrl: user.profileImageUrl,
    role: user.role,
    companyName: user.companyName,
    location: user.location,
    verificationStatus: user.verificationStatus,
  });
  return user;
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  if (isDevelopment) {
    // For development, use a simple local strategy
    passport.use(new LocalStrategy(
      { usernameField: 'email', passwordField: 'password' },
      async (email, password, done) => {
        // In development, find user by email to determine role
        const user = Object.values(mockUsers).find(u => u.email === email) || mockUsers.farmer;
        await upsertUser(user);
        updateUserSession(user);
        return done(null, user);
      }
    ));

    // Disable auto-login middleware - users should explicitly login
    // This allows proper logout functionality
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // Get available roles
  app.get("/api/roles", (req, res) => {
    if (isDevelopment) {
      const roles = Object.keys(mockUsers).map(role => ({
        role,
        label: role.charAt(0).toUpperCase() + role.slice(1),
        user: mockUsers[role as keyof typeof mockUsers]
      }));
      res.json({ roles });
    } else {
      res.status(500).send('Role selection not available in production');
    }
  });

  app.get("/api/login", (req, res, next) => {
    if (isDevelopment) {
      // Get role from query parameter, default to farmer
      const role = (req.query.role as string) || 'farmer';
      const user = mockUsers[role as keyof typeof mockUsers] || mockUsers.farmer;
      
      // Authenticate with selected mock user
      req.login(user, (err) => {
        if (err) return next(err);
        // Return success response instead of redirect for fetch requests
        res.status(200).json({ success: true, user });
      });
    } else {
      // In production, use Replit auth
      res.status(500).send('Replit authentication not configured');
    }
  });

  app.get("/api/callback", (req, res, next) => {
    if (isDevelopment) {
      res.redirect('/');
    } else {
      res.status(500).send('Replit authentication not configured');
    }
  });

  // Handle both GET and POST for logout
  app.all("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: "Logout failed" });
      }
      
      // Destroy the session
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destroy error:', err);
        }
        
        // Clear the session cookie
        res.clearCookie('connect.sid');
        
        // Return JSON response for API calls or redirect for browser requests
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
          res.status(200).json({ success: true, message: "Logged out successfully" });
        } else {
          res.redirect('/');
        }
      });
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (isDevelopment) {
    // In development, always proceed
    return next();
  }

  // For production, check token expiration
  if (!user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  // Token refresh logic would go here for production
  return res.status(401).json({ message: "Session expired" });
};
