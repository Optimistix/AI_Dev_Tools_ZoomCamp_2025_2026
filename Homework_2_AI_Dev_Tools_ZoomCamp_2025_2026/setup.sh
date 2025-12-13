#!/bin/bash

echo "🚀 Setting up Online Coding Interview Platform..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Install all dependencies
echo "📦 Installing all dependencies..."
npm run install:all

if [ $? -eq 0 ]; then
    echo ""
    echo "✨ Setup complete!"
    echo ""
    echo "To start the application, run:"
    echo ""
    echo "   npm run dev"
    echo ""
    echo "This will start both backend and frontend servers."
    echo "Then open http://localhost:3000 in your browser"
    echo ""
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

