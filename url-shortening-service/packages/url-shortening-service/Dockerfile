# Base
FROM node:24.11-bookworm AS base

WORKDIR /app

# Stage 1: Build the application
FROM base AS builder

# Copy package.json and package-lock.json (or yarn.lock) to leverage Docker cache
COPY package*.json ./
RUN npm install

# Copy the entire source code
COPY . .

# Compile TypeScript
RUN npm run build

# Stage 2: Create the production image
FROM base

# Set as production
ENV NODE_ENV=production

# Copy only the compiled output and node_modules from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# Install production dependencies
RUN npm install --omit=dev

# Expose the port your application listens on
EXPOSE 3000

# Define the command to run your application
CMD ["node", "dist/index.js"]
