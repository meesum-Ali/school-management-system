# Zitadel Setup Guide

This guide covers the minimal configuration required to run Zitadel locally with Docker and connect the School Management System to it. For production deployments consult the [official Zitadel documentation](https://zitadel.com/docs).

## 1. Start Zitadel Locally

```bash
docker-compose up -d db zitadel
```

The compose file in the repository exposes Zitadel at http://localhost:8888 with the default seed user `admin` / `Password1!`.

## 2. First-Time Console Login

1. Navigate to http://localhost:8888/ui/console.
2. Sign in with `admin` / `Password1!`.
3. Force a password change and store it securely.

## 3. Create a Project and Application

1. In the Zitadel console create a project (e.g. `school-management`).
2. Add an **OIDC application**:
   - Redirect URIs: `http://localhost:3000/auth/callback` (and any other environments).
   - Post Logout Redirect URI: `http://localhost:3000/`.
   - Grant Types: Authorization Code + PKCE.
   - Response Types: Code.
   - Authentication Method: `none` (PKCE).
3. Note the generated **Client ID**.

## 4. Configure Roles

1. In the same project define the roles we use in the application:
   - `SUPER_ADMIN`
   - `SCHOOL_ADMIN`
   - `TEACHER`
   - `STUDENT`
2. Assign the appropriate role(s) to each user or service account you create.

### Automate via API token (PAT or Service User) (optional)

You can automate project role creation using either a Personal Access Token (PAT) or an OAuth2 access token obtained with a Service User (client credentials). If you don’t see “Personal Access Tokens” in your Console, use the Service User method.

1) Get your Project ID (Console → Your Project → Details → ID).

2) Choose a token method:

   - PAT (if enabled in your instance): Create a PAT in the Console (User Menu → Personal Access Tokens) with permissions to manage the project.

   - Service User (recommended for automation):
      - Create a Service User in your organization.
      - Create an OIDC application (type: API) that uses client secret authentication.
      - Assign the Service User as a project member with sufficient permissions (e.g., Project Owner/Admin) so it can manage roles.
      - Fetch an access token via client credentials:

      ```bash
      # Example scopes; consult your Zitadel version docs for the exact role management scope
      export ZITADEL_ISSUER=http://localhost
      export ZITADEL_CLIENT_ID=<api-client-id>
      export ZITADEL_CLIENT_SECRET=<api-client-secret>
      export ZITADEL_SCOPES="openid profile email"  # plus role-management scopes for your version

      TOKEN=$(./utils/zitadel/fetch-token-client-credentials.sh)
      ```

3) Run the role creation script (from repo root):

```bash
export ZITADEL_ISSUER=http://localhost
export ZITADEL_PROJECT_ID=<your-project-id>

# Use one of the following depending on your method
export ZITADEL_PAT=<your-personal-access-token>
# or
export ZITADEL_TOKEN="$TOKEN"   # token obtained via client credentials

# If your Zitadel version exposes a different prefix, override:
# export ZITADEL_API_PREFIX=/v2/management

./utils/zitadel/create-roles.sh
```

This script ensures the following roles exist in the project: `SUPER_ADMIN`, `SCHOOL_ADMIN`, `TEACHER`, `STUDENT`, and `GUARDIAN`.
If a role already exists, it will be skipped. If you see 404 for the endpoint, try changing `ZITADEL_API_PREFIX` as indicated above and consult your Zitadel version docs. If the request is unauthorized, adjust the scopes and permissions of your Service User/application accordingly.

## 5. Create an Organisation per School

- Zitadel organisations map to schools/tenants in the application.
- When you create a new school in the backend, also create a Zitadel organisation and invite the initial users there.
- Capture the organisation ID (`urn:zitadel:iam:org:id` claim) if you need to seed bootstrap data.

## 6. Wire Environment Variables

Update both backend and frontend `.env` files with the values retrieved above:

```env
# Backend
ZITADEL_ISSUER=http://localhost:8888
ZITADEL_CLIENT_ID=<client-id>
ZITADEL_JWKS_URI=http://localhost:8888/oauth/v2/keys

# Frontend
NEXT_PUBLIC_ZITADEL_ISSUER=http://localhost:8888
NEXT_PUBLIC_ZITADEL_CLIENT_ID=<client-id>
NEXT_PUBLIC_ZITADEL_REDIRECT_URI=http://localhost:3000/auth/callback
```

For production provide the hosted URLs, secrets, and PKCE configuration that match your deployment.

## 7. Seed Users (Optional)

To speed up local development you can invite users directly from the Zitadel console, or use the Zetadel CLI:

```bash
zitadel login --issuer http://localhost:8888 --client-id <client-id>
zitadel users add --org <organization-id> --username teacher1 --password <password> \
  --project-role school-management:SCHOOL_ADMIN
```

## 8. Validate the Integration

- Hit `http://localhost:3000/admin` and ensure the proxy redirects you to Zitadel for login.
- Confirm the backend accepts the issued token and returns data for the tenant linked to the organisation.
- Check application logs for any JWKS or issuer mismatch warnings.

Once these steps succeed you are ready to use Zitadel as the identity provider for both local development and higher environments.
