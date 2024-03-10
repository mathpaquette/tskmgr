FROM node:20-alpine as build
WORKDIR /build

RUN apk add --no-cache python3 make g++

COPY ./apps ./apps
COPY ./libs ./libs
COPY ./tools ./tools

COPY package.json .
COPY package-lock.json .
COPY nx.json .
COPY workspace.json .
COPY tsconfig.base.json .

RUN npm install
RUN npx nx affected:build --all --configuration=production --verbose
RUN npm install --omit dev

FROM nginxinc/nginx-unprivileged:1-alpine
WORKDIR /usr/share/nginx/html

COPY --from=build /build/apps/frontend/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /build/dist/apps/frontend .
