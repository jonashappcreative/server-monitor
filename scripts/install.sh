#!/bin/bash
set -e

echo "=== Server Monitor — Install ==="

# Check dependencies
command -v docker >/dev/null 2>&1 || { echo "Docker not found. Please install Docker first."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "Node.js not found. Please install Node.js 14+."; exit 1; }

# Install npm dependencies
echo "Installing dependencies..."
npm install

echo ""
echo "Done! Start the server with:"
echo "  node server.js"
echo ""
echo "Or with Docker:"
echo "  docker-compose up -d"
