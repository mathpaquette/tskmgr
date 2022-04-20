export TSKMGR_VERSION=`node -p "require('./package.json').version"`
echo $TSKMGR_VERSION

npm install
npx nx run-many --target=build --all --parallel=4
docker compose -f docker-compose.build.yml build

# docker tag mathpaquette/tskmgr-api:$TSKMGR_VERSION mathpaquette/tskmgr-api:latest
# docker tag mathpaquette/tskmgr-frontend:$TSKMGR_VERSION mathpaquette/tskmgr-frontend:latest

# docker push mathpaquette/tskmgr-api --all-tags
# docker push mathpaquette/tskmgr-frontend --all-tags

# docker-compose up
# docker run -p 3333:3333 mathpaquette/tskmgr-api
# docker run -p 8080:8080 mathpaquette/tskmgr-frontend
