# Frontend Application (Next.js + React + TypeScript)

This project is a modern frontend application built with [Next.js](https://nextjs.org/), [React](https://reactjs.org/), and [TypeScript](https://www.typescriptlang.org/), using the Pages Router for SSR-first architecture.

## Architecture

- **Framework**: Next.js 14 (Pages Router)
- **Rendering Strategy**: Server-Side Rendering (SSR) by default
- **Authentication**: Cookie + localStorage-based JWT with middleware protection
- **Styling**: Tailwind CSS + Material-UI (MUI)
- **State Management**: React Context API

## Getting Started

To get the development server running:

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The application uses Next.js file-based routing. Pages are located in the `pages/` directory:
- `pages/index.tsx` - Home page (redirects to login)
- `pages/login.tsx` - Login page
- `pages/admin/*` - Protected admin pages (requires authentication)

## Available Scripts

In the `frontend` directory, you can run the following scripts:

*   `npm run dev`: Runs the app in development mode with hot-reloading on port 3000.
*   `npm run build`: Builds the app for production to the `.next` folder.
*   `npm start`: Starts the production server (requires `npm run build` first).
*   `npm run lint`: Lints the codebase using ESLint (Next.js config).

## SSR Architecture

### Server-Side Rendering
All pages use SSR by default via `getServerSideProps`. This means:
- Initial page load is server-rendered for better SEO and performance
- Authentication checks happen on the server
- Data fetching can occur server-side before rendering

### Middleware Authentication
The `middleware.ts` file protects all `/admin/*` routes:
- Validates JWT tokens from cookies
- Checks user roles (SUPER_ADMIN or SCHOOL_ADMIN)
- Redirects unauthorized users to `/login` or `/unauthorized`

### When to Use CSR
Use client-side rendering only for:
- Highly interactive widgets that don't affect SEO
- Real-time data updates
- User-specific dynamic content after initial load

## Project Structure

```
frontend/
├── pages/              # Next.js pages (file-based routing)
│   ├── _app.tsx       # App wrapper with providers
│   ├── _document.tsx  # Document wrapper for MUI SSR
│   ├── index.tsx      # Home page
│   ├── login.tsx      # Login page
│   └── admin/         # Protected admin pages
├── components/         # React components
├── contexts/          # React Context providers (Auth, etc.)
├── lib/               # Utility libraries
├── pages/             # Next.js pages
├── providers/         # Theme and other providers
├── public/            # Static assets
├── styles/            # Global styles and Tailwind
├── types/             # TypeScript type definitions
├── utils/             # Utility functions (API client, etc.)
└── middleware.ts      # Next.js middleware for auth
```

## Learn More

To learn more about the technologies used, check out the following resources:

*   [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API.
*   [Next.js Pages Router](https://nextjs.org/docs/pages) - File-based routing and SSR patterns.
*   [React Documentation](https://reactjs.org/docs/getting-started.html) - Get started with React.
*   [TypeScript Documentation](https://www.typescriptlang.org/docs/) - Understand TypeScript.
*   [Material-UI Documentation](https://mui.com/getting-started/installation/) - For UI components.
*   [Tailwind CSS Documentation](https://tailwindcss.com/docs/) - For utility-first CSS.
*   [ESLint Documentation](https://eslint.org/docs/user-guide/getting-started) - For linting.

## Deployment

The Next.js app can be deployed to Vercel, AWS, or any platform that supports Node.js:

```bash
npm run build
npm start
```

Or deploy directly to Vercel:
```bash
npx vercel
```
