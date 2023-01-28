FROM tskmgr-build-dev:latest
WORKDIR /build

RUN rm -rf node_modules
RUN npm install --omit dev
