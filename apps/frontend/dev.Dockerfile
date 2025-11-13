FROM nginxinc/nginx-unprivileged:1-alpine
WORKDIR /usr/share/nginx/html

COPY /apps/frontend/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY /dist/apps/frontend/browser .
