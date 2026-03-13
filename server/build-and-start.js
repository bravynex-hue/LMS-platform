const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting build process...');

try {
  // Run pre-build cleanup to remove problematic directories
  console.log('🔧 Running pre-build cleanup...');
  const buildScriptPath = path.join(__dirname, '..', 'build-script.js');
  if (fs.existsSync(buildScriptPath)) {
    execSync(`node ${buildScriptPath}`, { stdio: 'inherit' });
  }

  // Check if we're in production or if NODE_ENV is not set (default to production for deployment)
  const isProduction = process.env.NODE_ENV === 'production' || !process.env.NODE_ENV;
  
  if (isProduction) {
    console.log('📦 Building client for production...');
    
    // Change to client directory and build
    const clientDir = path.join(__dirname, '..', 'client');
    
    // Check if client directory exists
    if (!fs.existsSync(clientDir)) {
      console.error('❌ Client directory not found at:', clientDir);
      process.exit(1);
    }
    
    // Install client dependencies if node_modules doesn't exist
    const clientNodeModules = path.join(clientDir, 'node_modules');
    if (!fs.existsSync(clientNodeModules)) {
      console.log('📥 Installing client dependencies...');
      execSync('npm install', { cwd: clientDir, stdio: 'inherit' });
    }
    
    // Build the client
    console.log('🔨 Building React app...');
    execSync('npm run build', { cwd: clientDir, stdio: 'inherit' });
    
    // Verify build output
    const distPath = path.join(clientDir, 'dist');
    const indexPath = path.join(distPath, 'index.html');
    
    if (!fs.existsSync(indexPath)) {
      console.error('❌ Build failed - index.html not found at:', indexPath);
      process.exit(1);
    }
    
    console.log('✅ Client build completed successfully');
  } else {
    console.log('🔧 Development mode - skipping client build');
  }
  
  // Start the server
  console.log('🚀 Starting server...');
  require('./server.js');
  
} catch (error) {
  console.error('❌ Build process failed:', error.message);
  process.exit(1);
}
