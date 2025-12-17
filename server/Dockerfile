# Use Node.js 20 LTS (Alpine for smaller image size)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install production dependencies only
# Copy package files first to leverage Docker cache
COPY package.json package-lock.json ./

# Install dependencies (ci ensures exact versions from lockfile)
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Expose the backend port
EXPOSE 5000

# Use a non-root user for security
USER node

# Start the server directly (bypassing the custom build script which is for dev/monolithic)
CMD ["node", "server.js"]
