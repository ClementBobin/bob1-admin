# syntax=docker/dockerfile:1

# ---- Base ---------------------------------------------------------------
FROM node:22-alpine AS base
# libc6-compat: needed by some native Node modules on Alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ---- Dependencies -------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

# ---- Build --------------------------------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# The API URL is NOT needed at build time: it is read at runtime from API_URL
# (see lib/runtime-env.ts), so one image works for every environment.
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---- Runtime ------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

ARG VERSION=0.0.0-dev
LABEL org.opencontainers.image.version=$VERSION

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs

# Standalone output bundles the server and only the node_modules it needs.
# (The repo has no /public folder; add a COPY for it if you create one.)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget -qO- http://127.0.0.1:3000/login >/dev/null 2>&1 || exit 1

CMD ["node", "server.js"]