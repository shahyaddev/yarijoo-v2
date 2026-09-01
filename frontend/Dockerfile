# ─────────────────────────────────────────────────────────────
# Stage 1: deps
# Install node_modules (cached separately from build output)
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package*.json ./
RUN npm ci


# ─────────────────────────────────────────────────────────────
# Stage 2: builder
# Compile the Next.js app with standalone output
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Bring in installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the full source tree
COPY . .

# Build args for public env vars that must be baked in at build time
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# next.config.ts must set `output: 'standalone'`
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build


# ─────────────────────────────────────────────────────────────
# Stage 3: runner
# Minimal image — only standalone server + static assets
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN apk add --no-cache curl

# Non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Standalone server
COPY --chown=appuser:appgroup --from=builder /app/.next/standalone ./
# Static assets (CSS, JS chunks, images) must be served from here
COPY --chown=appuser:appgroup --from=builder /app/.next/static ./.next/static
# Public assets (fonts, images placed in /public)
COPY --chown=appuser:appgroup --from=builder /app/public ./public

USER appuser

EXPOSE 3001

# Next.js standalone server reads PORT from env; default to 3001
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

HEALTHCHECK --interval=15s --timeout=10s --start-period=30s --retries=5 \
    CMD curl -f http://localhost:3001/ || exit 1

CMD ["node", "server.js"]
