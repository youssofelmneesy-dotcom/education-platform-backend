# syntax=docker/dockerfile:1

FROM node:24-bookworm-slim AS dependencies

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma

RUN npm ci
RUN npm run prisma:generate

FROM dependencies AS build

COPY tsconfig.json tsconfig.build.json ./
COPY src ./src

RUN npm run build

FROM node:24-bookworm-slim AS runtime

ENV NODE_ENV=production

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma

RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=dependencies /app/node_modules/prisma ./node_modules/prisma
COPY --from=dependencies /app/node_modules/.bin/prisma ./node_modules/.bin/prisma

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/live').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "dist/server.js"]
