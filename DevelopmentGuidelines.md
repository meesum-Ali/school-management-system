# Development Guidelines for School Management System

## 1. Introduction

This document outlines the core development principles, architectural vision, coding standards, and design philosophies for the School Management System project. Adhering to these guidelines will help ensure a consistent, maintainable, scalable, and high-quality codebase. All contributors are expected to be familiar with and apply these principles.

## 2. Core Architectural Principles

Our architecture is guided by the principles of Clean Architecture and Domain-Driven Design (DDD) to build a system that is robust, scalable, maintainable, and aligned with business needs.

### 2.1. Clean Architecture

**Goal:** To achieve a separation of concerns that allows the system to be testable, UI-independent, database-independent, and independent of external frameworks. This ensures that the core business logic (Use Cases) and domain entities are not coupled to volatile external concerns.

**Key Characteristics & Layers (Conceptual):**
    - **Entities:** Represent the core business objects and rules, independent of any application-specific logic. These now include `School` as a central tenant entity.
    - **Use Cases (Interactors):** Orchestrate the flow of data to and from Entities, implementing application-specific business rules. They are independent of UI, databases, or frameworks. For multi-tenancy, use cases must operate within the context of a specific `schoolId` or be explicitly designed for global (cross-tenant) operations (e.g., for a `SUPER_ADMIN`).
    - **Interface Adapters:** Convert data from the format most convenient for Use Cases and Entities to the format most convenient for external agencies like the Database, Web, or UI. This layer includes Presenters, Controllers, and Gateways (Repositories). Controllers are responsible for extracting `schoolId` from the authenticated user's context (e.g., JWT) and passing it to application services.
- **Frameworks & Drivers:** The outermost layer, generally composed of frameworks and tools such as the Web Framework (e.g., NestJS, Next.js), Database (e.g., PostgreSQL), UI Frameworks, etc. These are details that should not penetrate inwards.

The fundamental rule is the **Dependency Rule**: source code dependencies can only point inwards. Nothing in an inner circle can know anything at all about something in an outer circle.

### 2.2. Domain-Driven Design (DDD)

**Goal:** To create a rich understanding of the business domain and embed this understanding into the software. DDD focuses on modeling the software to match the domain, using a common language (Ubiquitous Language) shared by developers and domain experts.

**Key Concepts (to consider and apply as appropriate):**
- **Ubiquitous Language:** A shared language developed by the team (developers, domain experts, stakeholders) to describe the domain. This language should be used in all communication and in the code.
- **Entities:** Objects that have a distinct identity that runs through time and different states (e.g., Student, Course).
- **Value Objects:** Objects that describe characteristics of a thing and have no conceptual identity (e.g., Address, DateRange). They are immutable.
- **Aggregates:** A cluster of associated domain objects (Entities and Value Objects) that are treated as a single unit for data changes. An Aggregate has a root Entity (Aggregate Root) and a boundary.
- **Repositories:** Provide an abstraction for accessing and persisting Aggregates, decoupling the domain layer from data storage mechanisms.
- **Domain Services:** Operations or logic that don't naturally fit within an Entity or Value Object. They encapsulate domain logic that involves multiple domain objects.
- **Bounded Contexts:** A central pattern in DDD, defining the explicit boundary within which a domain model exists and is consistent. Different models may apply in different bounded contexts. (This concept becomes particularly critical when considering a future evolution towards microservices, as it helps define service boundaries).

### 2.3. Multi-Tenancy Architecture (SaaS)

To support multiple schools as distinct tenants within the system (SaaS model), the following architectural considerations are key:

- **Tenant Identification:** Each school is a tenant, identified by a unique `schoolId` (primary key of the `School` entity).
- **Data Isolation Strategy:** A shared database, shared schema approach is used. Data is isolated by a `schoolId` discriminator column present in all tenant-specific tables (e.g., `Users`, `Students`, `Classes`, `Subjects`). Application logic in services must ensure all database queries are filtered by the current tenant's `schoolId`.
    - Global data (e.g., system settings, `SUPER_ADMIN` users not tied to a specific school) will have a `NULL` `schoolId`.
- **Tenant Context Propagation:** The active `schoolId` for a logged-in user is included in their JWT payload. This context is used by the backend to scope data access.
- **User Roles and Tenancy:**
    - `SUPER_ADMIN`: Global role for managing schools and system-wide configurations. Operates outside the scope of a single school or can target specific schools for administrative actions.
    - `ADMIN`: School-specific administrator. Their operations are confined to the data of their assigned school.
    - Other roles (Teacher, Student, etc.) are inherently scoped to their respective school via their association with a `User` record that has a `schoolId`.
- **Tenant Resolution:**
    - During login, users associated with a specific school may need to provide a `schoolIdentifier` (e.g., a unique domain or code associated with their `School` entity) if their username/email is not globally unique.
    - Global users (like `SUPER_ADMIN`) log in without a `schoolIdentifier`.
- **Onboarding New Tenants:** A process (likely administrative, initiated by a `SUPER_ADMIN`) is required to create new `School` entities and provision their initial school `ADMIN` user.

## 3. Frontend Philosophy

Our frontend development is driven by a user-first approach, aiming for highly usable and aesthetically pleasing interfaces. The goal is to create an experience that feels intuitive, responsive, and empowering for our users.

Key aspects include:
- **User-First Approach:** Design and development decisions must prioritize the user's needs, intuitive navigation, and overall experience (UX). Regular consideration of user feedback and usability testing (when possible) is encouraged.
- **Component Design: Sleek, Flat, Elegant, Minimalist**
    - **Minimalism:** Strive for simplicity. Avoid unnecessary clutter, visual noise, and excessive decoration. Every element should serve a purpose.
    - **Flat Design:** Utilize a two-dimensional style that avoids skeuomorphism. Focus on clear typography, solid colors, and crisp lines. Shadows and subtle gradients can be used sparingly for depth if they enhance usability.
    - **Elegance:** Aim for a refined and sophisticated aesthetic. This is achieved through careful attention to typography, spacing, color palettes, and overall visual harmony.
    - **Clarity:** Components should clearly communicate their function and state. Users should be able to understand how to interact with them without ambiguity.
    - **Consistency:** Maintain a consistent design language across all components and views to ensure a cohesive user experience. Re-use existing components and styles where possible.
- **User-Friendliness & Accessibility:**
    - **Intuitive Interfaces:** Design interfaces that are easy to learn and navigate. Follow established UI patterns where appropriate.
    - **Responsiveness:** Ensure the application adapts gracefully to various screen sizes and devices.
    - **Performance:** Optimize for fast load times and smooth interactions.
    - **Accessibility (A11y):** Strive to meet WCAG (Web Content Accessibility Guidelines) standards. This includes considerations for keyboard navigation, screen reader compatibility, sufficient color contrast, and clear labeling.

## 4. Backend Philosophy

Our backend development follows an API-first approach, ensuring that our APIs are robust, reliable, and easy for client applications to consume.

Key aspects include:
- **API-First Design:** Backend services are designed around their API contract. The API is treated as a primary product, defined and documented before or in parallel with the implementation.
    - **Well-defined Contracts:** Utilize tools like OpenAPI (Swagger) for defining and documenting API contracts. This ensures clarity for both frontend developers and other potential API consumers. (Consider adopting this formally if not already in place).
    - **Data Validation:** Rigorous validation of all incoming data at the API boundary is crucial.
- **Statelessness:** APIs should be stateless wherever possible. Each request from a client should contain all the information needed to process the request, without relying on server-side session state. This improves scalability and resilience.
- **Versioning:** Implement a clear API versioning strategy (e.g., URI versioning like `/v1/students` or header-based versioning) to manage changes and deprecations without breaking existing clients.
- **Security:** Prioritize security in API design and implementation. Follow best practices for authentication, authorization, data protection, and threat mitigation (e.g., OWASP Top 10).
- **Performance & Scalability:** Design APIs to be performant and scalable. Consider caching strategies, efficient database queries, and asynchronous processing for long-running tasks.

## 5. Future Vision: Towards Microservices and Micro-Frontends

As the School Management System grows in complexity and scale, our long-term architectural vision is to evolve towards a more distributed architecture, potentially incorporating:

- **Microservices:** Decomposing the backend monolith into smaller, independent services, each responsible for a specific business capability.
    - **Benefits:** Improved scalability, fault isolation, technology diversity, independent deployments, and smaller, more focused teams.
    - **Considerations:** This requires careful planning around service boundaries (aligned with Bounded Contexts from DDD), inter-service communication, data consistency, and operational complexity.

- **Micro-Frontends:** Extending the microservice concept to the frontend, breaking down large frontend monoliths into smaller, more manageable, and independently deployable pieces.
    - **Benefits:** Allows teams to develop, test, and deploy their frontend components autonomously. Facilitates technology diversity and easier scaling of frontend development.
    - **Considerations:** Requires strategies for composition, routing, shared component libraries, and maintaining a consistent user experience.

This evolution will be gradual and driven by clear needs and benefits, always weighing the advantages against the increased operational overhead and complexity.

## 6. DevOps Culture and CI/CD

We aim to foster a strong DevOps culture, emphasizing collaboration, automation, and continuous improvement.

- **Continuous Integration/Continuous Delivery (CI/CD):**
    - **Goal:** To automate the build, test, and deployment processes, enabling faster and more reliable delivery of value.
    - **Implementation:** We will establish (or enhance existing) CI/CD pipelines that automatically:
        - Run linters and code style checks.
        - Execute unit, integration, and end-to-end tests.
        - Build application artifacts (e.g., Docker images).
        - Deploy to various environments (development, staging, production) with appropriate approvals.
    - **Benefits:** Reduced manual effort, earlier detection of bugs, consistent deployments, and faster feedback loops.

- **Infrastructure as Code (IaC):** Managing and provisioning infrastructure through code (e.g., using tools like Terraform or CloudFormation) is encouraged to ensure consistency, repeatability, and version control of environments.

- **Monitoring and Logging:** Comprehensive monitoring and logging are essential for understanding system behavior, diagnosing issues, and ensuring reliability.

## 7. Key Insights from Product Requirements Document (PRD)

*(This section is a placeholder to integrate specific principles, constraints, or goals outlined in the "School Management System PRD.pdf". As the AI assistant drafting this document does not have direct access to the PRD, project stakeholders familiar with the PRD should contribute to this section.)*

Please consider adding details from the PRD related to:

- **Core Business Goals:** What are the overarching business objectives the School Management System aims to achieve?
- **Target Audience & User Personas:** Who are the primary users, and what are their key needs and expectations?
- **Non-Functional Requirements:** Are there specific performance, scalability, security, or usability requirements from the PRD that should guide development?
- **Key Features & Scope:** Are there any high-level feature descriptions or scope limitations in the PRD that have architectural implications?
- **Success Metrics:** How will the success of the project be measured according to the PRD?
- **Any other critical information:** Any other guiding principles or constraints from the PRD that developers should be aware of.

Incorporating these insights will ensure that our development practices and architectural choices are directly aligned with the product vision.
