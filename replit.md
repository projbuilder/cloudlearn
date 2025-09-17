# Overview

CloudLearn is a comprehensive cloud-native e-learning platform simulation featuring federated learning, AI personalization, and gamification. The application demonstrates real-world cloud computing concepts through an interactive learning management system where students can take adaptive quizzes, receive AI tutoring, and participate in a federated learning network. The platform simulates enterprise-grade cloud infrastructure including multi-region operations, serverless computing, and advanced privacy-preserving machine learning.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side application is built with React and TypeScript using Vite as the build tool. The architecture follows a modern component-based approach with:

- **State Management**: Zustand stores for application state (auth, dashboard, quiz data)
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: shadcn/ui component library with Radix UI primitives and Tailwind CSS
- **Data Fetching**: TanStack Query for server state management with automatic caching and synchronization
- **Real-time Communication**: WebSocket integration for live updates and federated learning coordination

## Backend Architecture
The server is built with Express.js and follows a service-oriented architecture:

- **API Layer**: RESTful endpoints with Express.js serving both API routes and static assets
- **Service Layer**: Modular services for federated learning, content management, quiz generation, AI tutoring, and analytics
- **Authentication**: OIDC integration with Replit Auth for user management and role-based access control
- **Session Management**: PostgreSQL-backed session storage with connect-pg-simple

## Data Storage Solutions
The application uses a PostgreSQL database with Drizzle ORM for type-safe database operations:

- **Schema Design**: Comprehensive schema covering users, courses, modules, quizzes, attempts, events, and federated learning metadata
- **Database Provider**: Neon serverless PostgreSQL with connection pooling
- **Migration Strategy**: Drizzle Kit for schema migrations and database management
- **Session Storage**: Dedicated sessions table for user authentication state

## Authentication and Authorization
Multi-layered security approach using industry standards:

- **OIDC Integration**: OpenID Connect with Replit's authentication provider
- **Role-Based Access**: Three distinct roles (student, instructor, admin) with appropriate route protection
- **Session Management**: Secure HTTP-only cookies with configurable TTL
- **Middleware Protection**: Route-level authentication checks with proper error handling

## Real-time Features
WebSocket integration provides live updates for:

- **Federated Learning**: Real-time coordination between learning nodes
- **Quiz Interactions**: Live feedback and adaptive question delivery
- **Analytics Updates**: Dynamic dashboard updates and progress tracking
- **System Monitoring**: Cloud operations and health status updates

## AI and Machine Learning Components
The platform incorporates several AI-driven features:

- **Adaptive Learning**: Bayesian Knowledge Tracing for personalized difficulty adjustment
- **Federated Learning Simulation**: FedAvg algorithm implementation with differential privacy
- **Content Generation**: AI-powered quiz question generation with multiple content sources
- **Recommendation Engine**: Contextual bandit algorithms for next-best-module suggestions
- **Natural Language Processing**: AI tutor with RAG (Retrieval-Augmented Generation) capabilities

## Cloud Infrastructure Simulation
The application simulates enterprise cloud concepts:

- **Multi-Region Architecture**: Simulated geographic distribution with latency modeling
- **Auto-scaling**: Dynamic resource allocation based on load simulation
- **Serverless Computing**: Job scheduling system mimicking serverless function execution
- **Object Storage**: Integration patterns for content and asset management
- **Monitoring and Observability**: Comprehensive logging and metrics collection

# External Dependencies

## Core Technology Stack
- **React 18**: Frontend framework with hooks and modern patterns
- **TypeScript**: Type safety across the entire application stack
- **Express.js**: Node.js web framework for API and static serving
- **PostgreSQL**: Primary database via Neon serverless platform
- **Drizzle ORM**: Type-safe database operations and migrations

## UI and Styling
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Radix UI**: Headless component primitives for accessibility
- **shadcn/ui**: Pre-built component library with consistent design system
- **Lucide React**: Icon library for consistent iconography

## Authentication and Security
- **OpenID Connect**: Industry standard authentication protocol
- **Passport.js**: Authentication middleware for Node.js
- **connect-pg-simple**: PostgreSQL session store for Express

## Data Management
- **TanStack Query**: Server state management with caching and synchronization
- **Zustand**: Lightweight client-side state management
- **Zod**: Runtime type validation and schema definitions

## Development and Build Tools
- **Vite**: Fast build tool and development server
- **ESBuild**: JavaScript bundler for production builds
- **TypeScript Compiler**: Type checking and compilation
- **PostCSS**: CSS processing with Autoprefixer

## Content Sources (Simulated)
- **OpenStax**: Open-source textbook content for educational materials
- **Wikipedia API**: Supplementary content and knowledge base
- **MIT OpenCourseWare**: Academic content integration
- **Khan Academy**: Educational video and exercise content
- **arXiv**: Research paper abstracts for advanced topics

The application is designed to work offline with bundled content while providing enhanced features when online connectivity is available.