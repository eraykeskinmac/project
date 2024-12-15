FROM node:18-alpine

WORKDIR /usr/src/app

RUN apk add --no-cache openssl && \
    mkdir -p /usr/src/app/logs && \
    chmod 777 /usr/src/app/logs

# Generate JWT secret
RUN JWT_SECRET=$(openssl rand -hex 32)
ENV JWT_SECRET=$JWT_SECRET

RUN npm install -g @nestjs/cli

COPY package*.json ./

RUN npm install

COPY . .

# Display current directory contents for debugging
RUN ls -la

RUN npm run build && ls -la dist/

# Remove dev dependencies
RUN npm prune --production

EXPOSE 3000

# Start production server
CMD ["node", "dist/main.js"]