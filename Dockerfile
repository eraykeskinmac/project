FROM node:18-alpine

WORKDIR /usr/src/app

# Install dependencies and create logs directory
RUN apk add --no-cache openssl && \
    mkdir -p /usr/src/app/logs && \
    chmod 777 /usr/src/app/logs

# Generate JWT secret
RUN JWT_SECRET=$(openssl rand -hex 32)
ENV JWT_SECRET=$JWT_SECRET

# Install global packages
RUN npm install -g @nestjs/cli

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy source files
COPY . .

# Display current directory contents for debugging
RUN ls -la

# Build the application and display result
RUN npm run build && ls -la dist/

# Remove dev dependencies
RUN npm prune --production

EXPOSE 3000

# Start production server
CMD ["node", "dist/main.js"]