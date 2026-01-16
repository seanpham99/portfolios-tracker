#!/bin/bash
set -e

# Add packageManager field for Turborepo
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.packageManager = 'pnpm@9.15.0';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"

# Build shared-types first
cd packages/shared-types
pnpm run build
cd ../..

# Build API
cd services/api
pnpm run build
cd ../..

# Build web app
cd apps/web
pnpm run build
