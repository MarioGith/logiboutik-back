FROM node:22-alpine AS base
WORKDIR /app

FROM base AS pnpm
RUN npm install -g pnpm@12.14.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Compiles TypeScript to dist/
FROM pnpm AS builder
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY tsconfig.json ./
COPY src ./src
RUN pnpm build

# Production dependencies only
FROM pnpm AS prod-deps
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Final image: compiled code + production dependencies, run by pm2
FROM base AS final
ENV NODE_ENV=production
RUN npm install -g pm2@6 && apk --no-cache -U upgrade
COPY package.json process.yml ./
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
USER node
EXPOSE 3020
ENTRYPOINT ["pm2-runtime", "./process.yml"]
