# Codebase

Codebase is a [Next.js](https://nextjs.org/) frontend and [NestJS](https://nestjs.com/) backend application. This project serves as a School Management System, offering efficient and scalable solutions for educational institutions.

## Table of Contents

- [Features](#features)
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

- Efficient management of school operations
- Scalable architecture with Next.js and NestJS
- Dockerized for easy deployment
- TypeScript for type safety
- Environment variable management for flexibility

## Technologies Used

- [Next.js](https://nextjs.org/) - Frontend framework
- [NestJS](https://nestjs.com/) - Backend framework
- [TypeScript](https://www.typescriptlang.org/) - Programming language
- [Docker](https://www.docker.com/) - Containerization
- [pnpm](https://pnpm.io/) - Package manager

## Getting Started

### Prerequisites

- **Node.js** v14+
- **pnpm** v6+ (Install via `npm install -g pnpm`)
- **Docker** (optional, for containerization)

### Installation

1. **Clone the Repository:**

    ```bash
    git clone https://github.com/yourusername/Codebase.git
    cd Codebase
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

### Running the Application

- **Using Docker Compose:**

    Ensure Docker is installed and running.

    ```bash
    cd ..
    docker-compose up --build
    ```

- **Running Frontend and Backend Separately:**

    **Frontend:**

    ```bash
    cd frontend
    pnpm dev
    ```

    **Backend:**

    ```bash
    cd backend
    pnpm run start:dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to view the frontend and [http://localhost:5000/api](http://localhost:5000/api) for the backend API.

## Project Structure
