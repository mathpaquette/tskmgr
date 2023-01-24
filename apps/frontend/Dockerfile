FROM nginxinc/nginx-unprivileged
WORKDIR /usr/share/nginx/html

COPY --from=tskmgr-build:latest apps/frontend/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=tskmgr-build:latest dist/apps/frontend .
