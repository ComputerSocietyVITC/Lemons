# Base image
FROM node:20-slim

# Install OpenSSL and other required dependencies
RUN apt-get update -y && \
    apt-get install -y openssl wget && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package.json pnpm-lock.yaml ./

# Install application dependencies
RUN pnpm install

# Copy all app files (including Prisma schema and migration files)
COPY . .

COPY init.sh .
RUN chmod +x init.sh

# Build the app (using TypeScript compiler)
RUN pnpm run build
RUN pnpm prisma generate

# Expose necessary ports
EXPOSE 3000

CMD ["./init.sh"]
