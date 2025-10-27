#!/bin/bash

echo "🚀 GarBaNusa - Quick Install (Optimized)"
echo ""
echo "Installing only essential dependencies..."
echo ""

# Clear any existing installations
rm -rf node_modules package-lock.json

# Install with legacy peer deps flag to avoid conflicts
npm install --legacy-peer-deps

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Installation complete!"
    echo ""
    echo "Starting development server..."
    echo "Open http://localhost:3000"
    echo ""
    npm run dev
else
    echo ""
    echo "❌ Installation failed"
    echo "Try manually: npm install --legacy-peer-deps"
fi
