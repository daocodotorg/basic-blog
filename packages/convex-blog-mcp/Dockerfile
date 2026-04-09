# MCP over stdio for local/Docker use (e.g. Cursor). Run with: docker run -i --rm -e CONVEX_URL=...
# Build context: this directory (packages/convex-blog-mcp).
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
COPY tsconfig.json ./
COPY src ./src
RUN npm install && npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
# No EXPOSE: stdio transport only.
CMD ["node", "dist/stdioServer.js"]
