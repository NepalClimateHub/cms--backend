# Development Dockerfile
FROM node:24.2.0-bookworm-slim

# Install additional tools for development
RUN apt-get update && apt-get install -y \
  vim \
  curl \
  wget \
  git \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0 COREPACK_ENABLE_AUTO_PIN=0
WORKDIR /usr/src/app

# Copy and install dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN corepack enable && pnpm install --frozen-lockfile

# Copy the rest of the application files
COPY . .

# Set the environment variables
ARG APP_ENV=development
ENV NODE_ENV=${APP_ENV}

# Expose the application port
EXPOSE 3000

# Run in watch mode
CMD ["pnpm", "dev"]
