#!/bin/bash

# Package Management Cleanup Script
echo "🧹 Cleaning up package management issues..."

# Check current setup
echo "📋 Current package management setup:"
echo "   Root project: npm (package-lock.json found)"
echo "   CMS project: pnpm (pnpm-lock.yaml found)"

# Option 1: Convert root to pnpm (recommended)
read -p "🔄 Convert root project to pnpm? This will remove package-lock.json (y/n): " convert_to_pnpm

if [ "$convert_to_pnpm" = "y" ] || [ "$convert_to_pnpm" = "Y" ]; then
    echo "📦 Converting root project to pnpm..."
    
    # Remove npm lockfile
    rm -f package-lock.json
    echo "✅ Removed package-lock.json"
    
    # Install with pnpm
    pnpm install
    echo "✅ Installed dependencies with pnpm"
    
    # Update package.json scripts if needed
    echo "🔧 You may need to update your deployment scripts to use 'pnpm' instead of 'npm'"
    
else
    echo "⚠️  Keeping npm for root project"
    echo "   Note: You may see lockfile warnings in CMS builds"
fi

# Update browserslist database
echo "🌐 Updating browserslist database..."
if command -v npx >/dev/null 2>&1; then
    npx update-browserslist-db@latest
    echo "✅ Updated browserslist database"
else
    echo "⚠️  npx not found, skipping browserslist update"
fi

# Update dev script if converted to pnpm
if [ "$convert_to_pnpm" = "y" ] || [ "$convert_to_pnpm" = "Y" ]; then
    echo "🔧 Updating development script for pnpm..."
    sed -i.bak 's/npm run dev/pnpm dev/g' dev.sh
    rm -f dev.sh.bak
    echo "✅ Updated dev.sh to use pnpm"
fi

echo "✨ Package management cleanup completed!"
echo ""
echo "📋 Summary:"
echo "   - CMS uses pnpm (recommended)"
if [ "$convert_to_pnpm" = "y" ] || [ "$convert_to_pnpm" = "Y" ]; then
    echo "   - Root now uses pnpm (consistent)"
    echo "   - Run 'pnpm dev' for frontend"
else
    echo "   - Root still uses npm"
    echo "   - Run 'npm run dev' for frontend"
fi
echo "   - Run 'cd cms && pnpm dev' for CMS"