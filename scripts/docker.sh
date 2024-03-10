#!/usr/bin/env bash

DOCKERHUB_USER=mathpaquette
TSKMGR_VERSION=$(node -p "require('./package.json').version")

echo "Building docker images for tskmgr v${TSKMGR_VERSION}"
sleep 3

docker compose -f docker-compose.build.yml build

docker tag ${DOCKERHUB_USER}/tskmgr-migrations:$TSKMGR_VERSION ${DOCKERHUB_USER}/tskmgr-migrations:latest
docker tag ${DOCKERHUB_USER}/tskmgr-api:$TSKMGR_VERSION ${DOCKERHUB_USER}/tskmgr-api:latest
docker tag ${DOCKERHUB_USER}/tskmgr-frontend:$TSKMGR_VERSION ${DOCKERHUB_USER}/tskmgr-frontend:latest

docker push ${DOCKERHUB_USER}/tskmgr-migrations:$TSKMGR_VERSION
docker push ${DOCKERHUB_USER}/tskmgr-migrations:latest

docker push ${DOCKERHUB_USER}/tskmgr-api:$TSKMGR_VERSION
docker push ${DOCKERHUB_USER}/tskmgr-api:latest

docker push ${DOCKERHUB_USER}/tskmgr-frontend:$TSKMGR_VERSION
docker push ${DOCKERHUB_USER}/tskmgr-frontend:latest

# docker compose -f docker-compose.yml up
# docker-compose up
# docker run -p 3333:3333 mathpaquette/tskmgr-api
# docker run -p 8080:8080 mathpaquette/tskmgr-frontend
