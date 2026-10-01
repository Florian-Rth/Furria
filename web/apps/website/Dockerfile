# Build context is the pnpm workspace root: web/
FROM node:24.21-alpine AS build
RUN corepack enable
WORKDIR /repo

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/website/package.json apps/website/
COPY packages/ui/package.json packages/ui/
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm --filter @furria/website build

FROM nginx:1.27-alpine AS runtime
ENV API_UPSTREAM=api:8080
ENV ANDROID_PACKAGE_NAME=de.furria.club
ENV ANDROID_CERT_FINGERPRINTS=
COPY --from=build /repo/apps/website/dist /usr/share/nginx/html
COPY apps/website/deploy/default.conf.template /etc/nginx/templates/default.conf.template
COPY deploy/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --chmod=0755 apps/website/deploy/40-runtime-config.sh /docker-entrypoint.d/40-runtime-config.sh
COPY --chmod=0755 deploy/41-android-asset-links.sh /docker-entrypoint.d/41-android-asset-links.sh
EXPOSE 80
