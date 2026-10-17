FROM node:20-alpine

WORKDIR /app

# Copy root monorepo files for Yarn Workspaces
COPY package.json yarn.lock* .pnp.cjs* .pnp.loader.mjs* ./
COPY .yarn ./.yarn

# Copy shared packages and viewer application
COPY packages ./packages
COPY tiktok-viewer ./tiktok-viewer

# Install dependencies within the container
RUN corepack enable && yarn install

ENV PORT=3000
EXPOSE 3000

CMD ["yarn", "dev:viewer"]
