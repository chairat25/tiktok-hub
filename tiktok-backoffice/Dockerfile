FROM node:20-alpine

WORKDIR /app

# Copy root monorepo files for Yarn Workspaces
COPY package.json yarn.lock* .pnp.cjs* .pnp.loader.mjs* ./
COPY .yarn ./.yarn

# Copy shared packages and backoffice application
COPY packages ./packages
COPY tiktok-backoffice ./tiktok-backoffice

# Install dependencies within the container
RUN corepack enable && yarn install

ENV PORT=3001
EXPOSE 3001

CMD ["yarn", "dev:backoffice"]
