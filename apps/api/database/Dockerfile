FROM node:16-alpine
WORKDIR /app

COPY --from=tskmgr-build:latest --chown=node:node build/node_modules node_modules/

ENV NODE_ENV=production
USER node
EXPOSE 3333
CMD ["npm", "run", "typeorm:migration:run"]
