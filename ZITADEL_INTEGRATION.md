# Zitadel Integration Setup Guide

## Current Status

### ✅ Working Services
- **PostgreSQL Database**: Running on port 5432
- **Zitadel**: Running on port 8888 (http://localhost:8888)
- **Frontend**: Running on port 3001 (http://localhost:3001)
- **PgAdmin**: Running on port 8080 (http://localhost:8080)

### ❌ Issues
- **Backend**: Exited due to TypeORM synchronization conflict
  - Fix: Code has been updated to disable synchronize
  - **Action Required**: Rebuild backend when network connectivity is restored
  - Command: `docker-compose up -d --build backend`

## Zitadel Configuration

Zitadel is now running successfully at http://localhost:8888

### Default Admin Credentials
- **Username**: admin
- **Password**: Password1!
- **Organization**: SMS_Organization

### Setup Steps for Zitadel OAuth

1. **Access Zitadel Console**
   - Navigate to: http://localhost:8888/ui/console
   - Login with admin credentials above

2. **Create OAuth Application**
   - Go to: Projects → Create New Project
   - Name: "School Management System"
   - Type: Web Application
   - Add these settings:
     - **Redirect URIs**: `http://localhost:3001/auth/callback`
     - **Post Logout Redirect URIs**: `http://localhost:3001/login`
     - **Grant Types**: Authorization Code, Refresh Token
     - **Response Types**: Code
     - **Auth Method**: PKCE (Proof Key for Code Exchange)

3. **Configure Application Roles**
   - Add roles in Zitadel project:
     - `SUPER_ADMIN`
     - `SCHOOL_ADMIN`
     - `TEACHER`
     - `STUDENT`

4. **Get Client ID**
   - After creating the application, copy the Client ID
   - Update `frontend/.env`:
     ```
     NEXT_PUBLIC_ZITADEL_CLIENT_ID=<your-client-id-here>
     ```

5. **Restart Frontend**
   ```bash
   docker-compose restart frontend
   ```

## Frontend Updates

### New Features
1. **Dual Authentication**:
   - Zitadel SSO button (when configured)
   - Local username/password fallback
   - Automatic detection of Zitadel availability

2. **OAuth Callback Handler**:
   - New page: `/auth/callback`
   - Handles PKCE flow
   - Secure state verification
   - Token exchange and storage

3. **Enhanced AuthContext**:
   - Exposed `loadUserFromToken` for OAuth flows
   - Supports both local and Zitadel JWT formats
   - Automatic token refresh on page reload

### Login Flow Options

#### Option 1: Zitadel SSO (When Configured)
1. User clicks "Sign in with Zitadel SSO"
2. Redirects to Zitadel login page
3. User authenticates with Zitadel
4. Redirects back to `/auth/callback`
5. Exchanges authorization code for tokens
6. Redirects to `/admin/dashboard`

#### Option 2: Local Authentication (Always Available)
1. User enters username and password
2. Optional: School identifier for multi-tenancy
3. Submits form
4. Backend validates credentials
5. Returns JWT token
6. Redirects to `/admin/dashboard`

## API Configuration

The frontend is configured to connect to:
- **Backend API**: http://localhost:5001/api
- **Zitadel**: http://localhost:8888

## Testing the Integration

### Test Zitadel Console Access
```bash
curl http://localhost:8888/.well-known/openid-configuration
```

Expected: JSON response with OpenID configuration

### Test Frontend
1. Visit: http://localhost:3001/login
2. Without Client ID: Only local login form visible
3. With Client ID: Zitadel SSO button visible above local form

### Test Local Login (When Backend is Fixed)
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

## Next Steps

1. **Wait for Network Connectivity** to rebuild backend with fixes
2. **Configure Zitadel OAuth Application** following steps above
3. **Update Frontend .env** with Client ID
4. **Test Both Authentication Methods**

## Environment Variables Summary

### Frontend (.env)
```bash
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_ZITADEL_ISSUER=http://localhost:8888
NEXT_PUBLIC_ZITADEL_CLIENT_ID=<from-zitadel-console>
NEXT_PUBLIC_ZITADEL_REDIRECT_URI=http://localhost:3001/auth/callback
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Backend (.env)
```bash
PORT=5000
DATABASE_TYPE=postgres
DATABASE_HOST=db
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=sms_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=3600s
ZITADEL_ISSUER=http://localhost:8888
ZITADEL_CLIENT_ID=<from-zitadel-console>
ZITADEL_CLIENT_SECRET=<from-zitadel-console>
```

## Security Notes

- PKCE (Proof Key for Code Exchange) is implemented for OAuth security
- State parameter used for CSRF protection
- Tokens stored in both localStorage and httpOnly cookies
- All Zitadel communication over HTTP for local development only
- **⚠️ Enable HTTPS in production**

## Troubleshooting

### Zitadel Not Starting
- Check logs: `docker logs zitadel`
- Verify masterkey is 32 characters
- Ensure database is healthy

### Backend Not Starting
- Issue: TypeORM synchronize conflict
- Solution: Rebuild with `docker-compose up -d --build backend`
- Verify synchronize is set to `false` in app.module.ts

### Frontend Can't Connect to Backend
- Verify backend is running: `docker-compose ps`
- Check API_URL in frontend/.env
- Test endpoint: `curl http://localhost:5001/api/health`

### OAuth Flow Fails
- Verify Client ID is correct
- Check redirect URI matches exactly
- Confirm application is activated in Zitadel
- Check browser console for errors
