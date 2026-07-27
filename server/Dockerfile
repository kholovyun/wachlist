FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json openapi.json ./
COPY src ./src

ENV NODE_ENV=production
ENV PORT=4000
ENV WALLET_DB_PATH=/app/data/wallets.db

RUN mkdir -p /app/data

EXPOSE 4000

CMD ["npm", "run", "start"]
