npm install
npx nx run-many --target=build --all --parallel=4
docker compose -f docker-compose.build.yml build

# docker-compose up
# docker run -p 3333:3333 mathpaquette/tskmgr-api
# docker run -p 8080:8080 mathpaquette/tskmgr-frontend
