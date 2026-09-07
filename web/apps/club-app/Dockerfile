# Build context is the pnpm workspace root: web/
FROM node:24-alpine AS build
RUN corepack enable
WORKDIR /repo
ENV CI=true

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/ui/package.json packages/ui/
COPY apps/website/package.json apps/website/
COPY apps/club-app/package.json apps/club-app/
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm --filter @furria/club-app build

FROM nginx:1.27-alpine AS runtime
ENV API_UPSTREAM=api:8080
COPY --from=build /repo/apps/club-app/dist /usr/share/nginx/html
COPY apps/club-app/deploy/default.conf.template /etc/nginx/templates/default.conf.template
COPY --chmod=0755 apps/club-app/deploy/40-runtime-config.sh /docker-entrypoint.d/40-runtime-config.sh
EXPOSE 80
