# ─── Image Debian slim — compatible Prisma sans OpenSSL manuel ────────────
FROM node:20-slim

# Installer OpenSSL + postgresql-client
RUN apt-get update -y && \
    apt-get install -y openssl postgresql-client && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .
RUN npx prisma generate

EXPOSE 5000

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]