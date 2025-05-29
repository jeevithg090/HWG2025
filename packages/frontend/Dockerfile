# Stage 1: Build the application
FROM node:20-alpine AS builder

# Install dependencies only when needed
WORKDIR /app
COPY package.json package-lock.json ./
# You might need to add other lock files like yarn.lock or pnpm-lock.yaml if you use them.
# For npm, package-lock.json is sufficient.

# Install dependencies 
RUN npm i --legacy-peer-deps

# Copy the rest of your application code
COPY . .

# Build the Next.js application
# `output: "standalone"` in next.config.js is highly recommended for Docker
# It creates a self-contained folder with only necessary files.
RUN npm run build

# Stage 2: Create the production image
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV production

# Disable Next.js telemetry (optional, but good for production builds)
ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user and group for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy the standalone output from the builder stage
# This assumes you have `output: 'standalone'` in your next.config.js
# If not, you'll need to copy the entire .next folder and public folder.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static


# Expose the port Next.js runs on
EXPOSE 3000

# Start the Next.js application
CMD ["node", "server.js"]