FROM node:20-alpine AS base
WORKDIR /app

# Copy workspace files
COPY package.json package-lock.json* ./
COPY shared/ ./shared/
COPY backend/ ./backend/

# Install dependencies for shared and backend only
RUN npm ci --workspace=shared --workspace=backend --ignore-scripts

WORKDIR /app/backend

EXPOSE 3001

CMD ["npx", "tsx", "src/index.ts"]
