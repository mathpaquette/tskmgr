#!/usr/bin/env bash

set -e

# Usage:
# TSKMGR_VERSION=0.0.0 DOCKER_PUSH=true sh scripts/docker.sh

DOCKERHUB_USER=mathpaquette
TSKMGR_VERSION=${TSKMGR_VERSION:-0.0.0}

jq ".version = \"$TSKMGR_VERSION\"" package.json > package.json.tmp && mv package.json.tmp package.json

echo "Building Docker images for tskmgr v${TSKMGR_VERSION}"
sleep 3

docker compose -f docker-compose.build.yml build

docker tag $DOCKERHUB_USER/tskmgr-migrations:$TSKMGR_VERSION $DOCKERHUB_USER/tskmgr-migrations:latest
docker tag $DOCKERHUB_USER/tskmgr-api:$TSKMGR_VERSION $DOCKERHUB_USER/tskmgr-api:latest
docker tag $DOCKERHUB_USER/tskmgr-frontend:$TSKMGR_VERSION $DOCKERHUB_USER/tskmgr-frontend:latest

if [ -n "$DOCKER_PUSH" ]; then
  echo "Pushing images to Docker Hub..."
  sleep 3

  docker push $DOCKERHUB_USER/tskmgr-migrations:$TSKMGR_VERSION
  docker push $DOCKERHUB_USER/tskmgr-api:$TSKMGR_VERSION
  docker push $DOCKERHUB_USER/tskmgr-frontend:$TSKMGR_VERSION

  docker push $DOCKERHUB_USER/tskmgr-migrations:latest
  docker push $DOCKERHUB_USER/tskmgr-api:latest
  docker push $DOCKERHUB_USER/tskmgr-frontend:latest
fi
