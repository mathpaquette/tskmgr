FROM node:lts-alpine
WORKDIR /app

COPY /dist/libs/db ./dist/libs/db
COPY --chown=node:node /node_modules node_modules/

CMD ["npx", "typeorm", "migration:run", "-d", "dist/libs/db/src/lib/data-source.js"]
