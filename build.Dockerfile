FROM node:16-alpine
WORKDIR /build

RUN apk add g++ make py3-pip

COPY ./apps ./apps
COPY ./libs ./libs
COPY ./tools ./tools

COPY package.json .
COPY package-lock.json .
COPY nx.json .
COPY workspace.json .
COPY tsconfig.base.json .

# full NPM install
RUN npm install
RUN npx nx affected:build --all --configuration production --verbose

# minimal NPM install
RUN rm -rf node_modules
RUN npm install --omit dev
