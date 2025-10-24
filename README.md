![License](https://img.shields.io/github/license/meesum-Ali/school-management-system)
![Contributors](https://img.shields.io/github/contributors/meesum-Ali/school-management-system)
![Issues](https://img.shields.io/github/issues/meesum-Ali/school-management-system)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![NestJS](https://img.shields.io/badge/NestJS-10-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

# School Management System

A modern, full-stack School Management System built with [Next.js 14](https://nextjs.org/) (App Router) frontend and [NestJS 10](https://nestjs.com/) backend. This comprehensive solution provides efficient and scalable tools for educational institutions with multi-tenancy support, powered by Zitadel authentication.

## ✨ Features

### Core Functionality
- **User Management**: Secure user registration and login with role-based access control (RBAC)
  - Roles: SUPER_ADMIN, SCHOOL_ADMIN, TEACHER, STUDENT
  - Full CRUD operations with multi-tenant isolation
- **Student Management**: Comprehensive CRUD operations for student records with class enrollment
- **Class Management**: Create, view, update, and delete school classes with subject assignments
- **Subject Management**: Define and manage academic subjects with metadata
- **Class-Subject Assignment**: Link subjects to classes with flexible relationships
- **Class Schedule Management**: Create and manage timetables for classes
- **Teacher Management**: Manage teacher profiles and class assignments

### Advanced Features
- **Multi-Tenancy (SaaS Ready)**: 
  - Support for multiple schools with complete data isolation
  - Organization-based architecture using Zitadel
  - SUPER_ADMIN role for system-wide administration
  - SCHOOL_ADMIN role for school-level management
- **Modern Authentication**:
  - Zitadel OAuth 2.0/OIDC integration
  - JWT-based token validation with JWKS
  - Local authentication fallback
  - SSR-compatible auth flow
- **Real-time Data Management**:
  - TanStack Query (React Query) for efficient data fetching
  - Automatic background refetching and cache invalidation
  - Optimistic updates for better UX

### Technical Excellence
- **Scalable Architecture**: Next.js 14 App Router + NestJS 10
- **Type Safety**: End-to-end TypeScript with strict mode
- **Modern UI**: Material-UI 7 + Tailwind CSS
- **API Documentation**: Auto-generated Swagger/OpenAPI docs
- **Containerized**: Full Docker Compose setup for development
- **SSR/SSG**: Server-side rendering and static generation support
- **Progressive Enhancement**: Works without JavaScript where possible

## 🏗️ Architectural Overview

### Frontend Architecture
- **Framework**: Next.js 14 with App Router (file-based routing)
- **UI Components**: Material-UI 7 with Emotion CSS-in-JS
- **Styling**: Tailwind CSS for utility-first styling
- **State Management**: 
  - TanStack Query for server state
  - React Context for auth state
- **Data Fetching**: Custom hooks with React Query
- **Type Safety**: TypeScript interfaces for all API responses

### Backend Architecture
- **Framework**: NestJS 10 with Express
- **Database**: PostgreSQL with TypeORM
- **Authentication**: Zitadel JWT validation via passport-jwt
- **API Design**: RESTful with OpenAPI documentation
- **Validation**: class-validator and class-transformer DTOs
- **Multi-tenancy**: Organization-based data isolation
- **Health Checks**: @nestjs/terminus for monitoring

### Infrastructure
- **Containerization**: Docker Compose for all services
- **Database**: PostgreSQL 14+
- **Auth Provider**: Zitadel (self-hosted)
- **Reverse Proxy**: Ready for Nginx/Traefik
- **CI/CD**: GitHub Actions ready

For comprehensive development practices and architectural principles, see:
- [Development Guidelines](DevelopmentGuidelines.md)
- [Multi-Tenancy Guide](MultiTenancyGuide.md)
- [Zitadel Setup](ZITADEL_SETUP.md)
- [AI Agent Guidelines](AGENTS.md)

## 🚀 Technologies Used

### Frontend Stack
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **UI Library**: [React 18](https://reactjs.org/)
- **Component Library**: [Material-UI 7](https://mui.com/)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/)
- **State Management**: [TanStack Query 5](https://tanstack.com/query/latest)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **JWT Decoding**: [jwt-decode](https://www.npmjs.com/package/jwt-decode)

### Backend Stack
- **Framework**: [NestJS 10](https://nestjs.com/)
- **Database ORM**: [TypeORM 0.3](https://typeorm.io/)
- **Database**: [PostgreSQL 14+](https://www.postgresql.org/)
- **Authentication**: [Zitadel](https://zitadel.com/) + [Passport.js](http://www.passportjs.org/)
- **Validation**: [class-validator](https://github.com/typestack/class-validator)
- **API Docs**: [Swagger/OpenAPI](https://swagger.io/)
- **Testing**: [Jest](https://jestjs.io/) + [Supertest](https://www.npmjs.com/package/supertest)

### DevOps & Tools
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Containerization**: [Docker](https://www.docker.com/) + Docker Compose
- **Package Manager**: [npm](https://www.npmjs.com/) / [pnpm](https://pnpm.io/)
- **Linting**: [ESLint](https://eslint.org/)
- **Version Control**: Git + GitHub


## 📋 Getting Started

### Prerequisites

- **Node.js** v18+ (v20 recommended)
- **npm** v9+ or **pnpm** v8+
- **Docker** & **Docker Compose** (for containerized setup)
- **PostgreSQL** 14+ (if running without Docker)

### Quick Start (Recommended)

1. **Clone the Repository**

   ```bash
   git clone https://github.com/meesum-Ali/school-management-system.git
   cd school-management-system
   ```

2. **Start All Services with Docker**

   ```bash
   docker-compose up -d
   ```

   This will start:
   - PostgreSQL database (port 5432)
   - Zitadel auth server (port 8888)
   - NestJS backend (port 5000)
   - Next.js frontend (port 3000)
   - PgAdmin (port 8080)

3. **Access the Application**

   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:5000/api
   - **API Documentation**: http://localhost:5000/api-docs
   - **Zitadel Console**: http://localhost:8888/ui/console
   - **PgAdmin**: http://localhost:8080

4. **Configure Zitadel Authentication**

   See [ZITADEL_SETUP.md](ZITADEL_SETUP.md) for detailed setup instructions:
   - Initial login: `admin` / `Password1!`
   - Create project and application
   - Configure roles and organizations
   - Update environment variables

### Manual Setup

#### Backend Setup

1. **Navigate to backend directory**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run database migrations**

   ```bash
   npm run migration:run
   ```

5. **Start development server**

   ```bash
   npm run start:dev
   ```

   Backend will be available at http://localhost:5000

#### Frontend Setup

1. **Navigate to frontend directory**

   ```bash
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

   Frontend will be available at http://localhost:3000

### Environment Variables

#### Backend (.env)

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=sms_db

# JWT (for local auth)
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=3600s

# Zitadel
ZITADEL_ISSUER=http://localhost:8888
ZITADEL_CLIENT_ID=your-client-id
ZITADEL_CLIENT_SECRET=your-client-secret
ZITADEL_REDIRECT_URI=http://localhost:3000/auth/callback
```

#### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_ZITADEL_ISSUER=http://localhost:8888
NEXT_PUBLIC_ZITADEL_CLIENT_ID=your-client-id
```

See `.env.example` files for complete configuration options.


## 📁 Project Structure

```
school-management-system/
├── frontend/                  # Next.js 14 App Router frontend
│   ├── app/                  # Next.js app directory (routes)
│   │   ├── layout.tsx       # Root layout with providers
│   │   ├── page.tsx         # Home page
│   │   ├── login/           # Login page
│   │   ├── admin/           # Admin dashboard routes
│   │   │   ├── dashboard/
│   │   │   ├── students/
│   │   │   ├── classes/
│   │   │   ├── subjects/
│   │   │   └── users/
│   │   └── unauthorized/
│   ├── components/          # React components
│   │   ├── Auth/           # Authentication components
│   │   ├── Layout/         # Layout components (Sidebar, Navbar)
│   │   ├── Students/       # Student-specific components
│   │   ├── Classes/        # Class management components
│   │   └── ui/             # Reusable UI components
│   ├── contexts/           # React contexts (AuthContext)
│   ├── hooks/              # Custom React Query hooks
│   │   ├── useStudents.ts
│   │   ├── useClasses.ts
│   │   ├── useSubjects.ts
│   │   └── useUsers.ts
│   ├── providers/          # App-level providers
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   └── middleware.ts       # Next.js middleware (auth)
│
├── backend/                # NestJS backend
│   ├── src/
│   │   ├── auth/          # Authentication module
│   │   │   ├── decorators/
│   │   │   ├── guards/
│   │   │   └── dto/
│   │   ├── zitadel/       # Zitadel integration
│   │   │   ├── zitadel.strategy.ts
│   │   │   ├── zitadel.config.ts
│   │   │   └── zitadel-roles.guard.ts
│   │   ├── users/         # User management
│   │   ├── students/      # Student management
│   │   ├── classes/       # Class management
│   │   ├── subjects/      # Subject management
│   │   ├── teachers/      # Teacher management
│   │   ├── schools/       # School management
│   │   ├── class-schedule/# Scheduling
│   │   ├── health/        # Health check endpoint
│   │   ├── core/          # Core utilities
│   │   └── migrations/    # Database migrations
│   ├── test/              # E2E tests
│   └── dist/              # Compiled output (gitignored)
│
├── init-db/               # Database initialization scripts
├── docker-compose.yml     # Docker services configuration
├── ZITADEL_SETUP.md      # Zitadel setup guide
├── AGENTS.md             # AI agent guidelines
├── PRD.md                # Product requirements
├── MultiTenancyGuide.md  # Multi-tenancy documentation
└── README.md             # This file
```

### Key Directories Explained

- **`frontend/app/`**: Next.js 14 App Router directory - file-based routing
- **`frontend/hooks/`**: Custom TanStack Query hooks for data fetching
- **`backend/src/zitadel/`**: Zitadel authentication integration
- **`backend/src/*/entities/`**: TypeORM entity definitions
- **`backend/src/*/dto/`**: Data Transfer Objects for validation

## 🔐 Authentication & Authorization

### Roles

- **SUPER_ADMIN**: System-wide administration, manages all schools
- **SCHOOL_ADMIN**: School-level administration, manages school data
- **TEACHER**: Teacher access, manages classes and students
- **STUDENT**: Student access, views own data

### Authentication Flow

1. **Zitadel OAuth 2.0** (Recommended):
   - User redirects to Zitadel login
   - Authenticates with Zitadel
   - Receives JWT token
   - Token validated via JWKS endpoint

2. **Local Authentication** (Fallback):
   - POST to `/api/auth/login`
   - Receives JWT token
   - Token validated by backend JWT secret

### Multi-Tenancy

- Each school is a Zitadel organization
- Users belong to organizations (schools)
- Data is isolated by `schoolId`
- SUPER_ADMIN can access all schools
- SCHOOL_ADMIN limited to their school

See [ZITADEL_SETUP.md](ZITADEL_SETUP.md) for detailed authentication setup.

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### Frontend Tests

```bash
cd frontend

# Run tests (when implemented)
npm test
```

## 🛠️ Development

### Available Scripts

#### Backend
```bash
npm run start          # Start production server
npm run start:dev      # Start development server with watch
npm run start:debug    # Start debug mode
npm run build          # Build for production
npm run lint           # Lint code
npm run format         # Format code with Prettier
npm run migration:generate  # Generate migration
npm run migration:run       # Run migrations
```

#### Frontend
```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Lint code
npm run type-check    # Check TypeScript types
```

### Database Migrations

```bash
cd backend

# Generate migration
npm run migration:generate -- src/migrations/MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

### API Documentation

Swagger documentation is auto-generated and available at:
- **Development**: http://localhost:5000/api-docs
- **Production**: `{API_URL}/api-docs`

## 🐛 Debugging

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f zitadel
```

### Health Checks

```bash
# Backend health
curl http://localhost:5000/api/health

# Zitadel configuration
curl http://localhost:8888/.well-known/openid-configuration
```

### Common Issues

1. **Port conflicts**: Ensure ports 3000, 5000, 5432, 8080, 8888 are available
2. **Database connection**: Check PostgreSQL is running and credentials are correct
3. **Zitadel startup**: First-time setup may take 1-2 minutes
4. **Token validation fails**: Verify Zitadel issuer URL and client configuration

## 📚 Documentation

- [Product Requirements](PRD.md)
- [Development Guidelines](DevelopmentGuidelines.md)
- [Multi-Tenancy Guide](MultiTenancyGuide.md)
- [Zitadel Setup](ZITADEL_SETUP.md)
- [AI Agent Guidelines](AGENTS.md)
- [Contributing](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Run tests and linting
5. Commit your changes (`git commit -m 'feat: Add AmazingFeature'`)
6. Push to the branch (`git push origin feature/AmazingFeature`)
7. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Test additions or changes
- `chore:` Build process or auxiliary tool changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## 👥 Contact & Support

### Maintainer

**Syed Meesum Ali**  
- Email: [meesumdex@gmail.com](mailto:meesumdex@gmail.com)  
- GitHub: [@meesum-Ali](https://github.com/meesum-ali)  
- LinkedIn: [Syed Meesum Ali](https://linkedin.com/in/smeesumali)

### Get Help

- **GitHub Issues**: [Report a bug or request a feature](https://github.com/meesum-Ali/school-management-system/issues)
- **Discussions**: [Join the conversation](https://github.com/meesum-Ali/school-management-system/discussions)
- **Email**: [meesumdex@gmail.com](mailto:meesumdex@gmail.com)

## 🙏 Acknowledgements

This project is built with amazing open-source technologies:

- **[Next.js](https://nextjs.org/)** - React framework for production
- **[NestJS](https://nestjs.com/)** - Progressive Node.js framework
- **[Zitadel](https://zitadel.com/)** - Modern authentication platform
- **[Material-UI](https://mui.com/)** - React component library
- **[TanStack Query](https://tanstack.com/query)** - Powerful data synchronization
- **[TypeORM](https://typeorm.io/)** - ORM for TypeScript and JavaScript
- **[PostgreSQL](https://www.postgresql.org/)** - Advanced open-source database
- **[Docker](https://www.docker.com/)** - Containerization platform
- **[TypeScript](https://www.typescriptlang.org/)** - Typed JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework

## 📊 Project Status

- ✅ Core authentication with Zitadel
- ✅ Multi-tenancy support
- ✅ Student, class, and subject management
- ✅ User and role management
- ✅ Class scheduling
- ✅ API documentation
- 🚧 Advanced reporting (in progress)
- 🚧 Mobile app (planned)
- 🚧 Notification system (planned)

## 🔒 Security

If you discover a security vulnerability, please email [meesumdex@gmail.com](mailto:meesumdex@gmail.com) instead of using the issue tracker. All security vulnerabilities will be promptly addressed.

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ by [Syed Meesum Ali](https://github.com/meesum-ali)

</div>
