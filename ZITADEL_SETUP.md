# Zitadel Setup Guide

## Overview

This School Management System now uses Zitadel for authentication and authorization. Zitadel provides:
- Modern OAuth 2.0 / OIDC authentication
- Built-in multi-tenancy (Organizations)
- Fine-grained role-based access control
- Self-hosted or cloud options

## Prerequisites

- Docker and Docker Compose
- PostgreSQL database (shared with main application)

## Initial Setup

### 1. Start Zitadel Container

```bash
docker-compose up -d zitadel
```

Zitadel will be available at: `http://localhost:8888`

### 2. First-Time Login

- **Console URL**: http://localhost:8888/ui/console
- **Username**: `admin`
- **Password**: `Password1!`
- **Organization**: `SMS_Organization`

### 3. Create a New Project

1. Navigate to **Projects** in the Zitadel console
2. Click **Create New Project**
3. Name: `School Management System`
4. Click **Continue**

### 4. Create an Application

1. In your project, click **New**
2. Select **Web Application**
3. Application Name: `SMS Frontend`
4. Authentication Method: **Code** (Authorization Code Flow)
5. Redirect URIs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000`
6. Post Logout URIs:
   - `http://localhost:3000`
7. Click **Continue** and **Create**
8. **Save the Client ID and Client Secret** - you'll need these for environment variables

### 5. Configure Roles

1. In your project, navigate to **Roles**
2. Create the following roles:
   - `SUPER_ADMIN` - Full system access
   - `SCHOOL_ADMIN` - School-level administration
   - `TEACHER` - Teacher access
   - `STUDENT` - Student access

### 6. Create Organizations (Schools)

1. Navigate to **Organizations**
2. Click **Create New Organization**
3. For each school:
   - Name: School name
   - Save the Organization ID - this becomes the `schoolId`

### 7. Assign Users to Organizations

1. Navigate to the organization (school)
2. Click **Users** → **Add User**
3. Fill in user details
4. Assign appropriate project roles (e.g., `SCHOOL_ADMIN` for school administrators)

## Environment Variables

### Backend (.env)

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=sms_db

# JWT (for local fallback auth)
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=3600s

# Zitadel Configuration
ZITADEL_ISSUER=http://localhost:8888
ZITADEL_CLIENT_ID=<your-client-id>
ZITADEL_CLIENT_SECRET=<your-client-secret>
ZITADEL_REDIRECT_URI=http://localhost:3000/auth/callback
ZITADEL_POST_LOGOUT_REDIRECT_URI=http://localhost:3000
ZITADEL_SCOPE=openid profile email urn:zitadel:iam:org:project:id:zitadel:aud
ZITADEL_ORGANIZATION_ID=<optional-default-organization-id>

# Application
NODE_ENV=development
PORT=5000
API_PREFIX=/api
LOG_LEVEL=debug
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_ZITADEL_ISSUER=http://localhost:8888
NEXT_PUBLIC_ZITADEL_CLIENT_ID=<your-client-id>
```

## Authentication Flow

### Local Authentication (Fallback)

The system supports local username/password authentication as a fallback:

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "access_token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "role": "SCHOOL_ADMIN",
    "schoolId": "school-uuid"
  }
}
```

### Zitadel OAuth Flow (Recommended)

1. Frontend redirects to Zitadel login page
2. User authenticates with Zitadel
3. Zitadel redirects back with authorization code
4. Frontend exchanges code for tokens
5. Frontend stores JWT and uses for API calls
6. Backend validates JWT using Zitadel's JWKS endpoint

## API Authentication

All API requests require a Bearer token:

```
Authorization: Bearer <jwt-token>
```

The backend validates tokens using Zitadel's JWKS endpoint at:
`http://localhost:8888/oauth/v2/keys`

## Role-Based Access Control

### Role Hierarchy

- **SUPER_ADMIN**: Can manage all schools, users, and system settings
- **SCHOOL_ADMIN**: Can manage their school's data (students, teachers, classes)
- **TEACHER**: Can view and manage their classes and students
- **STUDENT**: Can view their own data and schedules

### Protected Routes

Controllers use the `@UseGuards(AuthGuard('zitadel'), RolesGuard)` decorator:

```typescript
@Controller('schools')
@UseGuards(AuthGuard('zitadel'), RolesGuard)
export class SchoolsController {
  
  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  createSchool() {
    // Only SUPER_ADMIN can create schools
  }
  
  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
  getSchool() {
    // SUPER_ADMIN or SCHOOL_ADMIN can view schools
  }
}
```

### Public Routes

Use the `@Public()` decorator for routes that don't require authentication:

```typescript
@Public()
@Post('login')
async login() {
  // No authentication required
}
```

## Multi-Tenancy

### Organization Structure

Zitadel organizations map to schools in the SMS:

- Each school is a Zitadel organization
- Users are assigned to organizations
- Organization ID is stored as `schoolId` in user profile
- Backend filters data based on user's `schoolId`

### Data Isolation

The backend ensures data isolation:

```typescript
async findAll(req: Request) {
  const user = req.user; // Set by Zitadel strategy
  if (user.role === 'SCHOOL_ADMIN') {
    // Filter by schoolId
    return this.studentsService.findAll(user.schoolId);
  } else if (user.role === 'SUPER_ADMIN') {
    // Access all data
    return this.studentsService.findAll();
  }
}
```

## Token Validation

### How it Works

1. Request arrives with `Authorization: Bearer <token>` header
2. `ZitadelStrategy` extracts token
3. Token is validated using Zitadel's JWKS endpoint
4. JWT signature is verified
5. Token expiration is checked
6. User info is extracted and attached to `req.user`:
   ```typescript
   {
     userId: string,
     email: string,
     username: string,
     roles: Record<string, any>,
     organizationId: string,
     name: string
   }
   ```
7. `RolesGuard` checks if user has required roles

## Troubleshooting

### Zitadel Container Won't Start

```bash
docker-compose logs zitadel
```

Common issues:
- Database connection failed: Check PostgreSQL is running
- Master key error: Verify `ZITADEL_MASTERKEYFROMANV` is exactly 32 characters
- Port conflict: Ensure port 8888 is not in use

### Token Validation Fails

- Check `ZITADEL_ISSUER` matches in both frontend and backend
- Verify Client ID and Secret are correct
- Ensure Redirect URIs are configured in Zitadel application
- Check token hasn't expired

### User Has No Roles

1. Go to Zitadel console
2. Navigate to your project
3. Select the user
4. Click **Authorizations**
5. Add project role grants

### Organization/School Not Showing

- Verify user is assigned to the organization in Zitadel
- Check `urn:zitadel:iam:org:id` claim in JWT token
- Ensure backend maps organization ID to schoolId

## Development Tips

### Testing with Zitadel Locally

1. Use ngrok or similar to expose local dev server:
   ```bash
   ngrok http 3000
   ```

2. Update Zitadel Redirect URIs with ngrok URL

3. Update environment variables with ngrok URL

### Inspecting JWT Tokens

Use jwt.io to decode and inspect tokens:
- Copy token from browser localStorage/cookies
- Paste into jwt.io
- Verify claims structure

### Health Check

Check if Zitadel is running:

```bash
curl http://localhost:8888/.well-known/openid-configuration
```

Should return Zitadel's OpenID configuration.

## Production Deployment

### Zitadel Cloud (Recommended)

1. Sign up at https://zitadel.com/
2. Create a new instance
3. Configure application and roles as above
4. Update environment variables with production URLs
5. Use HTTPS for all redirects

### Self-Hosted

1. Use production PostgreSQL instance
2. Configure SSL/TLS for Zitadel
3. Set strong master key (32+ random characters)
4. Enable HTTPS (required for OAuth)
5. Configure proper domain and DNS
6. Update environment variables:
   ```env
   ZITADEL_ISSUER=https://auth.yourdomain.com
   ZITADEL_EXTERNALSECURE=true
   ```

## Additional Resources

- [Zitadel Documentation](https://zitadel.com/docs)
- [Zitadel GitHub](https://github.com/zitadel/zitadel)
- [OAuth 2.0 & OIDC Spec](https://oauth.net/2/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

## Support

For issues specific to this integration:
1. Check backend logs: `docker-compose logs backend`
2. Check Zitadel logs: `docker-compose logs zitadel`
3. Verify environment variables are set correctly
4. Ensure all services are running: `docker-compose ps`

For Zitadel-specific issues, consult the [Zitadel documentation](https://zitadel.com/docs) or [community forums](https://github.com/zitadel/zitadel/discussions).
