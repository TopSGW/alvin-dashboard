#!/bin/bash

# Exit on error
set -e

# Print commands before executing
set -x

# Navigate to the project directory
cd "$(dirname "$0")"

# Install dependencies
npm install

# Build the project
npm run build

# Start or restart the PM2 process
pm2 startOrRestart ecosystem.config.js

echo "Deployment completed successfully!"