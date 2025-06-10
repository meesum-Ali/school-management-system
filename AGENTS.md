# AI Agent Contribution Guidelines

This repository contains a Next.js frontend and a NestJS backend written in TypeScript. The product goals and requirements are described in `School Management System PRD.pdf`.

## General Principles
- Follow the architectural and coding conventions outlined in `DevelopmentGuidelines.md` and `CONTRIBUTING.md`.
- Keep code modular and well documented. Prefer descriptive names and TypeScript types.
- Ensure all changes include relevant tests when possible.

## Programmatic Checks
Run the following before committing:

```bash
# Backend
cd backend
npm install
npm run lint
npm test
cd ..

# Frontend
cd frontend
npm install
npm run lint
cd ..
```

## Pull Requests
- Use clear commit messages explaining the intent of the change.
- Update documentation when behaviour changes.
- Ensure PRs pass the checks above.
