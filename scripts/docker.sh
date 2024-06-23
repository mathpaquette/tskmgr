#!/usr/bin/env bash

# Usage:
# DOCKER_PUSH=true sh scripts/docker.sh

export DOCKERHUB_USER=mathpaquette
export TSKMGR_VERSION=$(node -p "require('./package.json').version")

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
