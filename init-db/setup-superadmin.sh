#!/bin/bash

# Exit on error
set -e

# Default values
export SUPERADMIN_USERNAME=${SUPERADMIN_USERNAME:-meesum}
export SUPERADMIN_EMAIL=${SUPERADMIN_EMAIL:-meesum@example.com}

# Source the .env file if it exists
if [ -f ../.env ]; then
  echo "Sourcing .env file..."
  export $(grep -v '^#' ../.env | xargs)
fi

# Generate a random password if not set
if [ -z "$SUPERADMIN_PASSWORD" ]; then
  echo "SUPERADMIN_PASSWORD not set in .env, using default"
  export SUPERADMIN_PASSWORD="ChangeMe123!"
fi

# Install bcrypt if not already installed
if ! npm list bcrypt 2>&1 | grep -q bcrypt; then
  echo "Installing bcrypt..."
  npm install bcrypt
fi

# Generate hashed password
echo "Generating hashed password..."
HASHED_PASSWORD=$(node -e "
  const bcrypt = require('bcrypt');
  const saltRounds = 10;
  const hash = bcrypt.hashSync(process.env.SUPERADMIN_PASSWORD, saltRounds);
  console.log(hash);
" | tr -d '\n')

echo "Hashed password: $HASHED_PASSWORD"

# Create a temporary SQL file with the hashed password
echo "Creating SQL script with hashed password..."
SQL_FILE="/Users/syedmeesumali/Development/school-management-system/init-db/02-create-super-admin.sql"

echo "-- This script creates a super admin user" > "$SQL_FILE"
echo "-- Auto-generated by setup-superadmin.sh" >> "$SQL_FILE"
echo "" >> "$SQL_FILE"
echo "DO \$\$
BEGIN" >> "$SQL_FILE"
echo "  IF NOT EXISTS (SELECT 1 FROM users WHERE username = '$SUPERADMIN_USERNAME') THEN" >> "$SQL_FILE"
echo "    INSERT INTO users (" >> "$SQL_FILE"
echo "      id," >> "$SQL_FILE"
echo "      username," >> "$SQL_FILE"
echo "      email," >> "$SQL_FILE"
echo "      password," >> "$SQL_FILE"
echo "      \"firstName\"," >> "$SQL_FILE"
echo "      \"lastName\"," >> "$SQL_FILE"
echo "      roles," >> "$SQL_FILE"
echo "      \"isActive\"," >> "$SQL_FILE"
echo "      \"createdAt\"," >> "$SQL_FILE"
echo "      \"updatedAt\"" >> "$SQL_FILE"
echo "    ) VALUES (" >> "$SQL_FILE"
echo "      gen_random_uuid()," >> "$SQL_FILE"
echo "      '$SUPERADMIN_USERNAME'," >> "$SQL_FILE"
echo "      '$SUPERADMIN_EMAIL'," >> "$SQL_FILE"
echo "      '$HASHED_PASSWORD'," >> "$SQL_FILE"
echo "      'Super'," >> "$SQL_FILE"
echo "      'Admin'," >> "$SQL_FILE"
echo "      ARRAY['super_admin']::varchar[]," >> "$SQL_FILE"
echo "      true," >> "$SQL_FILE"
echo "      NOW()," >> "$SQL_FILE"
echo "      NOW()" >> "$SQL_FILE"
echo "    );" >> "$SQL_FILE"
echo "    RAISE NOTICE 'Super admin user created: %', '$SUPERADMIN_USERNAME';" >> "$SQL_FILE"
echo "  ELSE" >> "$SQL_FILE"
echo "    UPDATE users" >> "$SQL_FILE"
echo "    SET" >> "$SQL_FILE"
echo "      email = '$SUPERADMIN_EMAIL'," >> "$SQL_FILE"
echo "      password = '$HASHED_PASSWORD'," >> "$SQL_FILE"
echo "      roles = ARRAY['super_admin']::varchar[]," >> "$SQL_FILE"
echo "      \"isActive\" = true," >> "$SQL_FILE"
echo "      \"updatedAt\" = NOW()" >> "$SQL_FILE"
echo "    WHERE username = '$SUPERADMIN_USERNAME';" >> "$SQL_FILE"
echo "    RAISE NOTICE 'Super admin user updated: %', '$SUPERADMIN_USERNAME';" >> "$SQL_FILE"
echo "  END IF;" >> "$SQL_FILE"
echo "END \$\$;" >> "$SQL_FILE"

echo ""
echo "Setup complete. You can now rebuild and restart your services."
echo "The super admin credentials will be:"
echo "Username: $SUPERADMIN_USERNAME"
echo "Password: $SUPERADMIN_PASSWORD"
echo ""
echo "To apply these changes, run:"
echo "docker compose down && docker compose up --build -d"
