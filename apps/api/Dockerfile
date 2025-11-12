FROM node:lts-alpine as build
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
RUN npx nx run api:build:production --verbose
RUN npm install --omit dev

FROM node:lts-alpine
WORKDIR /app

COPY --from=build --chown=node:node /build/dist/apps/api ./api
COPY --from=build --chown=node:node /build/node_modules node_modules/

RUN mkdir files
RUN chown node:node files

ENV NODE_ENV=production
USER node
EXPOSE 3333
CMD ["node", "api/main.js"]
