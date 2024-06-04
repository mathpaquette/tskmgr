FROM node:20-alpine as build
WORKDIR /build

RUN apk add --no-cache python3 make g++

COPY ./apps ./apps
COPY ./libs ./libs
COPY ./tools ./tools

COPY package.json .
COPY package-lock.json .
COPY nx.json .
COPY tsconfig.base.json .

RUN npm install
RUN npx nx run db:build:production --verbose
RUN npm install --omit dev

FROM node:18-alpine
WORKDIR /app

COPY --from=build /build/dist/libs/db ./dist/libs/db
COPY --from=build --chown=node:node /build/node_modules node_modules/

CMD ["npx", "typeorm", "migration:run", "-d", "dist/libs/db/src/lib/data-source.js"]
