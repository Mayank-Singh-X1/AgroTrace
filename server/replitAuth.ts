import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import { Strategy as LocalStrategy } from "passport-local";
import { storage } from "./storage";
import { sqliteDb } from "./db";
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

// Mock user for development
const mockUser = {
  id: "dev-user-1",
  email: "farmer@example.com",
  firstName: "John",
  lastName: "Farmer",
  profileImageUrl: "https://ui-avatars.com/api/?name=John+Farmer",
  role: "farmer",
  companyName: "Green Acres Farm",
  location: "Farmville, CA",
  verificationStatus: "verified",
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
        // In development, always authenticate successfully with mock user
        const user = mockUser;
        await upsertUser(user);
        updateUserSession(user);
        return done(null, user);
      }
    ));

    // Auto-login middleware for development
    app.use((req, res, next) => {
      if (!req.isAuthenticated()) {
        req.login(mockUser, (err) => {
          if (err) return next(err);
          next();
        });
      } else {
        next();
      }
    });
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    if (isDevelopment) {
      // In development, authenticate with mock user
      req.login(mockUser, (err) => {
        if (err) return next(err);
        // Return success response instead of redirect for fetch requests
        res.status(200).json({ success: true, user: mockUser });
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

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect('/');
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
