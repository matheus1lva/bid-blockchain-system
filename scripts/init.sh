#!/bin/sh

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
npx wait-on -t 30000 tcp:postgres:5432

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Migrate database
echo "Migrating database..."
npx prisma migrate deploy

# Start the application
echo "Starting the application..."
yarn dev 