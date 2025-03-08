FROM node:lts-alpine
WORKDIR /app

COPY --chown=node:node /dist/apps/api ./api
COPY --chown=node:node /node_modules node_modules/

RUN mkdir files
RUN chown node:node files

ENV NODE_ENV=production
USER node
EXPOSE 3333
CMD ["node", "api/main.js"]
