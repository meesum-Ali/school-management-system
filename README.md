![License](https://img.shields.io/github/license/meesum-Ali/school-management-system)
   ![Contributors](https://img.shields.io/github/contributors/meesum-Ali/school-management-system)
   ![Issues](https://img.shields.io/github/issues/meesum-Ali/school-management-system)

# School Management System

School Management System is a [Next.js](https://nextjs.org/) frontend and [NestJS](https://nestjs.com/) backend application. This project serves as a School Management System, offering efficient and scalable solutions for educational institutions.

## Table of Contents

- [Features](#features)
- [Architectural Overview](#architectural-overview)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features

- **User Management:** Secure user registration and login with role-based access control (RBAC) capabilities. Full CRUD operations for managing users.
- **Student Management:** Comprehensive CRUD operations for student records.
- **Class Management:** Allows administrators to create, view, update, and delete school classes, defining their names and levels.
- **Subject Management:** Enables administrators to define and manage academic subjects, including names, codes, and descriptions.
- **Class-Subject Assignment:** Provides functionality for administrators to assign subjects to specific classes and managing these relationships.
- **Student Enrollment in Classes:** Enables administrators to assign students to specific classes and manage these enrollments.
- **Multi-Tenancy (SaaS Ready):** Designed to support multiple schools, each with isolated data. Includes a `School` entity and `SUPER_ADMIN` role for system-wide administration and school onboarding. School-specific administrators (`ADMIN` role) manage their own school's data and users.
- **Authentication System:** Robust JWT-based authentication for secure API access, supporting multi-tenant context.
- **Scalable Architecture:** Built with Next.js (frontend) and NestJS (backend) for scalability and maintainability.
- **API-First Backend:** Backend designed with an API-first approach for clear contracts and client integration.
- **User-Focused Frontend:** Frontend developed with a user-first mindset, emphasizing usability and component-based design.
- **Dockerized:** Fully containerized for easy setup, development, and deployment.
- **TypeScript:** End-to-end TypeScript for enhanced type safety and developer experience.
- **Material-UI (MUI):** Comprehensive React UI framework following Material Design principles for a consistent and responsive user interface.
- **Development Guidelines:** Clear development practices outlined in `DevelopmentGuidelines.md`.

## Architectural Overview

The School Management System is designed with a focus on maintainability, scalability, and adherence to modern development best practices. Our core architectural choices include:

- **Clean Architecture:** Structuring the backend to separate concerns, making the core business logic independent of frameworks and external dependencies.
- **Domain-Driven Design (DDD):** Applying DDD principles to model the software closely to the business domain, using a Ubiquitous Language for clarity.
- **API-First Backend:** The NestJS backend exposes a well-defined API, serving as the primary interface for client applications.
- **Component-Based Frontend:** The Next.js frontend is built using a component-based architecture, emphasizing reusability and a user-first approach.

For a comprehensive understanding of our development practices, architectural principles, coding standards, and design philosophies, please see our [Development Guidelines](DevelopmentGuidelines.md).

## Technologies Used

- **Frontend:** [Next.js](https://nextjs.org/), [React](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend:** [NestJS](https://nestjs.com/), [TypeORM](https://typeorm.io/), [PostgreSQL](https://www.postgresql.org/)
- **Authentication:** JWT, [bcrypt](https://www.npmjs.com/package/bcrypt) (for password hashing)
- **Programming Language:** [TypeScript](https://www.typescriptlang.org/)
- **Containerization:** [Docker](https://www.docker.com/), Docker Compose
- **Package Manager:** [pnpm](https://pnpm.io/)
- **Testing:** [Jest](https://jestjs.io/), [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/), [Supertest](https://www.npmjs.com/package/supertest)

## Getting Started

### Prerequisites

- **Node.js** v14+
- **pnpm** v6+ (Install via `npm install -g pnpm`)
- **Docker** (optional, for containerization)

### Installation

1. **Clone the Repository:**

    ```bash
    git clone https://github.com/yourusername/school-management-system.git
    cd school-management-system
    ```

2. **Install Dependencies:**

    - **Frontend:**

        ```bash
        cd frontend
        pnpm install
        ```

    - **Backend:**

        ```bash
        cd ../backend
        pnpm install
        ```

3. **Environment Variables:**

    - Copy the example environment files and configure them.

        ```bash
        cp frontend/.env.example frontend/.env
        cp backend/.env.example backend/.env
        ```

    - Update the `.env` files with your configuration.

#### Frontend Environment Variables

| Variable | Default | Description |
| -------- | ------- | ----------- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000/api` | Base URL for the API |
| `NEXT_PUBLIC_APP_VERSION` | `1.0.0` | Application version displayed in the UI |
| `NEXT_PUBLIC_ENABLE_FEATURE_X` | `false` | Toggle to enable Feature X |

### Running the Application

- **Using Docker Compose:**

    Ensure Docker is installed and running.

    ```bash
    cd school-management-system # Navigate to the root project directory if you cloned it into a subdirectory
    docker-compose up --build
    ```

- **Running Frontend and Backend Separately:**

    **Backend:**
    ```bash
    cd backend
    # Ensure .env file is set up from .env.example
    pnpm install
    pnpm run start:dev
    ```
    The backend will typically be available at `http://localhost:5000`.

    **Frontend:**
    ```bash
    cd frontend
    # Ensure .env file is set up from .env.example
    pnpm install
    pnpm dev
    ```
    The frontend will typically be available at `http://localhost:3000`.

    Open [http://localhost:3000](http://localhost:3000) to view the application.

### Multi-Tenancy Notes

- The system now supports multiple schools.
- **Super Admin:** A `SUPER_ADMIN` role exists for managing schools. Create this user directly in the database or via a seed script initially.
- **School Admin Login:** When logging in as a school `ADMIN` or any other school-specific user, you might need to provide a `schoolIdentifier` (e.g., the school's domain or a unique code, if that school was created with one) on the login page to specify which school you are logging into. If no identifier is provided, the system will attempt to log in a global user (like `SUPER_ADMIN`).
- **Data Isolation:** Data for students, classes, users (except global admins), etc., is isolated per school.

## Project Structure

The repository is divided into two main applications:

- **`frontend/`** - Contains the Next.js client used for the web interface. All UI components, pages, and static assets live here.
- **`backend/`** - Houses the NestJS API that powers the server-side logic and database interactions.

## Contributing

Contributions are welcome! Please see the [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines on how to proceed.

## License

This project is licensed under the [MIT License](LICENSE).

## Code of Conduct

Please adhere to the [Code of Conduct](CODE_OF_CONDUCT.md) to ensure a welcoming and respectful environment for all contributors.

## Support

If you encounter any issues or have questions, feel free to reach out:

- **GitHub Issues:** [Open an Issue](https://github.com/meesum-Ali/school-management-system/issues)
- **Email:** [meesumdex@gmail.com](mailto:meesumdex@gmail.com)

## Contact

For any inquiries or further information, you can contact:

**Syed Meesum Ali**  
Email: [meesumdex@gmail.com](mailto:meesumdex@gmail.com)  
GitHub: [@syedmeesumali](https://github.com/meesum-ali)  
LinkedIn: [Syed Meesum Ali](https://linkedin.com/in/smeesumali)

## Acknowledgements

- **Next.js** - React framework for building the frontend
- **NestJS** - Node.js framework for building the backend
- **PostgreSQL** - Relational database
- **TypeORM** - ORM for database operations
- **Docker** - Containerization platform
- **TypeScript** - Type-safe JavaScript
- **Material-UI (MUI)** - React component library for Material Design
- **Emotion** - CSS-in-JS library used by Material-UI for styling

---

> *This project follows the [Contributor Covenant](https://www.contributor-covenant.org/version/2/0/code_of_conduct/) Code of Conduct. By participating, you are expected to uphold this code.*
