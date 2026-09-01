# ─────────────────────────────────────────────────────────────
# Stage 1: builder
# Install ALL dependencies and compile TypeScript
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

# Install build tools needed for native addons (bcrypt, etc.)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy manifests first for layer-cache efficiency
COPY package*.json ./
COPY prisma ./prisma/

# Install all deps (including devDependencies for the build step)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source and compile
COPY . .
RUN npm run build


# ─────────────────────────────────────────────────────────────
# Stage 2: runner
# Copy only what is needed at runtime (no devDependencies, no src)
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

# Install curl for the healthcheck used in docker-compose
RUN apk add --no-cache curl

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy manifests and install PRODUCTION deps only
COPY --chown=appuser:appgroup package*.json ./
RUN npm ci --omit=dev

# Copy Prisma schema + generated client from builder
COPY --chown=appuser:appgroup --from=builder /app/prisma ./prisma
COPY --chown=appuser:appgroup --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --chown=appuser:appgroup --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy compiled output
COPY --chown=appuser:appgroup --from=builder /app/dist ./dist

# Switch to non-root user
USER appuser

EXPOSE 3000

# Healthcheck (mirrors docker-compose check)
HEALTHCHECK --interval=15s --timeout=10s --start-period=30s --retries=5 \
    CMD curl -f http://localhost:3000/api/v1/health || exit 1

CMD ["node", "dist/main"]
