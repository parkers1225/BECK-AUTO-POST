# Dockerfile for SFTP Proxy Service
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application files
COPY sftp-proxy.js ./

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["node", "sftp-proxy.js"]
