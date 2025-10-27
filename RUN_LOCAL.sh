#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                                                                      ║"
echo "║              🚀 GarBaNusa 5.0 - Local Setup                         ║"
echo "║                                                                      ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies (this may take 2-3 minutes)..."
    echo ""
    npm install
    
    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ Installation failed. Trying with --legacy-peer-deps..."
        npm install --legacy-peer-deps
    fi
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║  🎉 Setup Complete! Starting development server...                 ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo "📍 Your app will be available at: http://localhost:3000"
echo ""
echo "🎭 Demo Accounts:"
echo "   Email: rina.sari@demo.go.id"
echo "   Password: demo123"
echo ""
echo "   Email: dr.siti@demo.go.id"
echo "   Password: demo123"
echo ""
echo "⏹️  Press Ctrl+C to stop the server"
echo ""
echo "Starting in 3 seconds..."
sleep 3

npm run dev
