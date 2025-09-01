# AgriTrace - Agricultural Supply Chain Tracking System

## Overview

AgriTrace is a comprehensive agricultural supply chain tracking platform that provides transparency from farm to table. The system enables farmers, distributors, retailers, and consumers to track agricultural products throughout their journey, verify quality, and ensure authenticity. Built as a full-stack web application, it combines React frontend with Express.js backend, PostgreSQL database, and implements role-based access control with Replit authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and dark mode support
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit OAuth integration with session management
- **Session Storage**: PostgreSQL-based session store using connect-pg-simple
- **API Design**: RESTful API with role-based access control

### Database Design
- **Database**: PostgreSQL with Neon serverless hosting
- **Schema Management**: Drizzle Kit for migrations and schema evolution
- **Key Entities**:
  - Users with role-based permissions (farmer, distributor, retailer, consumer, inspector)
  - Products with batch tracking and status management
  - Supply chain stages for tracking product journey
  - Transactions for ownership transfers
  - Verifications for quality assurance
  - Sessions for authentication state

### Authentication & Authorization
- **Provider**: Replit OAuth with OpenID Connect
- **Session Management**: Secure server-side sessions with PostgreSQL storage
- **Role-Based Access**: Different permissions for farmers, distributors, retailers, consumers, and inspectors
- **Security**: CSRF protection, secure cookies, and proper session lifecycle management

### Application Features
- **Product Tracking**: Complete product lifecycle from creation to delivery
- **Supply Chain Visualization**: Visual representation of product journey through different stages
- **QR Code Integration**: Product identification and consumer lookup functionality
- **Transaction Management**: Ownership transfers and status updates
- **Verification System**: Quality assurance and compliance tracking
- **Analytics Dashboard**: Role-specific metrics and insights
- **Consumer Lookup**: Public product verification without authentication

### Development Patterns
- **Monorepo Structure**: Shared TypeScript schemas between client and server
- **Type Safety**: End-to-end TypeScript with Zod schema validation
- **Error Handling**: Centralized error management with proper HTTP status codes
- **Development Tools**: Hot module replacement, runtime error overlay, and comprehensive logging

## External Dependencies

### Core Technologies
- **Database**: Neon PostgreSQL serverless database
- **Authentication**: Replit OAuth service
- **UI Framework**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS for utility-first styling
- **Fonts**: Google Fonts integration (Architects Daughter, DM Sans, Fira Code, Geist Mono)

### Development Services
- **Hosting**: Replit platform with integrated development environment
- **Build Tools**: Vite with React plugin and TypeScript support
- **Package Management**: npm with lockfile for reproducible builds
- **Development Plugins**: Replit-specific plugins for error handling and cartographer integration

### Third-Party Libraries
- **Date Handling**: date-fns for date formatting and manipulation
- **Form Management**: React Hook Form with Hookform resolvers
- **Validation**: Zod for runtime type checking and validation
- **Icons**: Lucide React for consistent iconography
- **Utilities**: clsx and tailwind-merge for conditional styling